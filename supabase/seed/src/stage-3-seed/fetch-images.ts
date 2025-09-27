import fs from "fs"
import path from "path"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") })

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

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SECRET_KEY ?? "" // Use a service role key to bypass RLS for admin actions
)

export async function uploadImageFromUrl(
  bucketName: string,
  url: string,
  filePathFileName: string,
  fallbackFilePath: string,
  retries: number = 3
): Promise<string> {
  let fileName = filePathFileName
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Reduced logging - only show URL for failed attempts
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePathFileName, Buffer.from(buffer), {
          cacheControl: "3600",
          upsert: true,
        })

      if (error) {
        throw new Error(error.message)
      }

      // Only log success for non-placeholder images
      if (!url.includes("placeholder")) {
        console.log(`✅ Uploaded: ${filePathFileName}`)
      }
      return fileName
    } catch (err) {
      const error = err as Error
      if (attempt === retries) {
        // Use placeholder image on final failure
        const fileBuffer = fs.readFileSync(fallbackFilePath)
        fileName = filePathFileName

        const { error: fallbackError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileBuffer, {
            cacheControl: "3600",
            upsert: true,
          })

        if (fallbackError) {
          throw new Error(fallbackError.message)
        }

        console.log(
          `⚠️  Used placeholder for: ${url.split("/").pop() || "unknown"}`
        )
        return fileName
      }
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      )
    }
  }
  throw new Error(
    `Failed to upload image from URL: ${url} after ${retries} attempts`
  )
}

export async function getPublicUrl(
  bucketName: string,
  filePath: string
): Promise<string> {
  // Reduced logging - only show for debugging if needed
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
  if (!data) {
    throw new Error(`Failed to get public URL for filePath: ${filePath}`)
  }
  return data.publicUrl
}
