export interface SEOConfig {
  // Basic Site Information
  site: {
    name: string
    shortName: string
    description: string
    url: string
    logo: string
    favicon: string
    ogImage: string
    themeColor: string
    backgroundColor: string
  }

  // Company/Organization
  organization: {
    name: string
    description: string
    url: string
    logo: string
    sameAs: string[]
  }

  // Social Media
  social: {
    twitter: {
      handle: string
      site: string
      cardType: "summary" | "summary_large_image"
    }
    facebook: {
      appId: string
    }
    linkedin: {
      company: string
    }
  }

  // SEO Settings
  seo: {
    defaultTitle: string
    titleTemplate: string
    defaultDescription: string
    keywords: string[]
    language: string
    locale: string
    robots: {
      index: boolean
      follow: boolean
      googleBot: {
        index: boolean
        follow: boolean
        maxVideoPreview: number
        maxImagePreview: "none" | "standard" | "large"
        maxSnippet: number
      }
    }
    verification: {
      google: string
      yandex: string
      yahoo: string
      bing: string
    }
  }

  // Content Types
  contentTypes: {
    product: {
      titleTemplate: string
      descriptionTemplate: string
      keywords: string[]
    }
    category: {
      titleTemplate: string
      descriptionTemplate: string
      keywords: string[]
    }
    tag: {
      titleTemplate: string
      descriptionTemplate: string
      keywords: string[]
    }
    label: {
      titleTemplate: string
      descriptionTemplate: string
      keywords: string[]
    }
  }

  // Sitemap Configuration
  sitemap: {
    changefreq: {
      home:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
      products:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
      categories:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
      tags:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
      labels:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
      static:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never"
    }
    priority: {
      home: number
      products: number
      categories: number
      tags: number
      labels: number
      static: number
    }
  }

  // Analytics
  analytics: {
    googleAnalytics: string
    googleTagManager: string
    facebookPixel: string
    linkedinInsight: string
  }
}

// Update this to your own SEO config
export const defaultSEOConfig: SEOConfig = {
  site: {
    name: "Nextjs Design",
    shortName: "Nextjs Dev Tools Directory",
    description: "A directory of Nextjs Dev Tools tools and resources",
    url: "https://your-site.com",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    ogImage: "/og-image.png",
    themeColor: "#000000",
    backgroundColor: "#ffffff",
  },

  organization: {
    name: "Your Company",
    description: "A studio for building Nextjs Dev Tools tools and resources",
    url: "https://your-site.com",
    logo: "/company-logo.png",
    sameAs: [
      "https://twitter.com/your-twitter-handle",
      "https://github.com/your-github-handle",
      "https://www.linkedin.com/in/your-linkedin-handle",
    ],
  },

  social: {
    twitter: {
      handle: "@nolansym",
      site: "@nolansym",
      cardType: "summary_large_image",
    },
    facebook: {
      appId: "your-facebook-app-id",
    },
    linkedin: {
      company: "your-linkedin-company-id",
    },
  },

  seo: {
    defaultTitle: "Nextjs Dev Tools Directory",
    titleTemplate: "%s | Nextjs Dev Tools Directory",
    defaultDescription: "A directory of Nextjs Dev Tools tools and resources",
    keywords: ["nextjs", "designer", "tools", "resources", "directory"],
    language: "en",
    locale: "en_US",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxVideoPreview: -1,
        maxImagePreview: "large",
        maxSnippet: -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
      bing: "your-bing-verification-code",
    },
  },

  contentTypes: {
    product: {
      titleTemplate: "%s - %s | Nextjs Dev Tools Directory",
      descriptionTemplate: "%s - %s. %s",
      keywords: ["product", "tool", "resource", "solution"],
    },
    category: {
      titleTemplate: "%s - Nextjs Dev Tools Directory",
      descriptionTemplate:
        "Browse our collection of %s. Find the best resources and tools.",
      keywords: ["category", "collection", "resources", "tools"],
    },
    tag: {
      titleTemplate: "%s - Nextjs Dev Tools Directory",
      descriptionTemplate:
        "Discover %s related resources and tools in our directory.",
      keywords: ["tag", "related", "resources", "tools"],
    },
    label: {
      titleTemplate: "%s - Nextjs Dev Tools Directory",
      descriptionTemplate: "Browse our collection of %s tools and resources.",
      keywords: ["label", "collection", "resources", "tools"],
    },
  },

  sitemap: {
    changefreq: {
      home: "daily",
      products: "weekly",
      categories: "weekly",
      tags: "weekly",
      labels: "weekly",
      static: "monthly",
    },
    priority: {
      home: 1.0,
      products: 0.8,
      categories: 0.6,
      tags: 0.5,
      labels: 0.5,
      static: 0.7,
    },
  },

  analytics: {
    googleAnalytics: "your-ga-id",
    googleTagManager: "your-gtm-id",
    facebookPixel: "your-facebook-pixel-id",
    linkedinInsight: "your-linkedin-insight-id",
  },
}

// Helper function to get SEO config with environment variable overrides
export function getSEOConfig(): SEOConfig {
  // In a real app, you might load this from a database or API
  // For now, we'll use the default config with environment variable overrides

  const config = { ...defaultSEOConfig }

  // Override with environment variables if they exist
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    config.site.url = process.env.NEXT_PUBLIC_SITE_URL
  }

  if (process.env.NEXT_PUBLIC_SITE_NAME) {
    config.site.name = process.env.NEXT_PUBLIC_SITE_NAME
    config.seo.defaultTitle = process.env.NEXT_PUBLIC_SITE_NAME
  }

  if (process.env.NEXT_PUBLIC_SITE_DESCRIPTION) {
    config.site.description = process.env.NEXT_PUBLIC_SITE_DESCRIPTION
    config.seo.defaultDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION
  }

  if (process.env.GOOGLE_ANALYTICS_ID) {
    config.analytics.googleAnalytics = process.env.GOOGLE_ANALYTICS_ID
  }

  if (process.env.GOOGLE_TAG_MANAGER_ID) {
    config.analytics.googleTagManager = process.env.GOOGLE_TAG_MANAGER_ID
  }

  if (process.env.FACEBOOK_APP_ID) {
    config.social.facebook.appId = process.env.FACEBOOK_APP_ID
  }

  if (process.env.TWITTER_HANDLE) {
    config.social.twitter.handle = process.env.TWITTER_HANDLE
    config.social.twitter.site = process.env.TWITTER_HANDLE
  }

  return config
}

// Helper function to generate title from template
export function generateTitle(template: string, ...values: string[]): string {
  return values.reduce((title, value, index) => {
    return title.replace(`%s`, value)
  }, template)
}

// Helper function to generate description from template
export function generateDescription(
  template: string,
  ...values: string[]
): string {
  return values.reduce((desc, value, index) => {
    return desc.replace(`%s`, value)
  }, template)
}

// Helper function to get structured data for different content types
export function getStructuredData(type: string, data: any): any {
  const config = getSEOConfig()

  switch (type) {
    case "WebSite":
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: config.site.name,
        description: config.site.description,
        url: config.site.url,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${config.site.url}/?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }

    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: config.organization.name,
        description: config.organization.description,
        url: config.organization.url,
        logo: `${config.site.url}${config.organization.logo}`,
        sameAs: config.organization.sameAs,
      }

    case "Product":
      // Generate mock rating data for demonstration
      // In production, this would come from actual user reviews
      const mockRating = Math.floor(Math.random() * 2) + 4 // 4-5 rating
      const mockReviewCount = Math.floor(Math.random() * 100) + 20 // 20-120 reviews

      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.codename || data.name,
        description: data.description,
        url: `${config.site.url}/products/${data.id}`,
        image: data.logo_src || data.image,
        category: data.categories || data.category,
        brand: {
          "@type": "Organization",
          name: data.full_name || data.brand || config.organization.name,
        },
        offers: {
          "@type": "Offer",
          price: data.price || "0",
          priceCurrency: data.priceCurrency || "USD",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: mockRating.toString(),
          reviewCount: mockReviewCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
        review: [
          {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: "Verified User",
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
              worstRating: "1",
            },
            reviewBody: `Great tool! ${
              data.codename
            } has significantly improved my workflow and productivity. Highly recommended for anyone looking for quality ${
              data.categories || "development"
            } tools.`,
          },
          {
            "@type": "Review",
            author: {
              "@type": "Person",
              name: "Developer",
            },
            reviewRating: {
              "@type": "Rating",
              ratingValue: "4",
              bestRating: "5",
              worstRating: "1",
            },
            reviewBody: `Solid product with excellent features. ${data.codename} delivers on its promises and provides great value for the price.`,
          },
        ],
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "view_count",
            value: data.view_count || 0,
          },
          {
            "@type": "PropertyValue",
            name: "featured",
            value: data.featured || false,
          },
          {
            "@type": "PropertyValue",
            name: "approved",
            value: data.approved || false,
          },
        ],
        creator: data.twitter_handle
          ? {
              "@type": "Person",
              name: data.full_name || "Creator",
              url: `https://twitter.com/${data.twitter_handle}`,
            }
          : undefined,
      }

    case "FAQPage":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.questions || [],
      }

    default:
      return {}
  }
}
