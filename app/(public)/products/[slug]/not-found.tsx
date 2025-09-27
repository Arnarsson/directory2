"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-8xl font-bold text-foreground/20 select-none tracking-tight">
            404
          </h1>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Page not found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The page you are looking for doesn't exist.
            </p>
          </div>
        </div>

        <Button
          asChild
          className="shadow-[0px_1px_0px_0px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_hsla(0,_0%,_0%,_0.02)_inset,_0px_0px_0px_1px_rgba(255,_255,_255,_0.25)] hover:shadow-[0px_2px_4px_0px_rgba(0,_0,_0,_0.1)] transition-shadow"
        >
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}
