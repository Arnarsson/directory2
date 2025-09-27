import { Suspense } from "react"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { DirectoryCardMasonryGrid } from "@/components/directory-card-grid"
import { getUserBookmarks } from "@/app/actions/bookmark"
import { getAuthUserClaims } from "@/app/actions/user"

export const metadata = {
  title: "My Bookmarks",
  description: "View and manage your saved products",
}

export default async function BookmarksPage() {
  const claims = await getAuthUserClaims()

  if (!claims) {
    redirect("/auth/login")
  }

  const bookmarks = await getUserBookmarks()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <p className="text-muted-foreground mt-2">
          Products you've saved for later
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <DirectoryCardMasonryGrid
          filteredData={bookmarks.map((bookmark) => bookmark.products).flat()}
        />
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <CardDescription>
              You haven't bookmarked any products yet. Start exploring and save
              your favorites!
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
