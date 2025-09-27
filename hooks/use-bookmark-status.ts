"use client"

import { useState, useEffect } from "react"
import { isProductBookmarked } from "@/app/actions/bookmark"

export function useBookmarkStatus(productId: string) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkBookmarkStatus() {
      try {
        const bookmarked = await isProductBookmarked(productId)
        setIsBookmarked(bookmarked)
      } catch (error) {
        console.error("Error checking bookmark status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkBookmarkStatus()
  }, [productId])

  return { isBookmarked, isLoading, setIsBookmarked }
}