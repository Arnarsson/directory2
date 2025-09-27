import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"

import { EnhancedSignUpForm } from "@/components/sign-up-form"

// Force dynamic rendering to prevent cookies() errors during build
export const experimental_ppr = true

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims) {
    redirect("/")
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <EnhancedSignUpForm />
      </div>
    </div>
  )
}
