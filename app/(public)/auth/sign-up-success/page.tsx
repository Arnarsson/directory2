import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">
                Welcome to our community!
              </CardTitle>
              <CardDescription>
                Your account has been created successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We&apos;ve sent a confirmation email to your inbox. Please click the
                link in the email to verify your account and complete the signup process.
              </p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">What&apos;s next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check your email and confirm your account</li>
                  <li>• Explore the product directory</li>
                  <li>• Submit your own products</li>
                  <li>• Connect with other makers</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button asChild>
                  <Link href="/auth/login">
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">
                    Explore Directory
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
