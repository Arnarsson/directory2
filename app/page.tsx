import type { Metadata } from "next"

import { getSEOConfig } from "@/lib/seo-config"
import { Product } from "@/lib/types"
import { DirectorySearch } from "@/components/directory-search"
import { FeaturedCarousels } from "@/components/featured-carousels"
import { Hero } from "@/components/hero"
import { StructuredData } from "@/components/seo/structured-data"
import { EmptyState } from "@/components/tutorial/empty-state"

import { ResourceCardGrid } from "../components/directory-card-grid"
import {
  getCachedFeaturedProducts,
  getCachedFilters,
  getCachedMostBookmarkedProducts,
  getCachedPopularProducts,
  getCachedPrecomputedCategories,
  getCachedProducts,
} from "./actions/cached_actions"


export const experimental_ppr = true

// Generate metadata for the homepage
export async function generateMetadata(): Promise<Metadata> {
  const config = getSEOConfig()

  return {
    title: config.seo.defaultTitle,
    description: config.seo.defaultDescription,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      type: "website",
      url: config.site.url,
      images: [config.site.ogImage],
      siteName: config.site.name,
    },
    twitter: {
      card: config.social.twitter.cardType,
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: [config.site.ogImage],
    },
    alternates: {
      canonical: config.site.url,
    },
  }
}

// Select the resources you want to feature.. AD SPACE?
const FEATURED_IDS = [
  // "3b741434-1bdb-4903-91e9-a7fa154a8fdf",
  "",
] // Replace 'id1', 'id2', '3' with actual IDs you want to feature

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const searchParam = await searchParams

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  // Try to get data, but handle missing Supabase gracefully
  let data: Product[] = []
  let filters: {
    categories: (string | null)[]
    labels: string[]
    tags: string[]
  } = {
    categories: [],
    labels: [],
    tags: [],
  }

  try {
    const [d, f] = await Promise.all([
      getCachedProducts(searchParam.search),
      getCachedFilters(),
    ])
    data = d
    filters = f
  } catch (error) {
    console.warn("Supabase not configured or connection failed:", error)
    // Continue with empty data - this will show the empty state
  }

  const filteredFeaturedData = data.filter((d: Product) =>
    FEATURED_IDS.includes(d.id)
  )

  // Precompute categories on the server side for better performance
  let precomputedCategories: Array<[string, Product[]]> = []
  try {
    precomputedCategories = await getCachedPrecomputedCategories(data)
  } catch (error) {
    console.warn("Failed to precompute categories:", error)
  }

  // Fetch featured carousel data
  let popularProducts: Product[] = []
  let featuredProducts: Product[] = []
  let mostBookmarkedProducts: Product[] = []

  try {
    const [p, f, m] = await Promise.all([
      getCachedPopularProducts(),
      getCachedFeaturedProducts(),
      getCachedMostBookmarkedProducts(),
    ])
    popularProducts = p
    featuredProducts = f
    mostBookmarkedProducts = m
  } catch (error) {
    console.warn("Failed to fetch featured carousel data:", error)
  }

  // If no products, show empty state
  if (data.length === 0 && isDev) {
    return (
      <>
        <div className="flex-1">
          <EmptyState isDev={isDev} />
        </div>
      </>
    )
  }

  return (
    <main className="flex-1">
      <StructuredData
        type="website"
        data={{
          title: "Products Directory",
          description: "Browse our collection of amazing products and tools",
          url: getSEOConfig().site.url,
          itemCount: data.length,
          items: data.slice(0, 10), // Show first 10 items in structured data
        }}
      />
      <div className="flex-1 ">
        <div className="">
          <div className="">
            <Hero>
              <DirectorySearch />
            </Hero>
          </div>
          <div className="mt-12">
            <FeaturedCarousels
              popularProducts={popularProducts}
              featuredProducts={featuredProducts}
              mostBookmarkedProducts={mostBookmarkedProducts}
            />
          </div>
          <ResourceCardGrid
            sortedData={data}
            filteredFeaturedData={filteredFeaturedData}
            precomputedCategories={precomputedCategories}
          />
        </div>
      </div>
    </main>
  )
}

export default Page
