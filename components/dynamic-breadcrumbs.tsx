"use client"

import React from "react"

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"
import { ProductBreadcrumb } from "@/components/ui/breadcrumb-client"
import {
  DefaultErrorFallback,
  ErrorBoundary,
} from "@/components/ui/error-boundary"

// Main component that can be safely imported in server components
export function DynamicBreadcrumbs() {
  return (
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <DynamicBreadcrumbsContent />
    </ErrorBoundary>
  )
}

// Internal component that handles the actual logic
function DynamicBreadcrumbsContent() {
  let breadcrumbs = useBreadcrumbs()

  // Ensure we have valid breadcrumbs before rendering
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  return <ProductBreadcrumb items={breadcrumbs} />
}
