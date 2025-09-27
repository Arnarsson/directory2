"use client"

import React from "react"
import {
  Box,
  Hash,
  Package,
  Search,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface MetricData {
  month: string
  total: number
}

interface OverviewChartProps {
  data: MetricData[]
  title: string
}

const OverviewChart: React.FC<OverviewChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] @[350px]/chart:h-[350px] @[450px]/chart:h-[400px] flex items-center justify-center ">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm font-medium">No data available</p>
          <p className="text-xs">
            Data will appear here once metrics are collected
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-[300px] @[350px]/chart:h-[350px]  @[450px]/chart:h-[300px] ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 1, left: 1, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#666" }}
          />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#666" }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface AnalyticsOverviewProps {
  users: MetricData[]
  products: MetricData[]
  categories: MetricData[]
  labels: MetricData[]
  tags: MetricData[]
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  users,
  products,
  categories,
  labels,
  tags,
}) => {
  // Calculate metrics for the cards
  const userCount = users.length > 0 ? users[users.length - 1]?.total || 0 : 0
  const productCount =
    products.length > 0 ? products[products.length - 1]?.total || 0 : 0
  const categoryCount =
    categories.length > 0 ? categories[categories.length - 1]?.total || 0 : 0
  const tagCount = tags.length > 0 ? tags[tags.length - 1]?.total || 0 : 0

  // Calculate growth rates (simplified - comparing last two data points)
  const getUserGrowth = () => {
    if (users.length < 2) return { value: 0, isPositive: true }
    const current = users[users.length - 1]?.total || 0
    const previous = users[users.length - 2]?.total || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const getProductGrowth = () => {
    if (products.length < 2) return { value: 0, isPositive: true }
    const current = products[products.length - 1]?.total || 0
    const previous = products[products.length - 2]?.total || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const getLabelGrowth = () => {
    if (labels.length < 2) return { value: 0, isPositive: true }
    const current = labels[labels.length - 1]?.total || 0
    const previous = labels[labels.length - 2]?.total || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const getCategoryGrowth = () => {
    if (categories.length < 2) return { value: 0, isPositive: true }
    const current = categories[categories.length - 1]?.total || 0
    const previous = categories[categories.length - 2]?.total || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const getTagGrowth = () => {
    if (tags.length < 2) return { value: 0, isPositive: true }
    const current = tags[tags.length - 1]?.total || 0
    const previous = tags[tags.length - 2]?.total || 0
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const userGrowth = getUserGrowth()
  const productGrowth = getProductGrowth()
  const categoryGrowth = getCategoryGrowth()
  const tagGrowth = getTagGrowth()

  return (
    <div className="space-y-8">
      {/* Metrics Cards with Container Queries */}
      <div className="*:data-[slot=card]:from-muted/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-sm text-muted-foreground">
              Total Users
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {userCount.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {userGrowth.isPositive ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {userGrowth.isPositive ? "+" : "-"}
                {userGrowth.value.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-xs">
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {userGrowth.isPositive ? "Growing user base" : "User decline"}
              {userGrowth.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {userGrowth.isPositive
                ? "Strong user acquisition"
                : "Needs attention"}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-sm text-muted-foreground">
              Total Products
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {productCount.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {productGrowth.isPositive ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {productGrowth.isPositive ? "+" : "-"}
                {productGrowth.value.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-xs">
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {productGrowth.isPositive ? "Product growth" : "Product decline"}
              {productGrowth.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {productGrowth.isPositive
                ? "Catalog expanding"
                : "Inventory needs review"}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-sm text-muted-foreground">
              Total Categories
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {categoryCount.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {categoryGrowth.isPositive ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {categoryGrowth.isPositive ? "+" : "-"}
                {categoryGrowth.value.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-xs">
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {categoryGrowth.isPositive
                ? "Category expansion"
                : "Category reduction"}
              {categoryGrowth.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {categoryGrowth.isPositive
                ? "Organizing content better"
                : "Consolidation needed"}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-sm text-muted-foreground">
              Total Tags
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
              {tagCount.toLocaleString()}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {tagGrowth.isPositive ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {tagGrowth.isPositive ? "+" : "-"}
                {tagGrowth.value.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-xs">
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {tagGrowth.isPositive ? "Tag growth" : "Tag reduction"}
              {tagGrowth.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
            </div>
            <div className="text-muted-foreground text-xs">
              {tagGrowth.isPositive
                ? "Better content discovery"
                : "Tag cleanup needed"}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section with Container Queries */}
      <div className="*:data-[slot=card]:from-muted/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <Card className="@container/chart col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base @[300px]/chart:text-lg @[400px]/chart:text-xl">
              <Users className="size-5 @[300px]/chart:size-6 text-muted-foreground" />
              User Metrics
            </CardTitle>
            <CardDescription className="text-xs @[300px]/chart:text-sm text-muted-foreground">
              User activity and growth trends.
            </CardDescription>
            {users.length > 0 && (
              <div className="mb-4 p-2 bg-muted/30 rounded-md border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-semibold">
                    {users[users.length - 1]?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Monthly Change:</span>
                  <span
                    className={
                      getUserGrowth().isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {getUserGrowth().isPositive ? "+" : "-"}
                    {getUserGrowth().value.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="px-4 @[300px]/chart:px-1">
            <OverviewChart data={users} title="User Metrics" />
          </CardContent>
        </Card>

        <Card className="@container/chart col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base @[400px]/chart:text-lg @[500px]/chart:text-xl">
              <Package className="size-5 @[400px]/chart:size-6 text-muted-foreground" />
              Product Metrics
            </CardTitle>
            <CardDescription className="text-xs @[400px]/chart:text-sm text-muted-foreground">
              Product catalog performance and inventory trends.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 @[400px]/chart:px-6">
            {products.length > 0 && (
              <div className="mb-4 p-2 bg-muted/30 rounded-md border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-semibold">
                    {products[products.length - 1]?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Monthly Change:</span>
                  <span
                    className={
                      getProductGrowth().isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {getProductGrowth().isPositive ? "+" : "-"}
                    {getProductGrowth().value.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            <OverviewChart data={products} title="Product Metrics" />
          </CardContent>
        </Card>

        <Card className="@container/chart col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base @[400px]/chart:text-lg @[500px]/chart:text-xl">
              <Hash className="size-5 @[400px]/chart:size-6 text-muted-foreground" />
              Label Metrics
            </CardTitle>
            <CardDescription className="text-xs @[400px]/chart:text-sm text-muted-foreground">
              Label performance and distribution analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 @[400px]/chart:px-6">
            {labels.length > 0 && (
              <div className="mb-4 p-2 bg-muted/30 rounded-md border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-semibold">
                    {labels[labels.length - 1]?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Monthly Change:</span>
                  <span
                    className={
                      getLabelGrowth().isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {getLabelGrowth().isPositive ? "+" : "-"}
                    {getLabelGrowth().value.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            <OverviewChart data={labels} title="Label Metrics" />
          </CardContent>
        </Card>

        <Card className="@container/chart col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base @[300px]/chart:text-lg @[400px]/chart:text-xl">
              <Box className="size-5 @[300px]/chart:size-6 text-muted-foreground" />
              Category Metrics
            </CardTitle>
            <CardDescription className="text-xs @[300px]/chart:text-sm text-muted-foreground">
              Category organization and content structure.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 @[300px]/chart:px-6">
            {categories.length > 0 && (
              <div className="mb-4 p-2 bg-muted/30 rounded-md border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-semibold">
                    {categories[categories.length - 1]?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Monthly Change:</span>
                  <span
                    className={
                      getCategoryGrowth().isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {getCategoryGrowth().isPositive ? "+" : "-"}
                    {getCategoryGrowth().value.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            <OverviewChart data={categories} title="Category Metrics" />
          </CardContent>
        </Card>

        <Card className="@container/chart col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base @[500px]/chart:text-lg @[600px]/chart:text-xl">
              <Tag className="size-5 @[500px]/chart:size-6 text-muted-foreground" />
              Tag Metrics
            </CardTitle>
            <CardDescription className="text-xs @[500px]/chart:text-sm text-muted-foreground">
              Tag usage patterns and content discovery metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 @[500px]/chart:px-6">
            {tags.length > 0 && (
              <div className="mb-4 p-2 bg-muted/30 rounded-md border">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Current Total:</span>
                  <span className="font-semibold">
                    {tags[tags.length - 1]?.total || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Monthly Change:</span>
                  <span
                    className={
                      getTagGrowth().isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }
                  >
                    {getTagGrowth().isPositive ? "+" : "-"}
                    {getTagGrowth().value.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
            <OverviewChart data={tags} title="Tag Metrics" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
