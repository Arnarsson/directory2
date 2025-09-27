"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/db/supabase/server"

// Update user full name
export async function updateUser(id: string, full_name: string) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }
  if (
    !full_name ||
    typeof full_name !== "string" ||
    full_name.trim().length === 0
  ) {
    throw new Error("Invalid full name")
  }

  const db = await createClient()

  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db
    .from("users")
    .update({ full_name: full_name.trim() })
    .eq("id", id)

  if (error) {
    console.error("Error updating user:", error.message)
    throw new Error("Failed to update user")
  }
  revalidatePath("/admin/users")

  return { id, full_name: full_name.trim() }
}

// Update user billing address
export async function updateBillingAddress(
  id: string,
  billing_address: object
) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }
  if (!billing_address || typeof billing_address !== "object") {
    throw new Error("Invalid billing address")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db
    .from("users")
    .update({ billing_address })
    .eq("id", id)

  if (error) {
    console.error("Error updating billing address:", error.message)
    throw new Error("Failed to update billing address")
  }
  revalidatePath("/admin/users")

  return { id, billing_address }
}

// Update user payment method
export async function updatePaymentMethod(id: string, payment_method: object) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }
  if (!payment_method || typeof payment_method !== "object") {
    throw new Error("Invalid payment method")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db
    .from("users")
    .update({ payment_method })
    .eq("id", id)

  if (error) {
    console.error("Error updating payment method:", error.message)
    throw new Error("Failed to update payment method")
  }
  revalidatePath("/admin/users")

  return { id, payment_method }
}

// Delete user
export async function deleteUser(id: string) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  // Check if user exists
  const { data: existingUser } = await db
    .from("users")
    .select("id")
    .eq("id", id)
    .single()

  if (!existingUser) {
    throw new Error("User not found")
  }

  const { error } = await db.from("users").delete().eq("id", id)

  if (error) {
    console.error("Error deleting user:", error.message)
    throw new Error("Failed to delete user")
  }
  revalidatePath("/admin/users")

  return { id }
}

// Fetch user details
export async function fetchUserDetails(id: string) {
  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID")
  }

  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching user details:", error.message)
    throw new Error("Failed to fetch user details")
  }

  return data
}
