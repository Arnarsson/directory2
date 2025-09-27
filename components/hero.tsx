import type React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { defaultSEOConfig } from "@/lib/seo-config"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GradientHeading } from "@/components/ui/gradient-heading"

export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <div className="w-full space-y-6">
      {/* Status Badge */}
      <div className="flex justify-start">
        <Badge
          variant="secondary"
          className="bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium rounded-full shadow-sm"
        >
          <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2 animate-pulse" />
          143 spots left
        </Badge>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Title Section */}
        <div className="space-y-4">
          <GradientHeading size="lg" weight="black" className="leading-[0.9]">
            {defaultSEOConfig.site.name}
          </GradientHeading>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
            {defaultSEOConfig.site.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Button
            asChild
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-5 text-base font-medium rounded-full h-12"
          >
            <Link href="/submit-new" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Submit Tool
            </Link>
          </Button>
          {children && <div className="w-full">{children}</div>}
        </div>
      </div>
    </div>
  )
}
