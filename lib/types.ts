import type { Database } from "@/db/supabase/types"

// Product types
export type ProductRow = Database["public"]["Tables"]["products"]["Row"]
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

// User types
export type UserRow = Database["public"]["Tables"]["users"]["Row"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]

// Bookmark types
export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"]
export type BookmarkInsert = Database["public"]["Tables"]["bookmarks"]["Insert"]
export type BookmarkUpdate = Database["public"]["Tables"]["bookmarks"]["Update"]

// Category types
export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"]
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"]
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"]

// Label types
export type LabelRow = Database["public"]["Tables"]["labels"]["Row"]
export type LabelInsert = Database["public"]["Tables"]["labels"]["Insert"]
export type LabelUpdate = Database["public"]["Tables"]["labels"]["Update"]

// Tag types
export type TagRow = Database["public"]["Tables"]["tags"]["Row"]
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"]
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"]

// Product View types
export type ProductViewRow =
  Database["public"]["Tables"]["product_views"]["Row"]
export type ProductViewInsert =
  Database["public"]["Tables"]["product_views"]["Insert"]
export type ProductViewUpdate =
  Database["public"]["Tables"]["product_views"]["Update"]

// User Admin Status types
export type UserAdminStatusRow =
  Database["public"]["Views"]["user_admin_status"]["Row"]

// Common Product interface for components (allows nulls for database compatibility)
export interface Product {
  id: string
  created_at: string | null
  full_name: string | null
  email: string | null
  twitter_handle: string | null
  product_website: string
  codename: string
  punchline: string
  description: string
  logo_src: string | null
  user_id: string
  tags: string[] | null
  view_count: number | null
  approved: boolean
  featured: boolean
  labels: string[] | null
  categories: string | null
}

// Strict Product interface for components that need non-nullable fields
export interface ProductStrict {
  id: string
  created_at: string
  full_name: string
  email: string
  twitter_handle: string
  product_website: string
  codename: string
  punchline: string
  description: string
  logo_src: string
  user_id: string
  tags: string[]
  view_count: number
  approved: boolean
  featured: boolean
  labels: string[]
  categories: string
}

// Helper function to transform ProductRow to Product
export function transformProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    created_at: row.created_at,
    full_name: row.full_name,
    email: row.email,
    twitter_handle: row.twitter_handle,
    product_website: row.product_website,
    codename: row.codename,
    punchline: row.punchline,
    description: row.description,
    logo_src: row.logo_src,
    user_id: row.user_id,
    tags: row.tags,
    view_count: row.view_count,
    approved: row.approved,
    featured: row.featured,
    labels: row.labels,
    categories: row.categories,
  }
}

// Helper function to transform ProductRow to Product with defaults
export function transformProductRowWithDefaults(row: ProductRow): Product {
  return {
    id: row.id,
    created_at: row.created_at || new Date().toISOString(),
    full_name: row.full_name || "",
    email: row.email || "",
    twitter_handle: row.twitter_handle || "",
    product_website: row.product_website,
    codename: row.codename,
    punchline: row.punchline,
    description: row.description,
    logo_src: row.logo_src || "",
    user_id: row.user_id,
    tags: row.tags || [],
    view_count: row.view_count || 0,
    approved: row.approved,
    featured: row.featured || false,
    labels: row.labels || [],
    categories: row.categories || "",
  }
}

// Helper function to transform ProductRow to ProductStrict (non-nullable)
export function transformProductRowToStrict(row: ProductRow): ProductStrict {
  return {
    id: row.id,
    created_at: row.created_at || new Date().toISOString(),
    full_name: row.full_name || "",
    email: row.email || "",
    twitter_handle: row.twitter_handle || "",
    product_website: row.product_website,
    codename: row.codename,
    punchline: row.punchline,
    description: row.description,
    logo_src: row.logo_src || "",
    user_id: row.user_id,
    tags: row.tags || [],
    view_count: row.view_count || 0,
    approved: row.approved,
    featured: row.featured || false,
    labels: row.labels || [],
    categories: row.categories || "",
  }
}
