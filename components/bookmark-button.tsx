"use client"

import { useState, useTransition } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleBookmark } from "@/app/actions/bookmark"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  productId: string
  initialBookmarked?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}

export function BookmarkButton({ 
  productId, 
  initialBookmarked = false, 
  size = "default",
  variant = "outline",
  className 
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    startTransition(async () => {
      const previousState = isBookmarked
      setIsBookmarked(!isBookmarked)
      
      const result = await toggleBookmark(productId)
      
      if (!result.success) {
        setIsBookmarked(previousState)
        toast.error(result.error || "Failed to update bookmark")
      } else {
        toast.success(
          isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
        )
      }
    })
  }

  const Icon = isBookmarked ? BookmarkCheck : Bookmark

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isPending}
      className={cn(
        "transition-all duration-200",
        isBookmarked && "text-primary",
        className
      )}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Icon className={cn(
        "h-4 w-4",
        size === "sm" && "h-3 w-3",
        size === "lg" && "h-5 w-5",
        isPending && "animate-pulse"
      )} />
      {size !== "icon" && (
        <span className="ml-2">
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  )
}