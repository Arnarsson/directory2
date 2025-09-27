import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"

import { getAuthStatus } from "../../actions/user"
import {
  getCategoryMetrics,
  getLabelMetrics,
  getProductMetrics,
  getTagMetrics,
  getUserMetrics,
} from "./actions"
import { AnalyticsOverview } from "./overview"

export const dynamic = "force-dynamic"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims) {
    redirect("/")
  }

  const isAdmin = claims?.app_metadata?.claims_admin

  if (!isAdmin) {
    redirect("/")
  }

  const [users, products, categories, labels, tags] = await Promise.allSettled([
    getUserMetrics(),
    getProductMetrics(),
    getCategoryMetrics(),
    getLabelMetrics(),
    getTagMetrics(),
  ])

  const userMetrics = users.status === "fulfilled" ? users.value : []
  const productMetrics = products.status === "fulfilled" ? products.value : []
  const categoryMetrics =
    categories.status === "fulfilled" ? categories.value : []
  const labelMetrics = labels.status === "fulfilled" ? labels.value : []
  const tagMetrics = tags.status === "fulfilled" ? tags.value : []

  return (
    <main className="px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsOverview
          users={userMetrics}
          products={productMetrics}
          categories={categoryMetrics}
          labels={labelMetrics}
          tags={tagMetrics}
        />
      </Suspense>
    </main>
  )
}
