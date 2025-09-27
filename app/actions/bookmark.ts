"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { createClient } from "@/db/supabase/server"
import type { Database } from "@/db/supabase/types"

import { getAuthUserClaims } from "./user"

type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"]
type BookmarkInsert = Database["public"]["Tables"]["bookmarks"]["Insert"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

type BookmarkWithProduct = {
  id: string
  created_at: string | null
  products: ProductRow[]
}

type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
}

export async function addBookmark(
  productId: string
): Promise<ActionResult<BookmarkRow>> {
  const claims = await getAuthUserClaims()
  if (!claims) {
    return { success: false, error: "Authentication required" }
  }

  const supabase = await createClient()

  const bookmarkData: BookmarkInsert = {
    user_id: claims.sub,
    product_id: productId,
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert(bookmarkData)
    .select()
    .single()

  if (error) {
    console.error("Error adding bookmark:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/bookmarks")
  return { success: true, data }
}

export async function removeBookmark(productId: string): Promise<ActionResult> {
  const claims = await getAuthUserClaims()
  if (!claims) {
    return { success: false, error: "Authentication required" }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", claims.sub)
    .eq("product_id", productId)

  if (error) {
    console.error("Error removing bookmark:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/bookmarks")
  return { success: true }
}

export async function getUserBookmarks(
  userId?: string
): Promise<BookmarkWithProduct[]> {
  const claims = await getAuthUserClaims()
  const targetUserId = userId || claims?.sub

  if (!targetUserId) {
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("bookmarks")
    .select(
      `
      id,
      created_at,
      products (*)
    `
    )
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user bookmarks:", error)
    return []
  }

  return data || []
}

export async function isProductBookmarked(productId: string): Promise<boolean> {
  const claims = await getAuthUserClaims()
  if (!claims) {
    return false
  }

  const supabase = await createClient()

  const { data } = await supabase.rpc("is_product_bookmarked", {
    product_uuid: productId,
    user_uuid: claims.sub,
  })

  return data || false
}

export async function toggleBookmark(
  productId: string
): Promise<ActionResult<BookmarkRow | undefined>> {
  const isBookmarked = await isProductBookmarked(productId)

  if (isBookmarked) {
    return await removeBookmark(productId)
  } else {
    return await addBookmark(productId)
  }
}
