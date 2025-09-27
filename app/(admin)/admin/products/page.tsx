import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"
import {
  CirclePlusIcon,
  FileIcon,
  ListFilterIcon,
  PlugIcon,
  PlusIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthStatus } from "@/app/actions/user"

import { SyncFiltersButton } from "./sync-filters-button"
import { AdminTable } from "./table"

export const dynamic = "force-dynamic"

function subMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  return d
}

export default async function Page() {
  const { isAdmin: isUserAdmin } = await getAuthStatus()

  if (!isUserAdmin) {
    redirect("/auth/login")
  }

  const db = await createClient()
  const { data: products } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  // Get the date one month ago
  const oneMonthAgo = subMonths(new Date(), 1)

  // Filter products based on status
  const approvedProducts = products?.filter((product) => product.approved)
  const pendingProducts = products?.filter((product) => !product.approved)
  const newProducts = products?.filter(
    (product) => new Date(product.created_at) >= oneMonthAgo
  )

  return (
    <main className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          <Badge variant="secondary" className="font-medium">
            {products?.length} products
          </Badge>
        </div>

        <div className="max-w-2xl">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Manage submitted products and sync filters to update tags, labels,
            and categories.
          </p>
        </div>
      </div>

      <section className="grid flex-1 items-start gap-4 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <TabsList className="grid w-full grid-cols-4 md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>
            <div className="md:ml-auto flex items-center gap-2">
              <SyncFiltersButton />
              <Button asChild size="sm" className="h-8 gap-1">
                <Link href="/submit-new">
                  <PlusIcon className="h-3.5 w-3.5" />
                  <span className="sm:whitespace-nowrap">Add App</span>
                </Link>
              </Button>
            </div>
          </div>
          <TabsContent value="all">
            <div>
              <CardTitle>All Apps</CardTitle>
              <CardDescription>
                Explore and manage your approved SaaS applications.
              </CardDescription>

              <CardContent className="p-0">
                {products && products.length > 0 && (
                  <AdminTable products={products} />
                )}
              </CardContent>
            </div>
          </TabsContent>
          <TabsContent value="approved">
            <div>
              <div>
                <CardTitle>Approved Apps</CardTitle>
                <CardDescription>
                  Explore and manage your approved SaaS applications.
                </CardDescription>
              </div>
              <CardContent className="p-0">
                {approvedProducts && approvedProducts.length > 0 && (
                  <AdminTable products={approvedProducts} />
                )}
              </CardContent>
            </div>
          </TabsContent>
          <TabsContent value="pending">
            <div>
              <div>
                <CardTitle>Pending Apps</CardTitle>
                <CardDescription>
                  Explore and manage your pending SaaS applications.
                </CardDescription>
              </div>
              <CardContent className="p-0">
                {pendingProducts && pendingProducts.length > 0 && (
                  <AdminTable products={pendingProducts} />
                )}
              </CardContent>
            </div>
          </TabsContent>
          <TabsContent value="new">
            <div>
              <div>
                <CardTitle>New Apps</CardTitle>
                <CardDescription>
                  Explore and manage your new SaaS applications.
                </CardDescription>
              </div>
              <CardContent className="p-0">
                {newProducts && newProducts.length > 0 && (
                  <AdminTable products={newProducts} />
                )}
              </CardContent>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  )
}
