"use client"

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type HTMLAttributes,
  type VideoHTMLAttributes,
} from "react"
import Link from "next/link"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import useResourceCounter from "@/hooks/use-resource-click-counter"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

export type StoriesProps = ComponentProps<typeof Carousel>
export const Stories = ({ className, opts, ...props }: StoriesProps) => (
  <Carousel
    className={cn("w-full", className)}
    opts={{
      align: "start",
      loop: false,
      dragFree: false,
      containScroll: "trimSnaps",
      dragThreshold: 10,
      skipSnaps: false,
      watchDrag: true,
      ...opts,
    }}
    {...props}
  />
)
export type StoriesContentProps = ComponentProps<typeof CarouselContent>
export const StoriesContent = ({
  className,
  ...props
}: StoriesContentProps) => (
  <CarouselContent
    className={cn("-ml-2 gap-2 trackpad-scroll flex", className)}
    {...props}
  />
)
export type StoryProps = HTMLAttributes<HTMLDivElement>
export const Story = ({ className, ...props }: StoryProps) => (
  <CarouselItem
    className={cn("flex-none pl-2 md:pl-4 carousel-item", className)}
  >
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl ",
        "cursor-pointer transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      role="button"
      tabIndex={0}
      {...props}
    />
  </CarouselItem>
)
export type StoryVideoProps = VideoHTMLAttributes<HTMLVideoElement>
const tRegex = /t=(\d+(?:\.\d+)?)/
export const StoryVideo = ({ className, ...props }: StoryVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const initialTimeRef = useRef<number>(0)
  // Parse the initial time from the src attribute (e.g., #t=20)
  useEffect(() => {
    const src = (props.src ?? "") as string
    let initialTime = 0
    if (typeof src === "string") {
      const hashIndex = src.indexOf("#")
      if (hashIndex !== -1) {
        const hash = src.slice(hashIndex + 1)
        // Look for t=number or t=start,end
        const tMatch = hash.match(tRegex)
        if (tMatch) {
          initialTime = Number.parseFloat(tMatch[1])
        }
      }
    }
    initialTimeRef.current = initialTime
  }, [props.src])
  const handleMouseOver = () => {
    videoRef.current?.play()
  }
  const handleMouseOut = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = initialTimeRef.current
    }
  }
  const handleFocus = () => {
    videoRef.current?.play()
  }
  const handleBlur = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = initialTimeRef.current
    }
  }
  return (
    <video
      className={cn(
        "absolute inset-0 size-full object-cover",
        "transition-opacity duration-200",
        "group-hover:opacity-90",
        className
      )}
      loop
      muted
      onBlur={handleBlur}
      onFocus={handleFocus}
      onMouseOut={handleMouseOut}
      onMouseOver={handleMouseOver}
      preload="metadata"
      ref={videoRef}
      tabIndex={0}
      {...props}
    />
  )
}

// Utility function to format URL for display
const formatUrlForDisplay = (url: string): string => {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
    let domain = urlObj.hostname
    // Remove www. prefix if present
    if (domain.startsWith("www.")) {
      domain = domain.substring(4)
    }
    const path = urlObj.pathname === "/" ? "" : urlObj.pathname

    const fullDisplay = domain + path
    if (fullDisplay.length <= 25) {
      return fullDisplay
    }

    // If longer than 25 chars, truncate and add ellipsis
    return fullDisplay.substring(0, 22) + "..."
  } catch {
    // Fallback for invalid URLs
    return url.length > 25 ? url.substring(0, 22) + "..." : url
  }
}

export type StoryCardProps = ComponentProps<typeof Story> & {
  detailsChildren?: React.ReactNode
  variant?: "default" | "compact"
  path: string
}

export const StoryCard = ({
  variant = "default",
  className,
  detailsChildren,
  path,
  children,
  ...props
}: StoryCardProps) => {
  const { incrementClickCount } = useResourceCounter()

  const handleClick = () => {
    // Extract product ID from path (assuming path is /products/{id})
    const productId = path.split("/").pop()
    if (productId) {
      incrementClickCount(productId)
    }
  }

  return (
    <Story
      className={cn(
        "basis-80 min-w-80 p-1",
        variant === "compact" && "basis-64 min-w-64 max-w-64",
        className
      )}
      {...props}
    >
      <Link href={path} onClick={handleClick}>
        <div className="bg-card rounded-xl overflow-hidden shadow-elevation-light dark:shadow-elevation-dark transition-all duration-300 ease-out group cursor-pointer h-full flex flex-col">
          {children}
        </div>
        {detailsChildren}
      </Link>
    </Story>
  )
}

export type StoryCardImageProps = ComponentProps<"img"> & {
  alt: string
  variant?: "default" | "square"
  url: string
}

export const StoryCardImage = ({
  variant = "default",
  src,
  alt,
  url,
  className,
  ...props
}: StoryCardImageProps) => {
  const [isHover, setIsHover] = useState(false)

  // Filter out all incompatible props for motion.img
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    onTransitionEnd,
    onLoad,
    onError,
    ...motionProps
  } = props

  return (
    <div
      className={cn(
        "bg-muted overflow-hidden relative",
        variant === "default" && "aspect-[4/3]",
        variant === "square" && "aspect-square"
      )}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <motion.img
        initial={{ scale: 1 }}
        variants={{
          hidden: { scale: 1 },
          visible: { scale: 1.01 },
        }}
        animate={isHover ? "visible" : "hidden"}
        transition={{ duration: 0.2, ease: "easeOut" }}
        src={src || "/placeholder.svg"}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        {...motionProps}
      />
      <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 absolute inset-0 bg-gradient-to-b from-transparent to-primary/20" />

      <motion.div
        className="absolute bottom-1 left-1"
        animate={isHover ? "visible" : "hidden"}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-col items-start gap-0 px-2 py-1.5 bg-primary/40  rounded-xl">
          <p className="text-xs font-medium text-primary-foreground/90">
            {formatUrlForDisplay(url)}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
