"use server"

import "server-only"

import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"
import type { Database } from "@/db/supabase/types"

import { hasEnvVars } from "@/lib/utils"

type UserRow = Database["public"]["Tables"]["users"]["Row"]
type UserUpdate = Database["public"]["Tables"]["users"]["Update"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

type UserProfileUpdate = {
  full_name?: string
  bio?: string
  website?: string
  location?: string
  twitter_handle?: string
  github_handle?: string
  linkedin_handle?: string
}

type UserStats = {
  productsCount: number
  bookmarksCount: number
}

type CurrentUserProfile = {
  id: string
  email: string | undefined
  user_metadata: Record<string, any> | undefined
  profile: UserRow | null
}

export async function getAuthUserClaims(): Promise<any> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data) {
    return null
  }

  return data.claims
}

export async function requireGuest(): Promise<void> {
  const claims = await getAuthUserClaims()
  if (claims) {
    redirect("/")
  }
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean
  user: any
  isAdmin: boolean
}> {
  const claims = await getAuthUserClaims()

  return {
    isAuthenticated: !!claims,
    user: claims || null,
    isAdmin: claims?.app_metadata?.claims_admin,
  }
}

export async function getUserProfile(userId: string): Promise<UserRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) {
    console.error("Error fetching user profile:", error.message)
    return null
  }
  return data
}

export async function updateUserProfile(
  userId: string,
  profileData: UserProfileUpdate
): Promise<{ success: boolean; data?: UserRow; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getUserProducts(userId: string): Promise<ProductRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user products:", error)
    return []
  }

  return data || []
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient()

  const [productsCount, bookmarksCount] = await Promise.all([
    supabase.rpc("get_user_products_count", { user_uuid: userId }),
    supabase.rpc("get_user_bookmark_count", { user_uuid: userId }),
  ])

  return {
    productsCount: productsCount.data || 0,
    bookmarksCount: bookmarksCount.data || 0,
  }
}
