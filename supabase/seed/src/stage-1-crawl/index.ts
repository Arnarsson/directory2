import path from "path"
import { Dataset, PuppeteerCrawler, PuppeteerCrawlingContext } from "crawlee"
import fs from "fs-extra"
import puppeteerExtra from "puppeteer-extra"
import stealthPlugin from "puppeteer-extra-plugin-stealth"

// Set CRAWLEE_STORAGE_DIR to a relative path
process.env.CRAWLEE_STORAGE_DIR = path.join(__dirname, "storage")

// Use the stealth plugin
puppeteerExtra.use(stealthPlugin())

// Improved logging utility for crawl stage
class CrawlLogger {
  private startTime: number
  private currentStep: string = ""
  private stepStartTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  startStep(stepName: string) {
    this.currentStep = stepName
    this.stepStartTime = Date.now()
    console.log(`\n🕷️  ${stepName}`)
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
    scraped: number
    failed: number
    duration: number
  }) {
    console.log("\n" + "=".repeat(50))
    console.log("📊 CRAWLING SUMMARY")
    console.log("=".repeat(50))
    console.log(`Total URLs: ${stats.total}`)
    console.log(`✅ Scraped: ${stats.scraped}`)
    console.log(`❌ Failed: ${stats.failed}`)
    console.log(`⏱️  Duration: ${stats.duration}ms`)
    console.log(
      `📈 Success Rate: ${Math.round((stats.scraped / stats.total) * 100)}%`
    )
    console.log("=".repeat(50))
  }
}

const logger = new CrawlLogger()

// Function to save the scraped data
const saveRawData = async (data: any[], version: string) => {
  const filePath = path.join(__dirname, "__data__", `raw-${version}.json`)

  try {
    await fs.writeJson(filePath, data, { spaces: 2 })
    logger.success(`Raw data saved to: raw-${version}.json`)
  } catch (error) {
    logger.error(`Error saving raw data: ${(error as Error).message}`)
  }
}

// Function to handle failed requests
const failedRequestHandler = async ({
  request,
  error,
  log,
}: PuppeteerCrawlingContext) => {
  // @ts-ignore
  log.error(`Request ${request.url} failed with error:`, error)

  // Implement a custom retry mechanism
  if (request.retryCount < 3) {
    log.info(
      `Retrying request ${request.url} (attempt ${request.retryCount + 1})`
    )
    await crawler.addRequests([request])
  } else {
    log.error(
      `Request ${request.url} failed after ${request.retryCount} retries`
    )
  }
}

// Create an instance of the PuppeteerCrawler class
const crawler = new PuppeteerCrawler({
  launchContext: {
    // Specify to use puppeteer-extra as the launcher
    launcher: puppeteerExtra,
    launchOptions: {
      headless: true,
    },
  },
  maxConcurrency: 20,
  async requestHandler({ request, page, log }) {
    log.info(`Processing ${request.url}...`)

    // Scrape the data
    const title = await page.title()
    const description =
      (await page.$eval("meta[name='description']", (el: Element) =>
        el.getAttribute("content")
      )) || "No Description"
    const codename = title.replace(/\s+/g, "-").toLowerCase()

    // Extract the image source
    let logo_src =
      (await page.$eval("meta[property='og:image']", (el: Element) =>
        el.getAttribute("content")
      )) ||
      (await page.$eval("meta[name='twitter:image']", (el: Element) =>
        el.getAttribute("content")
      )) ||
      (await page.$eval("img", (el: Element) => el.getAttribute("src"))) ||
      "./icon.png"

    // Make logo_src a relative URL if it starts with a dot
    if (!logo_src.startsWith("http")) {
      logo_src = new URL(logo_src, request.url).toString()
    }

    // Extract h1, h2, and h3 content
    const h1s = await page.$$eval("h1", (elements) =>
      elements.map((el) => el.textContent).filter((text) => text)
    )
    const h2s = await page.$$eval("h2", (elements) =>
      elements.map((el) => el.textContent).filter((text) => text)
    )
    const h3s = await page.$$eval("h3", (elements) =>
      elements.map((el) => el.textContent).filter((text) => text)
    )

    const site_content = [...h1s, ...h2s, ...h3s].join(" ")

    const rawDataItem = {
      full_name: "seed-admin-user",
      product_website: request.url,
      codename: codename,
      logo_src: logo_src,
      punchline: title,
      description: description.substring(0, 500),
      site_content: site_content,
    }

    log.info(`Scraped data from ${request.url}:`, rawDataItem)

    // Add the scraped data to the dataset
    await Dataset.pushData(rawDataItem)
  },

  failedRequestHandler,
})

export const crawlAndSave = async (startUrls: string[]) => {
  const startTime = Date.now()
  const version = new Date().toISOString().replace(/[:-]/g, "").split(".")[0]

  try {
    logger.startStep("Web Crawling")
    logger.info(`Starting crawler with ${startUrls.length} URLs`)

    await crawler.addRequests(startUrls)
    logger.info("Running crawler...")

    await crawler.run()

    // Retrieve the scraped data from the dataset
    const { items } = await Dataset.getData()
    const totalDuration = Date.now() - startTime

    logger.success(`Crawler finished. Scraped ${items.length} items`)

    // Save all scraped data to a single file
    await saveRawData(items, version)

    logger.endStep()

    // Calculate failed count (assuming all URLs were attempted)
    const failedCount = Math.max(0, startUrls.length - items.length)

    logger.summary({
      total: startUrls.length,
      scraped: items.length,
      failed: failedCount,
      duration: totalDuration,
    })

    logger.success("Crawling stage completed successfully!")
  } catch (error) {
    logger.error(`Crawling failed: ${(error as Error).message}`)
    throw error
  }
}
