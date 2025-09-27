// index.ts

import path from "path"
import dotenv from "dotenv"
import fs from "fs-extra"
import pMap from "p-map"

import { cheapFastModelCalls, enrichData, smartModelCalls } from "./enrichment"
import { EnrichedDataItem, RawDataItem } from "./schemas"

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") })

// Initialize the enrichment function with the AI client
const enrich = enrichData()

// Improved logging utility for enrichment stage
class EnrichmentLogger {
  private startTime: number
  private currentStep: string = ""
  private stepStartTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  startStep(stepName: string) {
    this.currentStep = stepName
    this.stepStartTime = Date.now()
    console.log(`\n🔍 ${stepName}`)
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
    modelCalls: number
  }) {
    console.log("\n" + "=".repeat(50))
    console.log("📊 ENRICHMENT SUMMARY")
    console.log("=".repeat(50))
    console.log(`Total Items: ${stats.total}`)
    console.log(`✅ Enriched: ${stats.success}`)
    console.log(`❌ Failed: ${stats.failed}`)
    console.log(`🤖 Model Calls: ${stats.modelCalls}`)
    console.log(`⏱️  Duration: ${stats.duration}ms`)
    console.log(
      `📈 Success Rate: ${Math.round((stats.success / stats.total) * 100)}%`
    )
    console.log("=".repeat(50))
  }
}

const logger = new EnrichmentLogger()

// Function to find the latest raw data file in the __data__ directory
const findLatestRawDataFile = async (): Promise<string> => {
  const dataDir = path.join(__dirname, "../stage-1-crawl/__data__")

  try {
    const files = await fs.promises.readdir(dataDir)
    const rawFiles = files.filter(
      (file) => file.startsWith("raw-") && file.endsWith(".json")
    )
    rawFiles.sort()
    const latestFile = rawFiles.length > 0 ? rawFiles[rawFiles.length - 1] : ""
    if (latestFile) {
      logger.success(`Found raw data file: ${latestFile}`)
    }
    return latestFile
  } catch (error) {
    logger.error(
      `Error finding latest raw data file: ${(error as Error).message}`
    )
    return ""
  }
}

// Function to process and enrich raw data
const processRawData = async (data: RawDataItem[], version: string) => {
  logger.startStep("Data Enrichment")
  logger.info(`Processing ${data.length} items with AI models...`)

  const enrichedData: EnrichedDataItem[] = []
  const failedData: RawDataItem[] = []
  let processedCount = 0

  // Process each item with concurrency limit
  await pMap(
    data,
    async (item) => {
      try {
        const enrichedItem = await enrich(item)
        enrichedData.push(enrichedItem)
        processedCount++
        logger.progress(processedCount, data.length, item.codename)
      } catch (error) {
        logger.warning(
          `Failed to enrich ${item.codename}: ${(error as Error).message}`
        )
        failedData.push(item)
        processedCount++
        logger.progress(processedCount, data.length, item.codename)
      }
    },
    { concurrency: 2 }
  )

  // Save enriched and failed data
  await saveRawData(enrichedData, version, "enriched")
  if (failedData.length > 0) {
    await saveRawData(failedData, version, "failed-enriched")
  }

  logger.endStep()
  return {
    total: data.length,
    success: enrichedData.length,
    failed: failedData.length,
  }
}

// Function to save data to a JSON file
const saveRawData = async (data: any[], version: string, type: string) => {
  const filePath = path.join(__dirname, `/__data__/${type}-${version}.json`)

  try {
    await fs.writeJson(filePath, data, { spaces: 2 })
    logger.success(`Data saved to: ${type}-${version}.json`)
  } catch (error) {
    logger.error(
      `Error saving data to ${filePath}: ${(error as Error).message}`
    )
  }
}

// Main function to enrich the latest raw data
export const enrichLatestData = async () => {
  const startTime = Date.now()

  try {
    const latestRawDataFile = await findLatestRawDataFile()

    if (!latestRawDataFile) {
      throw new Error("No raw data files found")
    }

    const rawData: RawDataItem[] = await fs.readJson(
      path.join(__dirname, "../stage-1-crawl/__data__", latestRawDataFile)
    )

    const version = new Date().toISOString().replace(/[:-]/g, "").split(".")[0]

    const stats = await processRawData(rawData, version)

    const totalDuration = Date.now() - startTime
    const totalModelCalls = cheapFastModelCalls + smartModelCalls

    logger.summary({
      ...stats,
      duration: totalDuration,
      modelCalls: totalModelCalls,
    })

    // Log model call breakdown
    logger.info(`Model Call Breakdown:`)
    logger.info(
      `  • Fast models (claude-3-5-haiku-20241022/gpt-5-nano): ${cheapFastModelCalls}`
    )
    logger.info(
      `  • Smart models (claude-sonnet-4-20250514/gpt-5-mini): ${smartModelCalls}`
    )
    logger.info(`  • Total calls: ${totalModelCalls}`)

    logger.success("Enrichment stage completed successfully!")
  } catch (error) {
    logger.error(`Enrichment failed: ${(error as Error).message}`)
    throw error
  }
}
