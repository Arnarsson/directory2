import { ReactElement, Suspense } from "react"
import { BoxIcon, Hash, Search, TagIcon } from "lucide-react"

import { transformProductRowWithDefaults } from "@/lib/types"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { Skeleton } from "@/components/ui/skeleton"
import { ResourceCardGrid } from "@/components/directory-card-grid"

import {
  getCachedFilters,
  getCachedPrecomputedCategories,
  getCachedProducts,
} from "../../actions/cached_actions"

export const revalidate = 1800 // 30 minutes instead of 1 hour

// Generate static params for common filter combinations
export async function generateStaticParams() {
  try {
    const filters = await getCachedFilters()

    // Generate static params for common filter combinations
    const staticParams: Array<{ category?: string; tag?: string }> = []

    // Add category pages (limit to top 20 for performance)
    filters.categories
      .filter((c): c is string => c !== null)
      .slice(0, 20)
      .forEach((category) => {
        staticParams.push({ category })
      })

    // Add popular tag pages (limit to top 15 for performance)
    filters.tags.slice(0, 15).forEach((tag) => {
      staticParams.push({ tag })
    })

    return staticParams
  } catch (error) {
    console.warn("Failed to generate static params:", error)
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    label?: string
    tag?: string
  }>
}): Promise<ReactElement> {
  const { search, category, label, tag } = await searchParams

  const rawData = await getCachedProducts(search, category, label, tag)
  const data = rawData.map(transformProductRowWithDefaults)
  let filters = await getCachedFilters()

  // Precompute categories on the server side for better performance
  const precomputedCategories = await getCachedPrecomputedCategories(rawData)

  return (
    <>
      <div className=" max-w-full lg:pt-4">
        <Suspense fallback={<CardGridSkeleton />}>
          <ResourceCardGrid
            sortedData={data}
            filteredFeaturedData={null}
            precomputedCategories={precomputedCategories}
          >
            {search ?? category ?? label ?? tag ? (
              <div className="md:mr-auto mx-auto flex flex-col items-center md:items-start">
                <div className="flex mb-1 justify-center md:justify-start">
                  {search ? (
                    <Search className="mr-1 bg-neutral-800 fill-yellow-300/30 stroke-yellow-500 size-6 p-1 rounded-full" />
                  ) : null}
                  {category ? (
                    <BoxIcon className="mr-1 bg-neutral-800 fill-yellow-300/30 stroke-yellow-500 size-6 p-1 rounded-full" />
                  ) : null}
                  {label ? (
                    <Hash className="mr-1 bg-neutral-800 fill-yellow-300/30 stroke-yellow-500 size-6 p-1 rounded-full" />
                  ) : null}
                  {tag ? (
                    <TagIcon className="mr-1 bg-neutral-800 fill-yellow-300/30 stroke-yellow-500 size-6 p-1 rounded-full" />
                  ) : null}
                  {search ? "search" : ""}
                  {category ? "category" : ""}
                  {label ? "label" : ""}
                  {tag ? "tag" : ""}
                </div>
                <GradientHeading size="xxl">
                  {search ?? category ?? label ?? tag}
                </GradientHeading>
              </div>
            ) : null}

            {/* <Separator className="mb-12 ml-auto w-[85%] bg-black/5 h-[2px] animate-pulse rounded-l-full" /> */}
          </ResourceCardGrid>
        </Suspense>
      </div>
    </>
  )
}

const CardGridSkeleton = () => {
  return (
    <div className="flex flex-col md:items-start gap-4 overflow-hidden pb-4 md:mx-4 p-[1px] mx-0 relative">
      {/* Search skeleton */}
      <div className="px-4 md:p-4 md:gap-3">
        <Skeleton className="h-12 w-full max-w-md" />
      </div>

      {/* Category carousels skeleton */}
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton
                  key={j}
                  className="h-48 w-64 flex-shrink-0 rounded-lg"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="p-4 w-full">
        <div className="columns-1 lg:columns-2 xl:columns-3 2xl:columns-4 3xl:columns-4 space-y-3 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className="h-64 w-full mb-3 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
