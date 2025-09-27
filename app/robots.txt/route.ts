import { getSEOConfig } from "@/lib/seo-config"

export async function GET() {
  const config = getSEOConfig()

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${config.site.url}/sitemap.xml

Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /products/
Allow: /submit-new/
Allow: /auth/

# Crawl delay (optional)
Crawl-delay: 1`

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=86400", // Cache for 1 hour, CDN for 24 hours
    },
  })
}
