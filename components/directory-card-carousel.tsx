"use client"

import { useState, type ComponentProps } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion } from "motion/react"

import { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import useResourceCounter from "@/hooks/use-resource-click-counter"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Stories,
  StoriesContent,
  StoryCard,
  StoryCardImage,
} from "@/components/ui/stories"

export type DirectoryCardCarouselProps = ComponentProps<"section"> & {
  variant?: "default" | "minimal"
  cardData: Array<Product>
  category?: string
}

export const DirectoryCardCarousel = ({
  variant = "default",
  cardData,
  category,
  className,
  ...props
}: DirectoryCardCarouselProps) => {
  const [open, setOpen] = useState(false)
  const { incrementClickCount } = useResourceCounter()

  const handleProductClick = (productId: string) => {
    incrementClickCount(productId)
  }

  return (
    <section className={cn("w-full px-2 md:px-0 ", className)} {...props}>
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-medium text-foreground tracking-tight">
          {category || "Design Inspiration"}
        </h2>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Link
              href={
                category
                  ? `/categories/${encodeURIComponent(category)}`
                  : "/products"
              }
              className="text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-1.5 text-sm font-medium hover:gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2 py-1"
              aria-label={`View all ${category || "design"} examples`}
            >
              View all
              <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <div className="mx-auto w-full max-w-7xl">
              <DrawerHeader className="text-center">
                <DrawerTitle className="text-2xl font-semibold tracking-tight">
                  {category || "Design Inspiration"} Gallery
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground">
                  Explore all {category?.toLowerCase() || "design"} examples and
                  find inspiration for your next project
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cardData.map((example) => (
                    <article
                      key={example.id}
                      className="bg-card rounded-xl overflow-hidden shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)] hover:shadow-[0px_8px_16px_rgba(0,_0,_0,_0.12),_0px_4px_8px_rgba(0,_0,_0,_0.08),_0px_2px_4px_rgba(0,_0,_0,_0.06)] transition-all duration-300 ease-out group cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 h-full flex flex-col"
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${example.full_name} ${
                        category?.toLowerCase() || "design"
                      } example: ${example.punchline}`}
                      onClick={() => handleProductClick(example.id)}
                    >
                      <StoryCardImage
                        src={example.logo_src || undefined}
                        alt={`${example.full_name || "Product"} ${
                          category?.toLowerCase() || "design"
                        } example`}
                        url={example.product_website}
                      />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </header>

      <div
        className="relative "
        role="region"
        aria-label={`${category || "Design"} examples carousel`}
      >
        <Stories className="w-full">
          <StoriesContent className=" gap-3 ">
            {cardData.map((example) => (
              <div key={example.id} className="flex flex-col">
                <StoryCard
                  variant="compact"
                  path={`/products/${example.id}`}
                  detailsChildren={
                    <div className="flex flex-col items-start gap-0 pl-2 py-4 space-y-1">
                      <p className="text-base font-medium text-foreground">
                        {example.codename}
                      </p>

                      <span className="text-sm text-muted-foreground">
                        {example.punchline.length > 38
                          ? example.punchline.substring(0, 38) + "..."
                          : example.punchline}
                      </span>
                      <div className="flex flex-row gap-2 mt-1">
                        {example?.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-muted-foreground bg-muted-foreground/10 rounded-sm px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                  onClick={() => handleProductClick(example.id)}
                >
                  <StoryCardImage
                    src={example.logo_src || undefined}
                    alt={`${example.full_name || "Product"} ${
                      category?.toLowerCase() || "design"
                    } example`}
                    url={example.product_website}
                  />
                </StoryCard>
              </div>
            ))}
          </StoriesContent>
        </Stories>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background dark:from-muted/10 to-transparent transition-opacity opacity-100"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background dark:from-muted/10 to-transparent transition-opacity opacity-100"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
