"server-only"
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/db/supabase/server"

export async function updateProduct(id: string, approved: boolean) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }
  if (typeof approved !== "boolean") {
    throw new Error("Invalid approval status")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await db
    .from("products")
    .update({ approved })
    .eq("id", id)

  if (error) {
    console.error("Error updating product:", error.message)
    throw new Error("Failed to update product")
  }
  revalidatePath("/admin")

  return data
}

export async function toggleProductFeatured(id: string) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  // First get the current featured status
  const { data: currentProduct, error: fetchError } = await db
    .from("products")
    .select("featured")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching product:", fetchError.message)
    throw new Error("Failed to fetch product")
  }

  if (!currentProduct) {
    throw new Error("Product not found")
  }

  // Toggle the featured status
  const newFeaturedStatus = !currentProduct.featured

  const { data, error } = await db
    .from("products")
    .update({ featured: newFeaturedStatus })
    .eq("id", id)

  if (error) {
    console.error("Error updating product featured status:", error.message)
    throw new Error("Failed to update product featured status")
  }
  revalidatePath("/admin")

  return data
}

export async function updateProductDetails(
  id: string,
  updates: {
    codename?: string
    full_name?: string
    punchline?: string
    description?: string
    product_website?: string
    categories?: string
    tags?: string[]
    labels?: string[]
    twitter_handle?: string
    email?: string
  }
) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }

  if (!updates || Object.keys(updates).length === 0) {
    throw new Error("No updates provided")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  // Validate required fields if they're being updated
  if (updates.codename !== undefined && !updates.codename.trim()) {
    throw new Error("Codename cannot be empty")
  }

  if (updates.punchline !== undefined && updates.punchline.length > 30) {
    throw new Error("Punchline must be less than 30 characters")
  }

  if (updates.product_website !== undefined) {
    try {
      new URL(updates.product_website)
    } catch {
      throw new Error("Invalid website URL")
    }
  }

  const { data, error } = await db.from("products").update(updates).eq("id", id)

  if (error) {
    console.error("Error updating product details:", error.message)
    throw new Error("Failed to update product details")
  }
  revalidatePath("/admin")

  return data
}

export async function deleteProduct(id: string) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid product ID")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("products").delete().eq("id", id)

  if (error) {
    console.error("Error deleting product:", error.message)
    throw new Error("Failed to delete product")
  }
  revalidatePath("/admin")
}

export async function updateFilters() {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data: categoriesData, error: categoriesError } = await db
    .from("products")
    .select("categories")

  const { data: labelsData, error: labelsError } = await db
    .from("products")
    .select("labels")

  const { data: tagsData, error: tagsError } = await db
    .from("products")
    .select("tags")

  if (categoriesError || labelsError || tagsError) {
    console.error(
      "Error fetching filters:",
      categoriesError,
      labelsError,
      tagsError
    )
    return
  }

  // Function to process and split comma-separated values
  const processValues = (values: any[]) => {
    try {
      return [
        ...new Set(
          values.flatMap((item) => {
            if (typeof item === "string") {
              return item.split(",").map((val) => val.trim())
            } else if (Array.isArray(item)) {
              return item.flatMap((val) =>
                val.split(",").map((v: string) => v.trim())
              )
            } else {
              console.error("Non-string item encountered:", item)
              return []
            }
          })
        ),
      ].filter((value) => value) // Filter out empty strings
    } catch (error) {
      console.error("Error processing values:", error)
      return []
    }
  }

  // Insert distinct categories into categories table
  const categories = processValues(
    categoriesData.map((item) => item.categories)
  )
  for (const category of categories) {
    if (category) {
      const { error } = await db
        .from("categories")
        .upsert({ name: category }, { onConflict: "name" })
      if (error) {
        console.error("Error upserting category:", error)
      }
    }
  }

  // Insert distinct labels into labels table
  const labels = processValues(labelsData.map((item) => item.labels))
  for (const label of labels) {
    if (label) {
      const { error } = await db
        .from("labels")
        .upsert({ name: label }, { onConflict: "name" })
      if (error) {
        console.error("Error upserting label:", error)
      }
    }
  }

  // Insert distinct tags into tags table
  const tags = processValues(tagsData.map((item) => item.tags))
  for (const tag of tags) {
    if (tag) {
      const { error } = await db
        .from("tags")
        .upsert({ name: tag }, { onConflict: "name" })
      if (error) {
        console.error("Error upserting tag:", error)
      }
    }
  }
}

export async function approveAllPendingProducts() {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data: pendingProducts, error } = await db
    .from("products")
    .select("id")
    .eq("approved", false)

  if (error) {
    console.error("Error fetching pending products:", error)
    throw error
  }

  const pendingProductIds = pendingProducts.map(
    (product: { id: string }) => product.id
  )

  const { error: updateError } = await db
    .from("products")
    .update({ approved: true })
    .in("id", pendingProductIds)

  if (updateError) {
    console.error("Error approving all pending products:", updateError)
    throw updateError
  }

  revalidatePath("/admin-dashboard")

  return pendingProductIds
}
