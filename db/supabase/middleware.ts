import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { hasEnvVars } from "@/lib/utils"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // Only check env vars in development (for tutorial display)
  if (process.env.NODE_ENV === "development") {
    if (!hasEnvVars) {
      return response
    }
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const { data } = await supabase.auth.getClaims()
    const user = data?.claims

    // Define public routes that don't require authentication
    // const publicRoutes = [
    //   "/",
    //   "/products",
    //   "/submit-new",
    //   "/tags",
    //   "/labels",
    //   "/categories",
    //   "/auth/login",
    //   "/auth/sign-up",
    //   "/auth/forgot-password",
    //   "/auth/update-password",
    // ]

    // const isPublicRoute = publicRoutes.some(
    //   (route) =>
    //     request.nextUrl.pathname === route ||
    //     request.nextUrl.pathname.startsWith(route + "/")
    // )

    // if (!user && !isPublicRoute) {
    //   // no user, redirect to login page
    //   const url = request.nextUrl.clone()
    //   url.pathname = "/auth/login"
    //   return NextResponse.redirect(url)
    // }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, allow the request to proceed but log the issue
    return response
  }
}
