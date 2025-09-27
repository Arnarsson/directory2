import { notFound } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { DirectoryCardMasonryGrid } from "@/components/directory-card-grid"
import { UserProfileHeader } from "@/components/user-profile-header"
import {
  getUserProducts,
  getUserProfile,
  getUserStats,
} from "@/app/actions/user"

interface UserProfilePageProps {
  params: {
    userId: string
  }
}

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { userId } = await params

  const [user, products, stats] = await Promise.all([
    getUserProfile(userId),
    getUserProducts(userId),
    getUserStats(userId),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
          {/* Profile Header Section - Centered */}
          <div className="flex ">
            <div className="w-full max-w-2xl">
              <UserProfileHeader user={user} stats={stats} />
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="">
              <h2 className="text-xl font-bold text-foreground">Submissions</h2>
              <p className="text-muted-foreground mt-2 text-lg">
                {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                submitted
              </p>
            </div>

            {products.length > 0 ? (
              <div className="">
                <DirectoryCardMasonryGrid filteredData={products} />
              </div>
            ) : (
              <Card className="border-dashed max-w-2xl mx-auto">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold mb-2">
                    No Products Yet
                  </CardTitle>
                  <CardDescription className="text-muted-foreground max-w-sm mx-auto">
                    This user hasn't submitted any products yet. Check back
                    later to see what they create!
                  </CardDescription>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { userId } = await params
  const user = await getUserProfile(userId)

  if (!user) {
    return {
      title: "User Not Found",
    }
  }

  return {
    title: `${user.full_name || "User"} Profile`,
    description:
      user.bio ||
      `View ${
        user.full_name || "this user"
      }'s submitted products and profile information.`,
  }
}
