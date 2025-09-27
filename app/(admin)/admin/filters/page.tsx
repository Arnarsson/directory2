import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"
import { BoxIcon, Hash, Plus, TagIcon, TicketPercent } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAuthStatus } from "@/app/actions/user"

import { AddNewItemDialog } from "./add-new-dialog"
import { AdminTable } from "./table"

export const dynamic = "force-dynamic"

async function fetchItems(table: string) {
  const db = await createClient()
  const { data, error } = await db.from(table).select("*")

  if (error) {
    console.error(`Error fetching ${table}:`, error)
    return []
  }
  return data
}

export default async function AdminFiltersDashboard() {
  const { isAdmin: isUserAdmin } = await getAuthStatus()

  if (!isUserAdmin) {
    redirect("/auth/login")
  }

  const categories = await fetchItems("categories")
  const labels = await fetchItems("labels")
  const tags = await fetchItems("tags")

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Filters</h1>
          <Badge variant="secondary" className="font-medium">
            {labels?.length + tags?.length + categories?.length} filters
          </Badge>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Manage filters that appear on the product sidebar. Use the sync
            filters button to update new products tags, labels, and categories.
          </p>
        </div>
      </div>

      {/* Categories Section - Full Width */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BoxIcon className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold">Categories</h2>
          <Badge variant="outline" className="ml-auto">
            {categories.length} items
          </Badge>
          <AddNewItemDialog itemType="category" />
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Organize products into main categories for better discovery and
          navigation.
        </p>
        <div className="bg-card border rounded-lg p-6">
          {categories.length > 0 ? (
            <AdminTable items={categories} itemType="category" />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BoxIcon className="size-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No categories found</p>
              <p className="text-sm">
                Categories will appear here once created
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tags and Labels Section - Side by Side */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Tags Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TagIcon className="size-6 text-primary" />
            <h2 className="text-2xl font-semibold">Tags</h2>
            <Badge variant="outline" className="ml-auto">
              {tags.length} items
            </Badge>
            <AddNewItemDialog itemType="tag" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Create descriptive tags to help users find products by specific
            features or use cases.
          </p>
          <div className="bg-card border rounded-lg p-6">
            {tags.length > 0 ? (
              <AdminTable items={tags} itemType="tag" />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TagIcon className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No tags found</p>
                <p className="text-sm">Tags will appear here once created</p>
              </div>
            )}
          </div>
        </div>

        {/* Labels Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Hash className="size-6 text-primary" />
            <h2 className="text-2xl font-semibold">Labels</h2>
            <Badge variant="outline" className="ml-auto">
              {labels.length} items
            </Badge>
            <AddNewItemDialog itemType="label" />
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Apply labels to highlight special attributes like "Featured", "New",
            or "Popular".
          </p>
          <div className="bg-card border rounded-lg p-6">
            {labels.length > 0 ? (
              <AdminTable items={labels} itemType="label" />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Hash className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No labels found</p>
                <p className="text-sm">Labels will appear here once created</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
