import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getSEOConfig } from "@/lib/seo-config"
import { fromSnakeCase } from "@/lib/tag-label-utils"
import { transformProductRowWithDefaults } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { DirectoryCardCarousel } from "@/components/directory-card-carousel"
import { DirectoryCardMasonryGrid } from "@/components/directory-card-grid"
import { StructuredData } from "@/components/seo/structured-data"
import {
  getCachedFilters,
  getCachedProducts,
} from "@/app/actions/cached_actions"

export const revalidate = 1800 // 30 minutes

// Generate static params for all categories at build time
export async function generateStaticParams() {
  try {
    const filters = await getCachedFilters()

    return filters.categories
      .filter((c): c is string => c !== null)
      .map((category) => ({
        category: category,
      }))
  } catch (error) {
    console.warn("Failed to generate static params:", error)
    return []
  }
}

// Generate metadata for the category page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const config = getSEOConfig()

  const displayCategory = fromSnakeCase(category)
  const title = `${displayCategory} Tools & Products`
  const description = `Discover the best ${displayCategory} tools and products. Curated collection of ${displayCategory} resources for developers and designers.`

  const categoryUrl = `${config.site.url}/categories/${encodeURIComponent(
    category
  )}`

  return {
    title,
    description,
    keywords: [category, "tools", "products", "resources", "developer tools"],
    openGraph: {
      title,
      description,
      type: "website",
      images: [config.site.ogImage],
      url: categoryUrl,
    },
    twitter: {
      card: config.social.twitter.cardType,
      title,
      description,
      images: [config.site.ogImage],
    },
    alternates: {
      canonical: categoryUrl,
    },
  }
}

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ category: string }>
}) => {
  const { category } = await params

  // Get products filtered by category
  const rawData = await getCachedProducts(undefined, category)
  const products = rawData.map(transformProductRowWithDefaults)

  if (products.length === 0) {
    notFound()
  }

  // Get all filters for navigation
  const filters = await getCachedFilters()

  // Calculate category statistics
  const totalViews = products.reduce(
    (sum, product) => sum + (product.view_count || 0),
    0
  )
  const featuredProducts = products
    .filter((product) => product.featured)
    .slice(0, 6)
  const recentProducts = products
    .sort(
      (a, b) =>
        new Date(b.created_at || new Date().toISOString()).getTime() -
        new Date(a.created_at || new Date().toISOString()).getTime()
    )
    .slice(0, 7)

  const displayCategory = fromSnakeCase(category)

  return (
    <>
      <StructuredData
        type="website"
        data={{
          title: `${category} Tools & Products`,
          description: `Browse our collection of ${category} tools and products`,
          url: `${getSEOConfig().site.url}/categories/${encodeURIComponent(
            category
          )}`,
          itemCount: products.length,
          items: products.slice(0, 10),
        }}
      />

      {/* Breadcrumb Schema */}
      <StructuredData
        type="breadcrumb"
        data={[
          { name: "Home", url: "/" },
          { name: "Products", url: "/products" },
          {
            name: displayCategory,
            url: `/categories/${encodeURIComponent(category)}`,
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <GradientHeading size="xl">{displayCategory}</GradientHeading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Category Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 text-center ">
            <h3 className="text-2xl font-bold text-foreground">
              {products.length}
            </h3>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center ">
            <h3 className="text-2xl font-bold text-foreground">
              {featuredProducts.length}
            </h3>
            <p className="text-sm text-muted-foreground">Featured</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center ">
            <h3 className="text-2xl font-bold text-foreground">
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Views</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center ">
            <h3 className="text-2xl font-bold text-foreground">
              {
                new Set(
                  products
                    .filter((p) => p.twitter_handle)
                    .map((p) => p.twitter_handle)
                ).size
              }
            </h3>
            <p className="text-sm text-muted-foreground">Creators</p>
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 6 && (
          <div className="mb-8 ">
            <DirectoryCardCarousel
              cardData={featuredProducts}
              category={"Featured"}
              className="mt-6"
            />
          </div>
        )}

        {/* Recent Additions */}
        {recentProducts.length > 6 && (
          <div className="mb-8">
            <DirectoryCardCarousel
              cardData={recentProducts}
              category={"Recently Added"}
              className="mt-6"
            />
          </div>
        )}

        {/* All Products Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            All Products
          </h2>
          <DirectoryCardMasonryGrid filteredData={products} />
        </div>

        {/* Related Categories */}
        {filters.categories.filter(
          (c): c is string => c !== null && c !== category
        ).length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-semibold text-foreground mb-6 ">
              Other Categories
            </h2>
            <div className="flex flex-wrap justify-start gap-3">
              {filters.categories
                .filter((c): c is string => c !== null && c !== category)
                .slice(0, 8)
                .map((otherCategory) => (
                  <Badge variant="outline" key={otherCategory}>
                    <Link
                      href={`/categories/${encodeURIComponent(otherCategory)}`}
                    >
                      {fromSnakeCase(otherCategory)}
                    </Link>
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CategoryPage
