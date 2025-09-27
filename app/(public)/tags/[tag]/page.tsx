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

// Generate static params for all tags at build time
export async function generateStaticParams() {
  try {
    const filters = await getCachedFilters()

    return filters.tags
      .filter((t): t is string => t !== null)
      .map((tag) => ({
        tag: tag,
      }))
  } catch (error) {
    console.warn("Failed to generate static params:", error)
    return []
  }
}

// Generate metadata for the tag page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const config = getSEOConfig()

  const displayTag = fromSnakeCase(tag)
  const title = `${displayTag} Tools & Products`
  const description = `Discover the best ${displayTag} tools and products. Curated collection of ${displayTag} resources for developers and designers.`

  const tagUrl = `${config.site.url}/tags/${encodeURIComponent(tag)}`

  return {
    title,
    description,
    keywords: [tag, "tools", "products", "resources", "developer tools"],
    openGraph: {
      title,
      description,
      type: "website",
      images: [config.site.ogImage],
      url: tagUrl,
    },
    twitter: {
      card: config.social.twitter.cardType,
      title,
      description,
      images: [config.site.ogImage],
    },
    alternates: {
      canonical: tagUrl,
    },
  }
}

const TagPage = async ({ params }: { params: Promise<{ tag: string }> }) => {
  const { tag } = await params

  // Get products filtered by tag
  const rawData = await getCachedProducts(undefined, undefined, undefined, tag)
  const products = rawData.map(transformProductRowWithDefaults)

  if (products.length === 0) {
    notFound()
  }

  // Get all filters for navigation
  const filters = await getCachedFilters()

  // Calculate tag statistics
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

  return (
    <>
      <StructuredData
        type="website"
        data={{
          title: `${tag} Tools & Products`,
          description: `Browse our collection of ${tag} tools and products`,
          url: `${getSEOConfig().site.url}/tags/${encodeURIComponent(tag)}`,
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
            name: tag,
            url: `/tags/${encodeURIComponent(tag)}`,
          },
        ]}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Tag Header */}
        <div className="text-center mb-12">
          <GradientHeading size="xl">{fromSnakeCase(tag)}</GradientHeading>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Tag Statistics */}
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
          <div className="mb-8">
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

        {/* Related Tags */}
        {filters.tags.filter((t): t is string => t !== null && t !== tag)
          .length > 0 && (
          <div className="mt-16">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Related Tags
            </h2>
            <div className="flex flex-wrap justify-start gap-3">
              {filters.tags
                .filter((t): t is string => t !== null && t !== tag)
                .slice(0, 8)
                .map((otherTag) => (
                  <Badge variant="outline" key={otherTag}>
                    <Link href={`/tags/${encodeURIComponent(otherTag)}`}>
                      {fromSnakeCase(otherTag)}
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

export default TagPage
