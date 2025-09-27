import { redirect } from "next/navigation"
import { createClient } from "@/db/supabase/server"

import SubmitTool from "./form"

export default async function SubmitPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect("/auth/login")
  }

  return (
    <>
      <div className="max-w-full px-4 md:px-6 lg:px-8 ">
        <div className="relative w-full max-w-4xl mx-auto">
          <SubmitTool userId={data.claims.sub} />
        </div>
      </div>
    </>
  )
}
