import "./globals.css"

import { ReactNode, Suspense } from "react"
import { Geist_Mono, Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import { getSEOConfig } from "@/lib/seo-config"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/components/auth-provider"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { ThemeProvider } from "@/components/theme-provider"

import { getCachedFilters } from "./actions/cached_actions"

// Remove force-dynamic since we're no longer calling server functions
// export const dynamic = "force-dynamic"

const interSans = Inter_Tight({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  metadataBase: new URL(getSEOConfig().site.url),
  title: getSEOConfig().seo.defaultTitle,
  description: getSEOConfig().seo.defaultDescription,
  keywords: getSEOConfig().seo.keywords,
  authors: [{ name: getSEOConfig().organization.name }],
  creator: getSEOConfig().organization.name,
  publisher: getSEOConfig().organization.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: getSEOConfig().seo.locale,
    url: getSEOConfig().site.url,
    title: getSEOConfig().seo.defaultTitle,
    description: getSEOConfig().seo.defaultDescription,
    siteName: getSEOConfig().site.name,
    images: [
      {
        url: getSEOConfig().site.ogImage,
        width: 1200,
        height: 630,
        alt: getSEOConfig().seo.defaultTitle,
      },
    ],
  },
  twitter: {
    card: getSEOConfig().social.twitter.cardType,
    title: getSEOConfig().seo.defaultTitle,
    description: getSEOConfig().seo.defaultDescription,
    images: [getSEOConfig().site.ogImage],
    creator: getSEOConfig().social.twitter.handle,
    site: getSEOConfig().social.twitter.site,
  },
  robots: getSEOConfig().seo.robots,
  verification: getSEOConfig().seo.verification,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${geistMono.variable} font-sans`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SidebarProvider>
              <AppSidebar filtersAction={getCachedFilters()} />
              <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                  <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                      orientation="vertical"
                      className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Suspense
                      fallback={
                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      }
                    >
                      <DynamicBreadcrumbs />
                    </Suspense>
                  </div>
                </header>
                <div className="flex flex-1 flex-col ">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 pb-4 md:gap-6 md:py-6 px-3 lg:px-8">
                      {children}

                      <div className="bg-muted/30 hidden lg:block flex-1 rounded-xl md:min-h-min " />
                    </div>
                  </div>
                </div>
              </SidebarInset>
              <TooltipProvider>
                <Toaster richColors />
              </TooltipProvider>
            </SidebarProvider>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
