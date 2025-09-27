"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const router = useRouter()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url} aria-label={item.title}>
                <SidebarMenuButton
                  size="sm"
                  className={cn(
                    item.isActive &&
                      "bg-card/90 shadow-elevation-light dark:shadow-elevation-dark text-primary font-medium ",
                    "cursor-pointer"
                  )}
                  // onClick={() => router.push(item.url)}
                >
                  <item.icon
                    className={cn(
                      item.isActive ? "fill-primary/30" : "fill-primary/5"
                    )}
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
