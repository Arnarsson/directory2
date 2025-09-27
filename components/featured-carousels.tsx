"use client"

import { Product } from "@/lib/types"

import { DirectoryCardCarousel } from "./directory-card-carousel"

interface FeaturedCarouselsProps {
  popularProducts: Product[]
  featuredProducts: Product[]
  mostBookmarkedProducts: Product[]
  isLoading?: boolean
}

export function FeaturedCarousels({
  popularProducts,
  featuredProducts,
  mostBookmarkedProducts,
  isLoading = false,
}: FeaturedCarouselsProps) {
  // Only show carousels if there are products to display
  const hasAnyProducts =
    popularProducts.length > 0 ||
    featuredProducts.length > 0 ||
    mostBookmarkedProducts.length > 0

  if (isLoading) {
    return <FeaturedCarouselsSkeleton />
  }

  if (!hasAnyProducts) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Popular Products Carousel */}
      {popularProducts.length > 0 && (
        <DirectoryCardCarousel
          cardData={popularProducts}
          category="Popular"
          // className="px-4"
        />
      )}

      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <DirectoryCardCarousel
          cardData={featuredProducts}
          category="Featured"
          // className="px-4"
        />
      )}

      {/* Most Bookmarked Products Carousel */}
      {mostBookmarkedProducts.length > 0 && (
        <DirectoryCardCarousel
          cardData={mostBookmarkedProducts}
          category="Most Bookmarked"
          className="px-4"
        />
      )}
    </div>
  )
}

// Loading component for Suspense
export function FeaturedCarouselsSkeleton() {
  return (
    <div className="space-y-8 px-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="flex space-x-4 overflow-hidden">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="w-64 h-48 bg-muted rounded-xl animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
