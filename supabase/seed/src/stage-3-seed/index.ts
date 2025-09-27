import fs from "fs"
import path from "path"
import { createClient, PostgrestError } from "@supabase/supabase-js"
import dotenv from "dotenv"

import { getPublicUrl, uploadImageFromUrl } from "./fetch-images"

dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") })

// Auto-fetch admin UUID from the database
let ADMIN_UUID_FOR_SEEDING: string | null = null

// Utility functions for handling tags and labels
function normalizeEntityName(name: string): string {
  // Decode URL-encoded strings like "design%20systems" -> "design systems"
  try {
    return decodeURIComponent(name)
  } catch {
    // If decoding fails, return the original name
    return name
  }
}

function sanitizeEntityName(name: string): string {
  // Normalize the name first
  let normalized = normalizeEntityName(name)

  // Trim whitespace
  normalized = normalized.trim()

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, " ")

  // Handle camelCase and PascalCase by inserting spaces before capital letters
  // This converts "OnePageDesign" to "One Page Design"
  normalized = normalized.replace(/([a-z])([A-Z])/g, "$1 $2")

  // Handle consecutive capitals (like "UI" or "API") by adding spaces
  // This converts "UIComponents" to "UI Components"
  normalized = normalized.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")

  // Convert to snake_case for database storage
  normalized = normalized
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, "") // Remove special characters except underscores
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores

  return normalized
}

// Utility function to convert snake_case back to display format
function snakeCaseToDisplay(snakeCase: string): string {
  return snakeCase
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .trim()
}

// Utility function to sanitize file names for storage
function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except letters, numbers, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length to prevent extremely long file names
}

// Improved logging utility
class SeedLogger {
  private startTime: number
  private currentStep: string = ""
  private stepStartTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  startStep(stepName: string) {
    this.currentStep = stepName
    this.stepStartTime = Date.now()
    console.log(`\n🚀 ${stepName}`)
    console.log("─".repeat(stepName.length + 3))
  }

  endStep() {
    const duration = Date.now() - this.stepStartTime
    console.log(`✅ ${this.currentStep} completed in ${duration}ms`)
  }

  info(message: string) {
    console.log(`ℹ️  ${message}`)
  }

  success(message: string) {
    console.log(`✅ ${message}`)
  }

  warning(message: string) {
    console.log(`⚠️  ${message}`)
  }

  error(message: string) {
    console.log(`❌ ${message}`)
  }

  progress(current: number, total: number, label: string = "") {
    const percentage = Math.round((current / total) * 100)
    const barLength = 20
    const filledLength = Math.round((percentage / 100) * barLength)
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength)
    const labelText = label ? ` (${label})` : ""
    console.log(`📊 [${bar}] ${percentage}%${labelText} - ${current}/${total}`)
  }

  summary(stats: {
    total: number
    success: number
    failed: number
    duration: number
  }) {
    console.log("\n" + "=".repeat(50))
    console.log("📊 SEEDING SUMMARY")
    console.log("=".repeat(50))
    console.log(`Total Products: ${stats.total}`)
    console.log(`✅ Successful: ${stats.success}`)
    console.log(`❌ Failed: ${stats.failed}`)
    console.log(`⏱️  Duration: ${stats.duration}ms`)
    console.log(
      `📈 Success Rate: ${Math.round((stats.success / stats.total) * 100)}%`
    )
    console.log("=".repeat(50))
  }
}

const logger = new SeedLogger()

interface RawData {
  full_name: string
  product_website: string
  codename: string
  logo_src: string
  punchline: string
  description: string
  tags: string[]
  labels: string[]
  categories: string
}

interface FailedData extends RawData {
  error: string
}

interface SuccessfulData {
  view_count: number
  approved: boolean
  logo_src: string
  user_id: string
  full_name: string
  twitter_handle: string
  email: string
  codename: string
  punchline: string
  categories: string
  tags: string[]
  labels: string[]
  description: string
  product_website: string
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SECRET_KEY ?? "" // Use a service role key to bypass RLS for admin actions
)

// Function to get the first admin user ID
async function getAdminUserId(): Promise<string> {
  try {
    logger.startStep("Fetching Admin User")
    logger.info("Looking for admin user in database...")

    // First try to use the user_admin_status view (newer method)
    try {
      const { data, error } = await supabase
        .from("user_admin_status")
        .select("id")
        .eq("is_admin", true)
        .order("user_number", { ascending: true })
        .limit(1)
        .single()

      if (!error && data && data.id) {
        logger.success(`Found admin user: ${data.id.substring(0, 8)}...`)
        logger.endStep()
        return data.id
      }
    } catch (viewError) {
      logger.warning(
        "user_admin_status view not available, trying direct query..."
      )
    }

    // Fallback: Direct query to auth.users table
    const { data, error } = await supabase
      .from("auth.users")
      .select("id")
      .eq("raw_app_meta_data->>claims_admin", "true")
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      throw new Error(`Failed to fetch admin user: ${error.message}`)
    }

    if (!data || !data.id) {
      throw new Error("No admin user found in the database")
    }

    logger.success(`Found admin user: ${data.id.substring(0, 8)}...`)
    logger.endStep()
    return data.id
  } catch (error) {
    logger.error(
      `Failed to get admin user ID: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
    throw error
  }
}

async function getOrCreateEntity(
  table: string,
  name: string,
  skipErrors: string[] = []
): Promise<string | null> {
  try {
    // Reduced logging for entity creation
    const { data } = await supabase
      .from(table)
      .select("id")
      .eq("name", name)
      .single()

    if (data) {
      return data.id
    }

    // Use upsert to handle race conditions - if another process creates it first, we'll get the ID
    const { data: newData, error: insertError } = await supabase
      .from(table)
      .upsert({ name }, { onConflict: "name" })
      .select("id")
      .single()

    if (insertError) {
      // If upsert failed, try to get the entity again (it might have been created by another process)
      const { data: retryData, error: retryError } = await supabase
        .from(table)
        .select("id")
        .eq("name", name)
        .single()

      if (retryError) {
        throw new Error(
          `Failed to create or retrieve ${name}: ${insertError.message}`
        )
      }

      return retryData.id
    }

    return newData.id
  } catch (error) {
    if (skipErrors.includes((error as Error).message)) {
      return null
    } else {
      throw error
    }
  }
}

async function seedImagesAndProducts(
  rawData: RawData[]
): Promise<{ total: number; success: number; failed: number }> {
  const placeholderFilePath = path.resolve(
    __dirname,
    "../../images/placeholder.png"
  )

  logger.startStep("Processing Products & Images")
  logger.info(`Processing ${rawData.length} products...`)

  const productData = await Promise.all(
    rawData.map(async (data, i) => {
      const safeFileName = sanitizeFileName(data.codename)
      const fileName = `seed-${safeFileName}-${i}-logo.png`

      try {
        const uploadedFileName = await uploadImageFromUrl(
          "product-logos",
          data.logo_src,
          fileName,
          placeholderFilePath
        )

        const logoUrl = await getPublicUrl("product-logos", uploadedFileName)

        // Process labels and tags silently
        await Promise.all(
          data.labels.map(
            async (label) =>
              await getOrCreateEntity("labels", sanitizeEntityName(label), [
                "duplicate key value",
              ])
          )
        )
        await Promise.all(
          data.tags.map(
            async (tag) =>
              await getOrCreateEntity("tags", sanitizeEntityName(tag), [
                "duplicate key value",
              ])
          )
        )
        await getOrCreateEntity(
          "categories",
          sanitizeEntityName(data.categories)
        )

        return {
          view_count: 0,
          approved: true,
          logo_src: logoUrl,
          user_id: ADMIN_UUID_FOR_SEEDING,
          full_name: data.full_name,
          twitter_handle: "@nolansym",
          email: "contact@example.com",
          codename: sanitizeEntityName(data.codename),
          punchline: data.punchline,
          categories: sanitizeEntityName(data.categories),
          tags: data.tags.map(sanitizeEntityName),
          labels: data.labels.map(sanitizeEntityName),
          description: data.description,
          product_website: data.product_website,
        } as SuccessfulData
      } catch (err) {
        const error = err as Error | PostgrestError
        logger.warning(
          `Failed to process ${data.codename}: ${
            "message" in error ? error.message : "Unknown error"
          }`
        )
        return {
          ...data,
          error: "message" in error ? error.message : "Unknown error",
        } as FailedData
      }
    })
  )

  const successfulProducts = productData.filter(
    (product): product is SuccessfulData => !(product as FailedData).error
  )
  const failedProducts = productData.filter(
    (product): product is FailedData => !!(product as FailedData).error
  )

  // Remove duplicates within the batch by codename
  const uniqueProductData = Array.from(
    new Map(successfulProducts.map((item) => [item.codename, item])).values()
  )

  logger.info(
    `Prepared ${uniqueProductData.length} unique products for database insertion`
  )
  logger.info(`Failed to process ${failedProducts.length} products`)

  logger.startStep("Database Insertion")
  // Insert or update data in batches to improve performance
  const batchSize = 50
  for (let i = 0; i < uniqueProductData.length; i += batchSize) {
    const batch = uniqueProductData.slice(i, i + batchSize)
    const { error } = await supabase
      .from("products")
      .upsert(batch as any, { onConflict: "codename" })

    if (error) {
      logger.error(
        `Failed to insert batch ${Math.floor(i / batchSize) + 1}: ${
          (error as PostgrestError).message
        }`
      )
    } else {
      logger.progress(
        Math.min(i + batchSize, uniqueProductData.length),
        uniqueProductData.length,
        `Batch ${Math.floor(i / batchSize) + 1}`
      )
    }
  }

  // Write failed seedings to a file
  const failedSeedFilePath = path.resolve(
    __dirname,
    "__data__/failed-seed.json"
  )
  fs.writeFileSync(failedSeedFilePath, JSON.stringify(failedProducts, null, 2))

  if (failedProducts.length > 0) {
    logger.warning(`Failed products written to: ${failedSeedFilePath}`)
  }

  logger.endStep()
  return {
    total: rawData.length,
    success: successfulProducts.length,
    failed: failedProducts.length,
  }
}

const findLatestEnrichedDataFile = async (): Promise<string> => {
  const dataDir = path.join(__dirname, "../stage-2-enrich/__data__")

  logger.info("Finding latest enriched data file...")
  try {
    const files = await fs.promises.readdir(dataDir)
    const enrichedFiles = files.filter(
      (file) => file.startsWith("enriched-") && file.endsWith(".json")
    )
    enrichedFiles.sort()
    const latestFile =
      enrichedFiles.length > 0 ? enrichedFiles[enrichedFiles.length - 1] : ""
    if (latestFile) {
      logger.success(`Found: ${latestFile}`)
    } else {
      logger.error("No enriched data files found")
    }
    return latestFile
  } catch (error) {
    logger.error(
      `Error finding latest enriched data file: ${(error as Error).message}`
    )
    return ""
  }
}

// Main function to seed the database
export const seedDatabase = async () => {
  const startTime = Date.now()
  logger.startStep("Database Seeding")
  logger.info("Initializing seed process...")

  // Get the admin user ID first
  try {
    ADMIN_UUID_FOR_SEEDING = await getAdminUserId()
  } catch (error) {
    logger.error("Failed to get admin user ID. Aborting seed process.")
    return
  }

  const latestEnrichedDataFile = await findLatestEnrichedDataFile()

  if (!latestEnrichedDataFile) {
    logger.error("No enriched data files found. Aborting seed process.")
    return
  }

  const rawDataFilePath = path.join(
    __dirname,
    "../stage-2-enrich/__data__",
    latestEnrichedDataFile
  )
  logger.info(`Reading data from: ${latestEnrichedDataFile}`)

  const rawData: RawData[] = JSON.parse(
    fs.readFileSync(rawDataFilePath, "utf-8")
  )

  const stats = await seedImagesAndProducts(rawData)

  const totalDuration = Date.now() - startTime
  logger.endStep()

  logger.summary({
    total: stats.total,
    success: stats.success,
    failed: stats.failed,
    duration: totalDuration,
  })
  logger.success("Database seed process completed successfully!")
}
