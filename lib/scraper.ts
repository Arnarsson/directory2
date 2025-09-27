import * as cheerio from "cheerio"

export interface ScrapedData {
  title: string
  metaDescription: string
  content: string
  links: string[]
  images: string[]
}

// Add retry functionality with exponential backoff
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let retries = 0

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        headers: {
          // Add common headers to appear more like a browser
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      // If we get a rate limit response, wait and retry
      if (response.status === 429) {
        retries++

        if (retries >= maxRetries) {
          console.log(`Maximum retries (${maxRetries}) reached for ${url}`)
          return response // Return the 429 response after max retries
        }

        // Exponential backoff: 1s, 2s, 4s...
        const waitTime = 1000 * 2 ** (retries - 1)
        console.log(
          `Rate limited, waiting ${waitTime}ms before retry ${retries}/${maxRetries}`
        )
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      } else {
        return response // Return successful response
      }
    } catch (error) {
      retries++

      if (retries >= maxRetries) {
        console.error(`Failed to fetch after ${maxRetries} attempts:`, error)
        throw error
      }

      // Wait before retry on network errors
      const waitTime = 1000 * 2 ** (retries - 1)
      console.log(
        `Network error, waiting ${waitTime}ms before retry ${retries}/${maxRetries}`
      )
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  // This should never be reached if maxRetries > 0
  throw new Error("Failed to fetch URL after all retries")
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    // Fetch the URL content with retry logic
    const response = await fetchWithRetry(url)

    if (!response.ok) {
      // Provide more specific error messages based on status code
      if (response.status === 429) {
        throw new Error(
          `Rate limited by website (429 Too Many Requests). Try again later.`
        )
      } else if (response.status === 403) {
        throw new Error(
          `Access forbidden by website (403 Forbidden). This site likely blocks scrapers.`
        )
      } else if (response.status === 404) {
        throw new Error(
          `Page not found (404 Not Found). Check if the URL is correct.`
        )
      } else {
        throw new Error(
          `Failed to fetch URL: ${response.status} ${response.statusText}`
        )
      }
    }

    const html = await response.text()

    // Load the HTML with Cheerio
    const $ = cheerio.load(html)

    // Extract basic page information
    const title = $("title").text().trim()
    const metaDescription = $('meta[name="description"]').attr("content") || ""

    // Extract main content (simplified approach)
    // Remove scripts, styles, and other non-content elements
    $("script, style, iframe, noscript").remove()

    // Get main content - try to find the main content area
    // This is a simple approach that might need customization for specific sites
    let contentElement = $("main, article, #content, .content, .main, #main")

    // If no specific content area found, use the body
    if (contentElement.length === 0) {
      contentElement = $("body")
    }

    const content = contentElement.text().trim().replace(/\s+/g, " ")

    // Extract links
    const links: string[] = []
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href")
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        // Convert relative URLs to absolute
        try {
          const absoluteUrl = new URL(href, url).toString()
          links.push(absoluteUrl)
        } catch {
          // Skip invalid URLs
        }
      }
    })

    // Extract images
    const images: string[] = []
    $("img[src]").each((_, element) => {
      const src = $(element).attr("src")
      if (src) {
        try {
          // Convert relative URLs to absolute
          const absoluteSrc = new URL(src, url).toString()
          images.push(absoluteSrc)
        } catch {
          // Skip invalid URLs
        }
      }
    })

    return {
      title,
      metaDescription,
      content: content.substring(0, 5000), // Limit content length
      links: [...new Set(links)].slice(0, 20), // Remove duplicates and limit to 20
      images: [...new Set(images)].slice(0, 10), // Remove duplicates and limit to 10
    }
  } catch (error) {
    console.error("Error scraping URL:", error)
    throw new Error(
      `Failed to scrape website: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

// export interface ScrapedData {
//   title: string
//   metaDescription: string
//   content: string
//   links: string[]
//   images: string[]
// }

// /**
//  * Scrape a URL using the Jina AI scraper service
//  * @param url URL to scrape
//  * @returns ScrapedData object with extracted content
//  */
// export async function scrapeUrl(url: string): Promise<ScrapedData> {
//   try {
//     // Use Jina AI scraper service
//     const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`

//     // Fetch from Jina service
//     const response = await fetch(jinaUrl)

//     if (!response.ok) {
//       if (response.status === 429) {
//         throw new Error(
//           `Rate limited by Jina service (429 Too Many Requests). Try again later.`
//         )
//       } else if (response.status === 403) {
//         throw new Error(`Access forbidden by Jina service (403 Forbidden).`)
//       } else if (response.status === 404) {
//         throw new Error(
//           `Page not found (404 Not Found). Check if the URL is correct.`
//         )
//       } else {
//         throw new Error(
//           `Failed to fetch URL via Jina: ${response.status} ${response.statusText}`
//         )
//       }
//     }

//     // Jina returns HTML content that we need to extract data from
//     const html = await response.text()

//     // For now, we're creating a simplified response
//     // In a production environment, you might want to implement more sophisticated parsing
//     // or check if Jina provides an API that returns structured data directly
//     return {
//       title: extractTitle(html),
//       metaDescription: extractMetaDescription(html),
//       content: extractMainContent(html),
//       links: extractLinks(html, url),
//       images: extractImages(html, url),
//     }
//   } catch (error) {
//     console.error("Error scraping URL:", error)
//     throw new Error(
//       `Failed to scrape website: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`
//     )
//   }
// }

// /**
//  * Extract title from HTML
//  */
// function extractTitle(html: string): string {
//   const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
//   return titleMatch ? titleMatch[1].trim() : ""
// }

// /**
//  * Extract meta description from HTML
//  */
// function extractMetaDescription(html: string): string {
//   const metaMatch = html.match(
//     /<meta\s+name="description"\s+content="([^"]*)"[^>]*>/i
//   )
//   return metaMatch ? metaMatch[1].trim() : ""
// }

// /**
//  * Extract main content from HTML (simplified)
//  */
// function extractMainContent(html: string): string {
//   // Simple content extraction - remove HTML tags and trim
//   const content = html
//     .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
//     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
//     .replace(/<[^>]+>/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()

//   return content.substring(0, 5000) // Limit content length
// }

// /**
//  * Extract links from HTML
//  */
// function extractLinks(html: string, baseUrl: string): string[] {
//   const links: string[] = []
//   const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>/gi
//   let match

//   while ((match = linkRegex.exec(html)) !== null) {
//     const href = match[1]
//     if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
//       try {
//         const absoluteUrl = new URL(href, baseUrl).toString()
//         links.push(absoluteUrl)
//       } catch {
//         // Skip invalid URLs
//       }
//     }
//   }

//   return [...new Set(links)].slice(0, 20) // Remove duplicates and limit to 20
// }

// /**
//  * Extract images from HTML
//  */
// function extractImages(html: string, baseUrl: string): string[] {
//   const images: string[] = []
//   const imgRegex = /<img\s+(?:[^>]*?\s+)?src="([^"]*)"[^>]*>/gi
//   let match

//   while ((match = imgRegex.exec(html)) !== null) {
//     const src = match[1]
//     if (src) {
//       try {
//         const absoluteSrc = new URL(src, baseUrl).toString()
//         images.push(absoluteSrc)
//       } catch {
//         // Skip invalid URLs
//       }
//     }
//   }

//   return [...new Set(images)].slice(0, 10) // Remove duplicates and limit to 10
// }
