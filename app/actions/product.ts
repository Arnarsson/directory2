"use server"

import "server-only"

import { cache } from "react"
import { revalidatePath } from "next/cache"
import { createClient } from "@/db/supabase/server"
import type { Database } from "@/db/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

type ProductWithViews = ProductRow & {
  product_views: { id: string }[]
}

type FilterData = {
  categories: (string | null)[]
  labels: string[]
  tags: string[]
}

export async function getFilters(): Promise<FilterData> {
  const db = await createClient()

  // Single optimized query with proper indexing and filtering
  const { data, error } = await db
    .from("products")
    .select("categories, labels, tags")
    .eq("approved", true)
    .limit(1000) // Add reasonable limit for performance

  if (error) {
    console.error("Error fetching filters:", error)
    return { categories: [], labels: [], tags: [] }
  }

  // Process in memory for better performance
  const categories = new Set<string>()
  const labels = new Set<string>()
  const tags = new Set<string>()

  data?.forEach((item) => {
    if (item.categories) categories.add(item.categories)
    if (item.labels) item.labels.forEach((label: string) => labels.add(label))
    if (item.tags) item.tags.forEach((tag: string) => tags.add(tag))
  })

  return {
    categories: Array.from(categories),
    labels: Array.from(labels),
    tags: Array.from(tags),
  }
}

export const getProducts = cache(
  async (
    searchTerm?: string,
    category?: string,
    label?: string,
    tag?: string
  ): Promise<ProductRow[]> => {
    const db = await createClient()
    return await getProductsWithClient(db, searchTerm, category, label, tag)
  }
)

// Input validation function
function validateSearchInput(input: string | undefined): string | undefined {
  if (!input || typeof input !== "string") return undefined

  // Remove potential SQL injection characters and limit length
  const sanitized = input
    .replace(/['"`;\\]/g, "") // Remove SQL injection chars
    .trim()
    .slice(0, 50) // Limit length

  if (sanitized.length < 2) return undefined
  if (/^[%_\\]+$/.test(sanitized)) return undefined // Block wildcard-only searches

  return sanitized
}

export const getProductsWithClient = cache(
  async (
    db: SupabaseClient<Database>,
    searchTerm?: string,
    category?: string,
    label?: string,
    tag?: string
  ): Promise<ProductRow[]> => {
    // Validate and sanitize inputs - CRITICAL SECURITY MEASURE
    const validatedSearchTerm = validateSearchInput(searchTerm)
    const validatedCategory = category
      ?.replace(/['"`;\\]/g, "")
      .trim()
      .slice(0, 30)
    const validatedLabel = label
      ?.replace(/['"`;\\]/g, "")
      .trim()
      .slice(0, 30)
    const validatedTag = tag
      ?.replace(/['"`;\\]/g, "")
      .trim()
      .slice(0, 30)

    let query = db
      .from("products")
      .select(
        `
        *,
        product_views!product_views_product_id_fkey (
          id
        )
      `
      )
      .eq("approved", true)

    if (validatedSearchTerm) {
      // Note: Supabase automatically parameterizes the .or() queries
      query = query.or(
        `codename.ilike.%${validatedSearchTerm}%,description.ilike.%${validatedSearchTerm}%,punchline.ilike.%${validatedSearchTerm}%`
      )
    }

    if (validatedCategory) {
      query = query.eq("categories", validatedCategory)
    }

    if (validatedLabel) {
      query = query.contains("labels", [validatedLabel])
    }

    if (validatedTag) {
      query = query.contains("tags", [validatedTag])
    }

    const { data, error } = await query

    if (error) {
      console.error("Error searching resources:", error)
      return []
    }

    // Transform the data to calculate actual view counts from product_views
    const productsWithViewCounts = ((data as ProductWithViews[]) || []).map(
      (product) => ({
        ...product,
        view_count: product.product_views?.length || 0,
        // Remove the joined product_views data to maintain the expected ProductRow type
        product_views: undefined,
      })
    )

    return productsWithViewCounts
  }
)

export const getProductById = cache(
  async (id?: string): Promise<ProductRow[]> => {
    if (!id) return []

    const supabase = await createClient()

    // Single query with join to get product data and view count together
    const { data, error } = await supabase
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
      (data as any)?.product_views?.length || data.view_count || 0

    const finalProduct: ProductRow = {
      ...data,
      created_at: data.created_at || new Date().toISOString(),
      view_count: viewCount,
    }

    return [finalProduct]
  }
)

export async function incrementClickCount(id: string): Promise<void> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.rpc("increment_product_view_count", {
      product_id: id,
    })

    if (error) {
      console.error("Error incrementing click count:", error)
      throw error
    }

    // Revalidate the products page to show updated counts
    revalidatePath("/products")
    revalidatePath(`/products/${id}`)
  } catch (error) {
    console.error(
      "Failed to increment click count for product:",
      id,
      "Error:",
      error
    )
    throw error
  }
}
