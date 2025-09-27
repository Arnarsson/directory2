"use server"

import "server-only"

import { createClient } from "@/db/supabase/server"

export async function getUserMetrics() {
  try {
    const db = await createClient()

    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }

    const { data, error } = await db.rpc("get_user_metrics")

    if (error) {
      console.error("Error fetching user metrics:", error.message)
      throw new Error("Failed to fetch user metrics")
    }

    return data
  } catch (error) {
    console.error("getUserMetrics error:", error)
    throw new Error("Failed to fetch user metrics")
  }
}

export async function getProductMetrics() {
  try {
    const db = await createClient()
    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }

    const { data, error } = await db.rpc("get_product_metrics")

    if (error) {
      console.error("Error fetching product metrics:", error.message)
      throw new Error("Failed to fetch product metrics")
    }

    return data
  } catch (error) {
    console.error("getProductMetrics error:", error)
    throw new Error("Failed to fetch product metrics")
  }
}

export async function getCategoryMetrics() {
  try {
    const db = await createClient()
    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }
    const { data, error } = await db.rpc("get_category_metrics")

    if (error) {
      console.error("Error fetching category metrics:", error.message)
      throw new Error("Failed to fetch category metrics")
    }

    return data
  } catch (error) {
    console.error("getCategoryMetrics error:", error)
    throw new Error("Failed to fetch category metrics")
  }
}

export async function getLabelMetrics() {
  try {
    const db = await createClient()
    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }
    const { data, error } = await db.rpc("get_label_metrics")

    if (error) {
      console.error("Error fetching label metrics:", error.message)
      throw new Error("Failed to fetch label metrics")
    }

    return data
  } catch (error) {
    console.error("getLabelMetrics error:", error)
    throw new Error("Failed to fetch label metrics")
  }
}

export async function getTagMetrics() {
  try {
    const db = await createClient()
    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }
    const { data, error } = await db.rpc("get_tag_metrics")

    if (error) {
      console.error("Error fetching tag metrics:", error.message)
      throw new Error("Failed to fetch tag metrics")
    }

    return data
  } catch (error) {
    console.error("getTagMetrics error:", error)
    throw new Error("Failed to fetch tag metrics")
  }
}

export async function getAllMetrics() {
  try {
    const db = await createClient()
    const { data: authData } = await db.auth.getClaims()

    if (!authData?.claims?.app_metadata?.claims_admin) {
      return {
        users: [],
        products: [],
        categories: [],
        labels: [],
        tags: [],
      }
    }
    // Get all metrics in parallel for better performance
    const [
      userMetrics,
      productMetrics,
      categoryMetrics,
      labelMetrics,
      tagMetrics,
    ] = await Promise.all([
      db.rpc("get_user_metrics"),
      db.rpc("get_product_metrics"),
      db.rpc("get_category_metrics"),
      db.rpc("get_label_metrics"),
      db.rpc("get_tag_metrics"),
    ])

    // Check for errors
    const errors = [
      userMetrics.error,
      productMetrics.error,
      categoryMetrics.error,
      labelMetrics.error,
      tagMetrics.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error(
        "Error fetching admin metrics:",
        errors.map((e) => e?.message)
      )
      throw new Error("Failed to fetch metrics")
    }

    return {
      users: userMetrics.data,
      products: productMetrics.data,
      categories: categoryMetrics.data,
      labels: labelMetrics.data,
      tags: tagMetrics.data,
    }
  } catch (error) {
    console.error("getAllMetrics error:", error)
    throw new Error("Failed to fetch all metrics")
  }
}
