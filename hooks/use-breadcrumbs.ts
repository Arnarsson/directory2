"use client"

import { useMemo } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { useIsMobile } from "./use-mobile"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  return useMemo(() => {
    // Ensure pathname is valid
    if (!pathname || typeof pathname !== "string") {
      return []
    }

    const segments = pathname.split("/").filter(Boolean)
    let breadcrumbs: BreadcrumbItem[] = []

    // Check if we're on a product detail page - if so, return empty array
    // to avoid duplicate breadcrumbs (ProductBreadcrumb will handle this)
    if (
      segments[0] === "products" &&
      segments[1] &&
      segments[1] !== "details"
    ) {
      return []
    }

    if (!isMobile && pathname !== "/") {
      breadcrumbs.push({
        label: "home",
        href: "/",
      })
    }

    if (segments.length === 0) {
      return breadcrumbs
    }

    // Handle specific routes
    if (segments[0] === "admin") {
      breadcrumbs.push({
        label: "admin",
        href: "/admin",
      })

      if (segments[1]) {
        const adminPages: Record<string, string> = {
          products: "products",
          users: "users",
          filters: "filters",
        }

        if (adminPages[segments[1]]) {
          breadcrumbs.push({
            label: adminPages[segments[1]],
            href: `/admin/${segments[1]}`,
          })
        }
      }
    } else if (segments[0] === "products") {
      breadcrumbs.push({
        label: "products",
        href: "/products",
      })

      // Handle product filters
      const category = searchParams?.get("category")
      const tag = searchParams?.get("tag")
      const label = searchParams?.get("label")
      const search = searchParams?.get("search")

      if (search) {
        breadcrumbs.push({
          label: `Search: ${search}`,
          href: `/products?search=${search}`,
        })
      } else if (category) {
        breadcrumbs.push({
          label: `Category: ${category}`,
          href: `/categories/${encodeURIComponent(category)}`,
        })
      } else if (tag) {
        breadcrumbs.push({
          label: `Tag: ${tag}`,
          href: `/tags/${encodeURIComponent(tag)}`,
        })
      } else if (label) {
        breadcrumbs.push({
          label: `Label: ${label}`,
          href: `/labels/${encodeURIComponent(label)}`,
        })
      }

      // Note: Product detail pages are handled above with early return
    } else if (segments[0] === "categories" && segments[1]) {
      breadcrumbs.push({
        label: "categories",
        href: "/products",
      })
      breadcrumbs.push({
        label: decodeURIComponent(segments[1]),
        href: `/categories/${segments[1]}`,
      })
    } else if (segments[0] === "tags" && segments[1]) {
      breadcrumbs.push({
        label: "tags",
        href: "/products",
      })
      breadcrumbs.push({
        label: decodeURIComponent(segments[1]),
        href: `/tags/${segments[1]}`,
      })
    } else if (segments[0] === "labels" && segments[1]) {
      breadcrumbs.push({
        label: "labels",
        href: "/products",
      })
      breadcrumbs.push({
        label: decodeURIComponent(segments[1]),
        href: `/labels/${segments[1]}`,
      })
    } else if (segments[0] === "submit") {
      breadcrumbs.push({
        label: "submit",
        href: "/submit-new",
      })
    } else if (segments[0] === "auth") {
      breadcrumbs.push({
        label: "auth",
        href: "/auth",
      })

      if (segments[1]) {
        const authPages: Record<string, string> = {
          login: "login",
          "sign-up": "sign-up",
          "forgot-password": "forgot-password",
          "update-password": "update-password",
          confirm: "confirm",
          error: "error",
          "sign-up-success": "sign-up-success",
        }

        if (authPages[segments[1]]) {
          breadcrumbs.push({
            label: authPages[segments[1]],
            href: `/auth/${segments[1]}`,
          })
        }
      }
    }

    return breadcrumbs
  }, [pathname, searchParams])
}
