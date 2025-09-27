"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/db/supabase/client"
import { NotepadText } from "lucide-react"

import {
  BarChartIcon,
  Bookmark,
  BoxIcon,
  FilterIcon,
  FolderOpenIcon,
  HomeIcon,
  LogIn,
  PlusIcon,
  ShieldCheckIcon,
  TagIcon,
  User,
  UsersIcon,
} from "@/lib/icons"
import { fromSnakeCase } from "@/lib/tag-label-utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  categories?: string[]
  labels?: string[]
  tags?: string[]
  filtersAction: Promise<{
    categories: (string | null)[]
    labels: string[]
    tags: string[]
  }>
}

export function AppSidebar({
  categories = [],
  labels = [],
  tags = [],
  filtersAction,
  ...props
}: AppSidebarProps) {
  const { isAuthenticated, user, isAdmin: isUserAdmin, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isAdmin = pathname.includes("admin")
  const filters = React.use(filtersAction)

  const finalCategories =
    filters.categories.length > 0
      ? filters.categories
      : categories.length > 0
      ? categories
      : filters.categories.filter((c): c is string => c !== null)
  const finalLabels =
    filters.labels.length > 0
      ? filters.labels
      : labels.length > 0
      ? labels
      : filters.labels
  const finalTags =
    filters.tags.length > 0
      ? filters.tags
      : tags.length > 0
      ? tags
      : filters.tags

  const handleLogout = async () => {
    const db = await createClient()
    const { error } = await db.auth.signOut()
    if (error) {
      console.error("Error logging out:", error.message)
    } else {
      router.push("/auth/login")
    }
  }

  // Admin navigation data
  const adminNavData = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: BarChartIcon,
      isActive: pathname === "/admin",
      items: [],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: FolderOpenIcon,
      isActive: pathname === "/admin/products",
      items: [],
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: UsersIcon,
      isActive: pathname === "/admin/users",
      items: [],
    },
    {
      title: "Filters",
      url: "/admin/filters",
      icon: FilterIcon,
      isActive: pathname === "/admin/filters",
      items: [],
    },
  ]

  // Product navigation data - only show if we have data
  const productNavData = [
    ...(finalCategories.length > 0
      ? [
          {
            title: "Categories",
            url: "#",
            icon: BoxIcon,
            isActive: pathname.startsWith("/categories/"),
            items: finalCategories
              .filter((c): c is string => c !== null)
              .map((category) => ({
                title: category,
                url: `/categories/${encodeURIComponent(category)}`,
                isActive: pathname.startsWith(
                  `/categories/${encodeURIComponent(category)}`
                ),
              })),
          },
        ]
      : []),
    ...(finalTags.length > 0
      ? [
          {
            title: "Tags",
            url: "#",
            icon: TagIcon,
            isActive: pathname.startsWith("/tags/"),
            items: finalTags.map((tag) => ({
              title: fromSnakeCase(tag),
              url: `/tags/${encodeURIComponent(tag)}`,
              isActive: pathname.startsWith(`/tags/${encodeURIComponent(tag)}`),
            })),
          },
        ]
      : []),
    ...(finalLabels.length > 0
      ? [
          {
            title: "Labels",
            url: "#",
            icon: NotepadText,
            isActive: pathname.startsWith("/labels/"),
            items: finalLabels.map((label) => ({
              title: fromSnakeCase(label),
              url: `/labels/${encodeURIComponent(label)}`,
              isActive: pathname.startsWith(
                `/labels/${encodeURIComponent(label)}`
              ),
            })),
          },
        ]
      : []),
  ]

  // Secondary navigation for non-admin - conditionally show auth options
  const secondaryNavData = [
    {
      title: "Home",
      url: "/",
      isActive: pathname === "/",
      icon: HomeIcon,
    },
    {
      title: "Submit",
      url: "/submit-new",
      isActive: pathname === "/submit-new",
      icon: PlusIcon,
    },
    // Show user features when authenticated
    ...(isAuthenticated === true && user?.id
      ? [
          {
            title: "My Bookmarks",
            url: "/bookmarks",
            isActive: pathname === "/bookmarks",
            icon: Bookmark,
          },
          {
            title: "My Profile",
            url: `/profile/${user.id}`,
            isActive: pathname === `/profile/${user.id}`,
            icon: User,
          },
        ]
      : []),
    // Only show login/sign-up when not authenticated
    ...(isAuthenticated === false
      ? [
          {
            title: "Login",
            url: "/auth/login",
            icon: LogIn,
          },
        ]
      : []),
  ]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <LogoAnimationLink />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isAdmin ? (
          <NavMain items={adminNavData} />
        ) : (
          <>{productNavData.length > 0 && <NavMain items={productNavData} />}</>
        )}
      </SidebarContent>
      <SidebarFooter className="bg-background dark:bg-muted/60 shadow-elevation-light dark:shadow-elevation-dark rounded-xl m-1 lg:m-0">
        {isUserAdmin ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">
              <ShieldCheckIcon className="w-4 h-4" />
              Admin
            </Link>
          </Button>
        ) : null}
        <NavSecondary items={secondaryNavData} className="mt-auto" />
        <NavUser onLogout={handleLogout} />
      </SidebarFooter>
    </Sidebar>
  )
}

function LogoAnimationLink({ onClick }: { onClick?: () => void }) {
  return (
    <Button className="" variant="outline" asChild>
      <Link href="/" className="flex justify-center" onClick={onClick}>
        <CultIcon
          className="h-6 w-6 fill-black dark:fill-white"
          aria-hidden="true"
        />
        <h1>Directory </h1>
      </Link>
    </Button>
  )
}

function CultIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={260}
      height={478}
      viewBox="0 0 260 478"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className=""
        d="M130 216.896c-23.894 0-43.333-19.439-43.333-43.333S106.106 130.23 130 130.23s43.333 19.439 43.333 43.333-19.439 43.333-43.333 43.333zm0 173.794c23.894 0 43.333 19.439 43.333 43.333S153.894 477.356 130 477.356s-43.333-19.439-43.333-43.333S106.106 390.69 130 390.69zm86.667-304.023c-23.895 0-43.334-19.44-43.334-43.334C173.333 19.44 192.772 0 216.667 0 240.561 0 260 19.439 260 43.333c0 23.895-19.439 43.334-43.333 43.334zm0 173.792c23.894 0 43.333 19.439 43.333 43.334 0 23.894-19.439 43.333-43.333 43.333-23.895 0-43.334-19.439-43.334-43.333 0-23.895 19.439-43.334 43.334-43.334zM43.333 86.667C19.44 86.667 0 67.227 0 43.333 0 19.44 19.439 0 43.333 0c23.895 0 43.334 19.439 43.334 43.333 0 23.895-19.44 43.334-43.334 43.334zm0 173.792c23.895 0 43.334 19.439 43.334 43.334 0 23.894-19.44 43.333-43.334 43.333C19.44 347.126 0 327.687 0 303.793c0-23.895 19.439-43.334 43.333-43.334z"
        fill={props.fill}
      />
    </svg>
  )
}
