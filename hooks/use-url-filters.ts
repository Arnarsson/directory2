"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { updateFilterParams } from "@/lib/utils"

export function useUrlFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = useCallback(
    (updates: {
      categories?: string[]
      labels?: string[]
      tags?: string[]
    }) => {
      const newParams = updateFilterParams(searchParams, updates)
      const newUrl = `${window.location.pathname}?${newParams.toString()}`
      router.push(newUrl)
    },
    [searchParams, router]
  )

  const clearFilters = useCallback(() => {
    router.push(window.location.pathname)
  }, [router])

  const getFilters = useCallback(
    () => ({
      categories:
        searchParams.get("categories")?.split(",").filter(Boolean) || [],
      labels: searchParams.get("labels")?.split(",").filter(Boolean) || [],
      tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    }),
    [searchParams]
  )

  return {
    filters: getFilters(),
    updateFilters,
    clearFilters,
  }
}
