import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function LabelNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Label Not Found
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
        The label you're looking for doesn't exist or may have been removed.
        Check out our available labels or browse all products instead.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/products">Browse All Products</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
