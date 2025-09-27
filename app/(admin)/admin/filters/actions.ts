"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/db/supabase/server"

export async function createCategory(name: string, icon?: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await db
    .from("categories")
    .insert({ name, icon })
    .select()
    .single()

  if (error) {
    console.error("Error creating category:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return data
}

export async function updateCategory(id: string, name: string, icon?: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db
    .from("categories")
    .update({ name, icon })
    .eq("id", id)

  if (error) {
    console.error("Error updating category:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id, name, icon }
}

export async function deleteCategory(id: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting category:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id }
}

export async function createLabel(name: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await db
    .from("labels")
    .insert({ name })
    .select()
    .single()

  if (error) {
    console.error("Error creating label:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return data
}

export async function updateLabel(id: string, name: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("labels").update({ name }).eq("id", id)

  if (error) {
    console.error("Error updating label:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id, name }
}

export async function deleteLabel(id: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("labels").delete().eq("id", id)

  if (error) {
    console.error("Error deleting label:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id }
}

export async function createTag(name: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { data, error } = await db
    .from("tags")
    .insert({ name })
    .select()
    .single()

  if (error) {
    console.error("Error creating tag:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return data
}

export async function updateTag(id: string, name: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("tags").update({ name }).eq("id", id)

  if (error) {
    console.error("Error updating tag:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id, name }
}

export async function deleteTag(id: string) {
  const db = await createClient()
  const { data: authData } = await db.auth.getClaims()
  if (!authData?.claims?.app_metadata?.claims_admin) {
    throw new Error("Unauthorized")
  }

  const { error } = await db.from("tags").delete().eq("id", id)

  if (error) {
    console.error("Error deleting tag:", error)
    throw error
  }
  revalidatePath("/admin/filters")

  return { id }
}
