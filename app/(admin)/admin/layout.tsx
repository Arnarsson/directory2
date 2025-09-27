import { ReactElement } from "react"
import { redirect } from "next/navigation"

import { getAuthStatus } from "@/app/actions/user"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<ReactElement> {
  const { isAdmin: isUserAdmin } = await getAuthStatus()

  if (!isUserAdmin) {
    redirect("/")
  }

  return <div className="flex-1">{children}</div>
}
