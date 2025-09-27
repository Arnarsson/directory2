"use client"

import React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  SimpleBreadcrumb,
} from "@/components/ui/breadcrumb"

// Client-side breadcrumb component with schema markup
interface ProductBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showSchema?: boolean
}

const ProductBreadcrumb = React.forwardRef<
  React.ElementRef<typeof SimpleBreadcrumb>,
  ProductBreadcrumbProps
>(({ items, className, showSchema = true }, ref) => {
  if (!items || items.length === 0) return null
  const isMobile = useIsMobile()
  // Generate schema markup for breadcrumbs
  React.useEffect(() => {
    if (!showSchema || typeof window === "undefined") return

    try {
      // Remove existing breadcrumb schema
      const existingScript = document.querySelector(
        'script[data-schema="breadcrumb"]'
      )
      if (existingScript) {
        existingScript.remove()
      }

      // Create breadcrumb schema
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.setAttribute("data-schema", "breadcrumb")

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: item.href ? `${window.location.origin}${item.href}` : undefined,
        })),
      }

      script.textContent = JSON.stringify(breadcrumbSchema)
      document.head.appendChild(script)

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    } catch (error) {
      console.error("Error setting up breadcrumb schema:", error)
    }
  }, [items, showSchema])

  return <SimpleBreadcrumb ref={ref} items={items} className={className} />
})

// Ensure proper display name for React 19 compatibility
ProductBreadcrumb.displayName = "ProductBreadcrumb"

// Enhanced breadcrumb component for product pages
interface ProductBreadcrumbsProps {
  product: {
    codename: string
    categories?: string
    id: string
  }
  className?: string
}

const ProductBreadcrumbs = React.forwardRef<
  React.ElementRef<typeof ProductBreadcrumb>,
  ProductBreadcrumbsProps
>(({ product, className }, ref) => {
  let breadcrumbs = [
    // { label: "home", href: "/" },
    { label: "products", href: "/products" },
    ...(product.categories
      ? [
          {
            label: product.categories,
            href: `/categories/${encodeURIComponent(product.categories)}`,
          },
        ]
      : []),
    { label: product.codename.toLowerCase(), href: `/products/${product.id}` },
  ]

  return (
    <ProductBreadcrumb
      ref={ref}
      items={breadcrumbs}
      className={className}
      showSchema={true}
    />
  )
})

// Ensure proper display name for React 19 compatibility
ProductBreadcrumbs.displayName = "ProductBreadcrumbs"

export {
  BreadcrumbSeparator,
  SimpleBreadcrumb,
  ProductBreadcrumb,
  ProductBreadcrumbs,
}
