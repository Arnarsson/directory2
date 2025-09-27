import { NextRequest, NextResponse } from "next/server"

import { getSEOConfig } from "@/lib/seo-config"
import {
  getCachedFilters,
  getCachedProducts,
} from "@/app/actions/cached_actions"

type ProductRow = {
  id: string
  codename: string
  description: string
  logo_src?: string | null
  created_at?: string | null
  tags?: string[] | null
}

type FilterData = {
  categories: (string | null)[]
  labels: string[]
  tags: string[]
}

async function fetchProducts(): Promise<ProductRow[]> {
  try {
    return await getCachedProducts()
  } catch (error) {
    console.error("Error fetching products for sitemap:", error)
    return []
  }
}

async function fetchFilters(): Promise<FilterData> {
  try {
    return await getCachedFilters()
  } catch (error) {
    console.error("Error fetching filters for sitemap:", error)
    return { categories: [], labels: [], tags: [] }
  }
}

export async function GET(request: NextRequest) {
  try {
    const config = getSEOConfig()
    const baseUrl = config.site.url

    // Get all products from cached actions
    const products = await fetchProducts()

    // Get all filters for categories, tags, and labels from cached actions
    const filters = await fetchFilters()

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.home}</changefreq>
    <priority>${config.sitemap.priority.home}</priority>
  </url>
  
  <!-- Products page -->
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.products}</changefreq>
    <priority>${config.sitemap.priority.products}</priority>
  </url>
  
  <!-- Submit page -->
  <url>
    <loc>${baseUrl}/submit</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.static}</changefreq>
    <priority>${config.sitemap.priority.static}</priority>
  </url>
  
  <!-- Individual product pages -->
  ${products
    .map(
      (product) => `
  <url>
    <loc>${baseUrl}/products/${product.id}</loc>
    <lastmod>${
      product.created_at
        ? new Date(product.created_at).toISOString()
        : new Date().toISOString()
    }</lastmod>
    <changefreq>${config.sitemap.changefreq.products}</changefreq>
    <priority>${config.sitemap.priority.products}</priority>
    <image:image>
      <image:loc>${
        product.logo_src || `${baseUrl}${config.site.ogImage}`
      }</image:loc>
      <image:title>${product.codename}</image:title>
      <image:caption>${product.description}</image:caption>
    </image:image>
  </url>`
    )
    .join("")}
  
  <!-- Category landing pages -->
  ${filters.categories
    .filter((c): c is string => c !== null)
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/categories/${encodeURIComponent(category)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.categories}</changefreq>
    <priority>${config.sitemap.priority.categories}</priority>
  </url>`
    )
    .join("")}
  
  <!-- Tag pages -->
  ${filters.tags
    .filter((t): t is string => t !== null)
    .map(
      (tag) => `
  <url>
    <loc>${baseUrl}/tags/${encodeURIComponent(tag)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.tags}</changefreq>
    <priority>${config.sitemap.priority.tags}</priority>
  </url>`
    )
    .join("")}
  
  <!-- Label pages -->
  ${filters.labels
    .filter((l): l is string => l !== null)
    .map(
      (label) => `
  <url>
    <loc>${baseUrl}/labels/${encodeURIComponent(label)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${config.sitemap.changefreq.labels}</changefreq>
    <priority>${config.sitemap.priority.labels}</priority>
  </url>`
    )
    .join("")}
  
</urlset>`

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=86400", // Cache for 1 hour, CDN for 24 hours
      },
    })
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return new NextResponse("Error generating sitemap", { status: 500 })
  }
}
