"use client"

import React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Blocks,
  BoxIcon,
  Clock,
  Edit2Icon,
  ExternalLink,
  Globe,
  Hash,
  HeartIcon,
  MessageSquareTextIcon,
  NotepadText,
  Shield,
  Sparkles,
  Star,
  Tag,
  TagIcon,
  Users,
  Zap,
} from "lucide-react"

import type { ProductStrict } from "@/lib/types"
import { ProductBreadcrumbs } from "@/components/ui/breadcrumb-client"
import { Button } from "@/components/ui/button"
import { GitHubIcon, XformerlyTwitterIcon } from "@/components/ui/icons"

export const ProductDetails = ({ product }: { product: ProductStrict }) => (
  <div className="@container/product space-y-8 @[600px]/product:space-y-10 @[800px]/product:space-y-12 max-w-3xl mx-auto">
    {/* Header Section with Breadcrumbs and Navigation */}
    <div className="mb-6 absolute top-5.5 lg:top-5 left-16">
      <ProductBreadcrumbs product={product} />
    </div>

    {/* Main Product Heading - H1 */}
    <div className="text-center space-y-6 pt-6 mb-12">
      <h1 className="text-3xl @[600px]/product:text-4xl @[800px]/product:text-5xl @[1000px]/product:text-6xl @[1200px]/product:text-7xl font-bold tracking-tight text-foreground">
        {product.codename}
      </h1>
      <p className="text-lg @[600px]/product:text-xl @[800px]/product:text-2xl @[1000px]/product:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
        {product.punchline}
      </p>
    </div>

    {/* Hero Section with Image */}
    <div className="bg-card rounded-xl @[600px]/product:rounded-2xl overflow-hidden shadow-elevation-light dark:shadow-elevation-dark mb-6">
      <div className="aspect-[4/3] @[600px]/product:aspect-[16/10] @[800px]/product:aspect-[16/9] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={product.logo_src}
          alt={`${product.codename} - ${product.punchline}`}
        />
      </div>
    </div>

    {/* Back Navigation and Visit Site Button */}
    <div className="flex items-center justify-between mb-9">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to products</span>
      </Link>

      {product.product_website && (
        <Button asChild size="sm" variant="outline">
          <a
            href={product.product_website}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2"
          >
            <span>Visit Site</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 @[800px]/product:grid-cols-12 gap-8 @[800px]/product:gap-12">
      {/* Main Content - 8 columns */}
      <div className="@[800px]/product:col-span-8 space-y-8 @[800px]/product:space-y-10">
        {/* About Section */}
        <div className="bg-muted/30 rounded-xl p-6 @[600px]/product:p-8">
          <h2 className="text-xl @[600px]/product:text-2xl font-semibold text-foreground mb-6">
            About {product.codename}
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-base @[600px]/product:text-lg">
            <p>{product.description}</p>
            <p>{product.codename}</p>
          </div>
        </div>
      </div>

      {/* Sidebar - 4 columns */}
      <div className="@[800px]/product:col-span-4 space-y-6">
        {/* Status Card */}
        <div className="bg-muted/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium text-foreground">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Views</span>
              <span className="text-sm font-medium text-foreground">
                {product.view_count}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Added</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(product.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        {product.twitter_handle && (
          <div className="bg-muted/30 rounded-xl p-6 ">
            <h3 className="font-semibold text-foreground mb-4">Creator</h3>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="w-12 h-12 bg-black border-white rounded-full flex items-center justify-center">
                <XformerlyTwitterIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <a
                  href={`https://twitter.com/${product.twitter_handle}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-primary hover:underline font-medium text-base"
                >
                  {product.twitter_handle}
                </a>
                <p className="text-sm text-muted-foreground">Twitter</p>
              </div>
            </div>
          </div>
        )}

        {/* Labels */}
        <div className="space-y-6 flex flex-wrap gap-6 w-full">
          {product.labels && product.labels.length > 0 && (
            <div className="w-full bg-muted/30 p-6">
              <h3 className="font-semibold text-foreground mb-1">Labels</h3>
              <div className="space-y-1">
                {product.labels.map((label, index) => (
                  <Link
                    href={`/labels/${encodeURIComponent(label)}`}
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <NotepadText className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {product.tags && product.tags.length > 0 && (
            <div className="w-full bg-muted/30 p-6">
              <h3 className="font-semibold text-foreground mb-1">Tags</h3>
              <div className="space-y-1">
                {product.tags.map((tag, index) => (
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <TagIcon className="h-4 w-4" />
                    <span>{tag}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {product.categories && product.categories.length > 0 && (
            <div className="w-full bg-muted/30 p-6">
              <h3 className="font-semibold text-foreground mb-1">Categories</h3>
              <div className="space-y-1">
                {product.categories.split(",").map((category, index) => (
                  <Link
                    href={`/categories/${encodeURIComponent(category)}`}
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                  >
                    <BoxIcon className="h-4 w-4" />
                    <span>{category}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Related Products Section */}
        <div className="bg-muted/30 rounded-xl p-6 @[600px]/product:p-8">
          <h2 className="text-xl @[600px]/product:text-2xl font-semibold text-foreground mb-6">
            Related Products
          </h2>
          <div className="space-y-6 text-muted-foreground text-base @[600px]/product:text-lg">
            <p>
              Discover more amazing tools and products in our comprehensive
              directory that complement {product.codename}. Our curated
              collection features the latest innovations in development tools,
              design resources, and productivity solutions that can enhance your
              workflow and boost your productivity.
            </p>
            <p>
              Whether you're looking for alternative solutions, complementary
              tools, or simply want to explore what's new in the industry, our
              directory provides access to a diverse range of high-quality
              products. Each tool has been carefully selected and reviewed to
              ensure it meets our standards for quality, functionality, and user
              experience.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" size="lg">
                <Link href="/products">Browse All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)
