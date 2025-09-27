"use client"

import { EmptyState } from "@/components/tutorial/empty-state"

export default function ErrorPage() {
  const isDev = process.env.NODE_ENV === "development"

  if (isDev) {
    return (
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <EmptyState isDev={isDev} />
      </div>
    )
  }

  return <div>Error</div>
}
