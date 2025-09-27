"use server"

import "server-only"

import { revalidatePath, revalidateTag } from "next/cache"
import { createClient } from "@/db/supabase/server"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"

import { scrapeUrl } from "@/lib/scraper"
import {
  batchToSnakeCase,
  batchToTagFormat,
  toSnakeCase,
} from "@/lib/tag-label-utils"

import { getAIEnrichmentPrompt } from "./prompt"
import { enrichmentSchema, schema } from "./schema"

// Configuration object
const config = {
  aiEnrichmentEnabled: true,
  aiModel: (() => {
    if (process.env.ANTHROPIC_API_KEY) {
      return anthropic("claude-3-5-haiku-20241022")
    } else if (process.env.OPENAI_API_KEY) {
      return openai("gpt-5-nano")
    } else {
      throw new Error(
        "Either ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable must be set"
      )
    }
  })(),
  storageBucket: "product-logos",
  cacheControl: "3600",
  allowNewTags: true,
  allowNewLabels: true,
  allowNewCategories: true,
}

export type FormState = {
  message: string
  fields?: Record<string, string>
  issues: string[]
}

type Enrichment = {
  tags: string[]
  labels: string[]
}

// Helper function to check if an error has a message
function isErrorWithMessage(error: unknown): error is Error {
  return typeof error === "object" && error !== null && "message" in error
}

// Uploads the logo file to the storage bucket
async function uploadLogoFile(
  db: any,
  logoFile: File,
  codename: string
): Promise<string> {
  const fileExt = logoFile.name.split(".").pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${codename}/${fileName}`
  const fileBuffer = await logoFile.arrayBuffer()

  const { error: uploadError } = await db.storage
    .from(config.storageBucket)
    .upload(filePath, Buffer.from(fileBuffer), {
      cacheControl: config.cacheControl,
      upsert: false,
    })

  if (uploadError) {
    console.error(`Error uploading file: ${uploadError.message}`)
    throw new Error(uploadError.message)
  }

  const publicUrlResponse = db.storage
    .from(config.storageBucket)
    .getPublicUrl(filePath)

  return publicUrlResponse.data.publicUrl
}

// Inserts a new entry if it does not already exist
async function insertIfNotExists(
  db: any,
  table: string,
  name: string
): Promise<void> {
  const { error } = await db
    .from(table)
    .insert([{ name }], { onConflict: "name" })

  if (error && !error.message.includes("duplicate key value")) {
    console.error(`Error inserting into ${table}: ${error.message}`)
    throw new Error(`Error inserting into ${table}: ${error.message}`)
  }
}

export async function submitProductFormAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = Object.fromEntries(formData.entries())

  const logoFile = formData.get("images") as File

  const productState = await createProduct(data, logoFile)

  if (productState.message === "Tool submitted successfully") {
    revalidatePath("/", "page")
    revalidateTag("product-filters")
  }

  return productState
}

export async function createProduct(
  data: { [key: string]: FormDataEntryValue },
  logoFile?: File
): Promise<FormState> {
  const db = await createClient()
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    console.error("Form validation failed")
    const fields: Record<string, string> = {}
    for (const key of Object.keys(data)) {
      fields[key] = data[key].toString()
    }
    return {
      message: "Invalid form data",
      fields,
      issues: parsed.error.issues.map((issue) => issue.message),
    }
  }

  try {
    // Check file size before processing
    if (logoFile && logoFile.size > 8 * 1024 * 1024) {
      // 8MB limit
      return {
        message: "File size too large",
        issues: [
          "Logo file must be smaller than 8MB. Please compress your image and try again.",
        ],
      }
    }

    const { data: authData, error: authError } = await db.auth.getUser()
    if (authError || !authData.user) {
      console.error("User authentication failed")
      throw new Error("User authentication failed")
    }
    const user = authData.user

    // Fetch user profile data from the database
    const { data: userProfile, error: profileError } = await db
      .from("users")
      .select("full_name, twitter_handle")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      // Don't throw error, just log it and continue with auth metadata
    }

    let logoUrl = ""
    if (logoFile) {
      try {
        logoUrl = await uploadLogoFile(db, logoFile, parsed.data.codename)
      } catch (uploadError) {
        console.error("Logo upload failed:", uploadError)
        return {
          message: "Logo upload failed",
          issues: [
            isErrorWithMessage(uploadError)
              ? uploadError.message
              : "Failed to upload logo. Please try again with a smaller file.",
          ],
        }
      }
    }

    let tags: Enrichment["tags"] = []
    let labels: Enrichment["labels"] = ["unlabeled"]

    if (config.aiEnrichmentEnabled) {
      try {
        const scrapedData = await scrapeUrl(parsed.data.productWebsite)
        const enrichmentPrompt = getAIEnrichmentPrompt(
          parsed.data.codename,
          parsed.data.categories,
          parsed.data.description,
          `${scrapedData.title} ${
            scrapedData.metaDescription
          } ${scrapedData.content.slice(0, 900)}`
        )
        const { object: enrichment } = await generateObject({
          model: config.aiModel,
          schema: enrichmentSchema,
          prompt: enrichmentPrompt,
        })

        // Convert tags to preserve hyphens, labels to snake_case for database storage
        const normalizedTags = batchToTagFormat(enrichment.tags)
        const normalizedLabels = batchToSnakeCase(
          enrichment.labels ?? ["unlabeled"]
        )

        tags = normalizedTags
        labels = normalizedLabels

        if (config.allowNewTags) {
          for (const tag of normalizedTags) {
            await insertIfNotExists(db, "tags", tag)
          }
        }

        if (config.allowNewLabels) {
          for (const label of normalizedLabels) {
            await insertIfNotExists(db, "labels", label)
          }
        }
      } catch (enrichmentError) {
        console.error("AI enrichment failed:", enrichmentError)
        // Continue without enrichment rather than failing the entire submission
        tags = []
        labels = batchToSnakeCase(["unlabeled"])
      }
    }

    if (config.allowNewCategories) {
      const normalizedCategory = toSnakeCase(parsed.data.categories)
      await insertIfNotExists(db, "categories", normalizedCategory)
    }

    // Build product data with fallbacks for missing profile information
    const productData = {
      full_name:
        userProfile?.full_name ||
        user.user_metadata?.full_name ||
        "Unknown User",
      email: user.email || "",
      twitter_handle:
        userProfile?.twitter_handle || user.user_metadata?.twitter_handle || "",
      product_website: parsed.data.productWebsite,
      codename: parsed.data.codename,
      punchline: parsed.data.punchline,
      description: parsed.data.description,
      logo_src: logoUrl,
      categories: config.allowNewCategories
        ? toSnakeCase(parsed.data.categories)
        : parsed.data.categories,
      user_id: user.id,
      tags,
      labels,
    }

    const { error } = await db.from("products").insert([productData]).select()

    if (error) {
      console.error(`Error inserting product data: ${error.message}`)
      throw new Error(error.message)
    }

    return { message: "Tool submitted successfully", issues: [] }
  } catch (error) {
    console.error(
      `Submission failed: ${
        isErrorWithMessage(error) ? error.message : "Unknown error occurred"
      }`
    )

    // Check for specific error types and provide better messages
    let errorMessage = "Unknown error occurred"
    if (isErrorWithMessage(error)) {
      if (
        error.message.includes("Body exceeded") ||
        error.message.includes("413")
      ) {
        errorMessage =
          "File size too large. Please compress your image to under 8MB and try again."
      } else if (error.message.includes("authentication")) {
        errorMessage =
          "Authentication failed. Please log in again and try submitting."
      } else if (error.message.includes("storage")) {
        errorMessage =
          "Failed to upload logo. Please try again with a smaller file."
      } else {
        errorMessage = error.message
      }
    }

    return {
      message: `Submission failed: ${errorMessage}`,
      issues: [errorMessage],
    }
  }
}
