import Link from "next/link"
import { ArrowLeft, BoxIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function CategoryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <BoxIcon className="h-16 w-16 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">
            Category Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The category you're looking for doesn't exist or has been removed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/products" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Browse All Products
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
