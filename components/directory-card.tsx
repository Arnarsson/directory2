"use client"

import { useOptimistic, useTransition } from "react"
import type React from "react"
import Link from "next/link"
import { Tag } from "lucide-react"
import { motion } from "motion/react"

import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useBookmarkStatus } from "@/hooks/use-bookmark-status"
import useResourceCounter from "@/hooks/use-resource-click-counter"
import MinimalCard, {
  MinimalCardContent,
  MinimalCardDescription,
  MinimalCardFooter,
  MinimalCardImage,
  MinimalCardTitle,
} from "@/components/ui/minimal-card"
import { BookmarkButton } from "@/components/bookmark-button"

export const getBasePath = (url: string) => {
  return new URL(url).hostname.replace("www.", "").split(".")[0]
}

export const getLastPathSegment = (url: string, maxLength: number): string => {
  try {
    const pathname = new URL(url).pathname
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments.pop() || ""

    if (lastSegment.length > maxLength) {
      return `/${lastSegment.substring(0, maxLength)}`
    }

    return lastSegment ? `/${lastSegment}` : ""
  } catch (error) {
    console.error("Invalid URL:", error)
    return ""
  }
}

export const DirectoryProductCard: React.FC<{
  trim?: boolean
  data: Product
  order: any
}> = ({ data, order }) => {
  const [isPending, startTransition] = useTransition()
  const [optimisticResource, addOptimisticUpdate] = useOptimistic<
    Product,
    Partial<Product>
  >(data, (currentResource, newProperties) => {
    return { ...currentResource, ...newProperties }
  })
  const { incrementClickCount } = useResourceCounter()

  const handleClick = () => {
    startTransition(() => {
      const newClickCount = (optimisticResource.view_count || 0) + 1

      addOptimisticUpdate({ view_count: newClickCount })

      incrementClickCount(data.id).catch((error) => {
        console.error("Failed to increment click count:", error)
      })
    })
  }

  return (
    <motion.div
      key={`resource-card-${data.id}-${order}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative  break-inside-avoid w-full"
    >
      <div className="w-full relative">
        <Link
          href={`/products/${data.id}`}
          key={`/products/${data.id}`}
          onClick={handleClick}
        >
          <DirectoryProductCardContent
            data={data}
            view_count={optimisticResource.view_count}
            showBookmarkButton={false}
          />
        </Link>

        {/* Bookmark button positioned outside the Link to avoid nesting */}
        <div className="absolute top-3 right-3 z-10">
          <BookmarkButton
            productId={data.id}
            size="icon"
            className="h-8 w-8 rounded-tr-[12px] rounded-l-lg rounded-br-lg"
          />
        </div>
      </div>
    </motion.div>
  )
}

export function DirectoryProductCardContent({
  data,
  view_count,
  trim = false,
  showBookmarkButton = true,
}: {
  data: Product
  view_count: number | null
  trim?: boolean
  showBookmarkButton?: boolean
}) {
  const { isBookmarked, isLoading } = useBookmarkStatus(data.id)
  const { incrementClickCount } = useResourceCounter()

  const handleCardClick = () => {
    // Track clicks when the card itself is clicked
    incrementClickCount(data.id).catch((error) => {
      console.error("Failed to increment click count:", error)
    })
  }

  return (
    <MinimalCard className="w-full relative" onClick={handleCardClick}>
      {data.logo_src ? (
        <MinimalCardImage alt={data.codename} src={data.logo_src} />
      ) : null}

      <MinimalCardTitle className="font-semibold mb-3">
        {data.codename.substring(0, 30)}
      </MinimalCardTitle>

      <MinimalCardDescription className="text-sm">
        {trim ? `${data.description.slice(0, 82)}...` : data.description}
      </MinimalCardDescription>

      <MinimalCardContent />

      {showBookmarkButton && (
        <div
          className={cn(
            "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10",
            isBookmarked && "opacity-100"
          )}
        >
          {!isLoading && (
            <BookmarkButton
              productId={data.id}
              initialBookmarked={isBookmarked}
              size="icon"
              // variant="secondary"
              className="h-8 w-8 rounded-tr-[12px] rounded-l-lg rounded-br-lg"
            />
          )}
        </div>
      )}

      <MinimalCardFooter>
        <div
          className={cn(
            "p-1 py-1.5 px-1.5 rounded-md text-neutral-500 flex items-center gap-1  absolute bottom-2 left-2 rounded-br-[16px]",
            (view_count || 0) > 1 ? "  block" : "hidden"
          )}
        >
          <p className="flex items-center gap-1 tracking-tight text-neutral pr-1 text-xs">
            {view_count || data.view_count || 0}
          </p>
        </div>
        {data.labels && data.labels.length > 0 && (
          <div className="p-1 py-1.5 px-1.5 rounded-md text-neutral-500 flex items-center gap-1  absolute bottom-2 right-2 rounded-br-[16px]">
            <Tag className="h-4 w-4 ml-[1px]" />
            <p className="flex items-center gap-1 tracking-tight text-neutral pr-1 text-xs">
              {data.labels[0]}
            </p>
          </div>
        )}
      </MinimalCardFooter>
    </MinimalCard>
  )
}
