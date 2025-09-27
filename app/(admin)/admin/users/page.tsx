import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAuthStatus } from "@/app/actions/user"

import { UserAdminTable } from "./table"

export const dynamic = "force-dynamic"

export default async function UserDashboard() {
  const { isAdmin: isUserAdmin } = await getAuthStatus()

  if (!isUserAdmin) {
    redirect("/auth/login")
  }

  const db = await createClient()
  const { data: users, error } = await db
    .from("users")
    .select("id, full_name, avatar_url")

  if (error) {
    console.error("Error fetching users:", error)
    return <div>Error loading users</div>
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Users</h1>
          <Badge variant="secondary" className="font-medium">
            {users?.length} users
          </Badge>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Manage users who have signed up or added products to the directory.
          </p>
        </div>
      </div>

      <div>
        <CardTitle>User Dashboard</CardTitle>
        <CardDescription>Manage user information and settings.</CardDescription>

        <CardContent className="p-0 mt-6">
          {users && users.length > 0 ? (
            <UserAdminTable users={users} />
          ) : (
            <div>No users found</div>
          )}
        </CardContent>
      </div>
    </main>
  )
}
