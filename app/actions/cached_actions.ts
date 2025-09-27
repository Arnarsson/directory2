"use server"

import "server-only"

import { cache } from "react"
import { unstable_cache } from "next/cache"
import type { Database } from "@/db/supabase/types"
import { createClient } from "@supabase/supabase-js"

import { getProductsWithClient } from "./product"

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
type LabelRow = Database["public"]["Tables"]["labels"]["Row"]
type TagRow = Database["public"]["Tables"]["tags"]["Row"]

type CategoryNameOnly = Pick<CategoryRow, "name">
type LabelNameOnly = Pick<LabelRow, "name">
type TagNameOnly = Pick<TagRow, "name">

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

type FilterData = {
  categories: (string | null)[]
  labels: string[]
  tags: string[]
}

// Create Supabase client with error handling for missing env vars
let client: ReturnType<typeof createClient> | null = null

try {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
  ) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
      // {
      //   auth: {
      //     autoRefreshToken: false,
      //     persistSession: false,
      //   },
      // }
    )
  }
} catch (error) {
  console.warn("Failed to create Supabase client:", error)
  client = null
}

async function getFilters(): Promise<FilterData> {
  // If no client available, return empty filters
  if (!client) {
    console.warn(
      "Supabase service role client not available, returning empty filters"
    )
    return { categories: [], labels: [], tags: [] }
  }

  try {
    const { data: categoriesData, error: categoriesError } = await client
      .from("categories")
      .select("name")

    const { data: labelsData, error: labelsError } = await client
      .from("labels")
      .select("name")

    const { data: tagsData, error: tagsError } = await client
      .from("tags")
      .select("name")

    if (categoriesError || labelsError || tagsError) {
      console.error(
        "Error fetching filters:",
        categoriesError,
        labelsError,
        tagsError
      )
      return { categories: [], labels: [], tags: [] }
    }

    const unique = (array: string[]) => [...new Set(array)]

    const categories = categoriesData
      ? unique(
          (categoriesData as CategoryNameOnly[])
            .map((item: CategoryNameOnly) => item.name)
            .filter(Boolean)
        )
      : []

    const labels = labelsData
      ? unique(
          (labelsData as LabelNameOnly[])
            .map((item: LabelNameOnly) => item.name)
            .filter(Boolean)
        )
      : []

    const tags = tagsData
      ? unique(
          (tagsData as TagNameOnly[])
            .map((item: TagNameOnly) => item.name)
            .filter(Boolean)
        )
      : []

    return { categories, labels, tags }
  } catch (error) {
    console.error("Error in getFilters:", error)
    return { categories: [], labels: [], tags: [] }
  }
}

export const getCachedFilters = unstable_cache(
  async (): Promise<FilterData> => {
    const { categories, labels, tags } = await getFilters()
    return { categories, labels, tags }
  },
  ["product-filters"],
  {
    tags: ["product_filters", "filters"],
    revalidate: 3600, // 1 hour instead of 2.5 hours
  }
)

// Add cached product fetching for better performance
export const getCachedProducts = unstable_cache(
  async (
    searchTerm?: string,
    category?: string,
    label?: string,
    tag?: string
  ): Promise<ProductRow[]> => {
    if (!client) {
      console.warn(
        "Supabase service role client not available, returning empty products"
      )
      return []
    }
    return await getProductsWithClient(client, searchTerm, category, label, tag)
  },
  [`products`, `search`, `category`, `label`, `tag`],
  {
    tags: ["products", "product-list"],
    revalidate: 1800, // 30 minutes
  }
)

// Add server-side precomputation for better performance
async function getPrecomputedCategories(products: ProductRow[]) {
  // Process categories on the server side
  const productsByCategory = products.reduce((acc, product) => {
    const categories = product.categories
      ? product.categories.split(",").map((cat) => cat.trim())
      : ["Uncategorized"]

    categories.forEach((category) => {
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
    })
    return acc
  }, {} as Record<string, ProductRow[]>)

  // Filter categories with sufficient products (more than 4)
  const filteredCategories = Object.entries(productsByCategory)
    .filter(([_, products]) => products.length > 4)
    .slice(0, 10) // Limit to top 10 categories for performance

  return filteredCategories
}

// Add cached version of precomputed categories
export const getCachedPrecomputedCategories = unstable_cache(
  async (products: ProductRow[]) => {
    if (!client) {
      console.warn(
        "Supabase service role client not available, returning empty precomputed categories"
      )
      return []
    }
    return await getPrecomputedCategories(products)
  },
  ["precomputed-categories"],
  {
    tags: ["categories", "product-grouping"],
    revalidate: 1800, // 30 minutes
  }
)

// Get top 10 most viewed products (popular)
export const getCachedPopularProducts = unstable_cache(
  async (): Promise<ProductRow[]> => {
    if (!client) {
      console.warn(
        "Supabase service role client not available, returning empty popular products"
      )
      return []
    }

    try {
      const { data: popularProducts, error } = await client
        .from("products")
        .select("*")
        .eq("approved", true)
        .not("view_count", "is", null)
        .order("view_count", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching popular products:", error)
        return []
      }

      return (popularProducts as ProductRow[]) || []
    } catch (error) {
      console.error("Error in getCachedPopularProducts:", error)
      return []
    }
  },
  ["popular-products"],
  {
    tags: ["products", "popular", "view-count"],
    revalidate: 1800, // 30 minutes
  }
)

// Get top 10 featured products
export const getCachedFeaturedProducts = unstable_cache(
  async (): Promise<ProductRow[]> => {
    if (!client) {
      console.warn(
        "Supabase service role client not available, returning empty featured products"
      )
      return []
    }

    try {
      const { data: featuredProducts, error } = await client
        .from("products")
        .select("*")
        .eq("approved", true)
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        console.error("Error fetching featured products:", error)
        return []
      }

      return (featuredProducts as ProductRow[]) || []
    } catch (error) {
      console.error("Error in getCachedFeaturedProducts:", error)
      return []
    }
  },
  ["featured-products"],
  {
    tags: ["products", "featured"],
    revalidate: 1800, // 30 minutes
  }
)

// Get top 10 most bookmarked products
export const getCachedMostBookmarkedProducts = unstable_cache(
  async (): Promise<ProductRow[]> => {
    if (!client) {
      console.warn(
        "Supabase service role client not available, returning empty most bookmarked products"
      )
      return []
    }

    try {
      // Use a more reliable approach with a subquery to count bookmarks
      const { data: bookmarkedProducts, error } = await client
        .from("products")
        .select(
          `
          *,
          bookmarks!inner(id)
        `
        )
        .eq("approved", true)

      if (error) {
        console.error("Error fetching most bookmarked products:", error)
        return []
      }

      // Sort by bookmark count and take top 10
      const sortedProducts =
        (bookmarkedProducts as any[])
          ?.filter(
            (product: any) => product.bookmarks && product.bookmarks.length > 0
          )
          ?.sort(
            (a: any, b: any) =>
              (b.bookmarks?.length || 0) - (a.bookmarks?.length || 0)
          )
          ?.slice(0, 10)
          ?.map((product: any) => ({
            ...product,
            bookmarks: undefined, // Remove the bookmarks data to match ProductRow type
          })) || []

      return sortedProducts as ProductRow[]
    } catch (error) {
      console.error("Error in getCachedMostBookmarkedProducts:", error)
      return []
    }
  },
  ["most-bookmarked-products"],
  {
    tags: ["products", "bookmarks", "popular"],
    revalidate: 1800, // 30 minutes
  }
)

const getProductById = cache(async (id?: string): Promise<ProductRow[]> => {
  if (!id) return []
  if (!client) {
    console.warn(
      "Supabase service role client not available, returning empty product"
    )
    return []
  }

  // Single query with join to get product data and view count together
  const { data, error } = await client
    .from("products")
    .select(
      `
        *,
        product_views!product_views_product_id_fkey (
          id
        )
      `
    )
    .eq("id", id)
    .eq("approved", true)
    .single()

  if (error) {
    console.warn("Error fetching product by ID:", error)
    return []
  }

  // Calculate view count from the joined data
  const viewCount =
    (data as any)?.product_views?.length || (data as any).view_count || 0

  const finalProduct: ProductRow = {
    ...(data as any),
    created_at: (data as any).created_at ?? new Date().toISOString(),
    view_count: viewCount,
  }

  return [finalProduct]
})

export const getCachedProductById = unstable_cache(
  async (id?: string): Promise<ProductRow[]> => {
    return await getProductById(id)
  },
  ["product-by-id"],
  {
    tags: ["products", "product-by-id"],
    revalidate: 1800, // 30 minutes
  }
)
