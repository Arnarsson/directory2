"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"

import { useCurrentUserMeta } from "@/hooks/use-current-user-meta"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"

export function NavUser({ onLogout }: { onLogout: () => Promise<void> }) {
  const { isMobile } = useSidebar()
  const { image: profileImage, name } = useCurrentUserMeta()

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        ?.map((word) => word[0])
        ?.join("")
        ?.toUpperCase() || "U"
    )
  }

  // Get user display name
  const getUserDisplayName = () => {
    return name || "User"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt={getUserDisplayName()} />
                ) : (
                  <AvatarFallback className="rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-300">
                    {getUserInitials(name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {getUserDisplayName()}
                </span>
                <span className="truncate text-xs">Account</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {profileImage ? (
                    <AvatarImage
                      src={profileImage}
                      alt={getUserDisplayName()}
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg bg-gradient-to-r from-yellow-300 to-yellow-300">
                      {getUserInitials(name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {getUserDisplayName()}
                  </span>
                  <span className="truncate text-xs">Account</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <span className="text-xs text-muted-foreground">
                  Signed in as {name || "User"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <ThemeSwitcher />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
