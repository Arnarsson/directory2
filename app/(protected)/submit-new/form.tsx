"use client"

import { useState } from "react"
import Form from "next/form"
import { AlertCircle, CheckCircle2, Loader2, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { useFilePreview } from "@/hooks/use-file-preview"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { DropzoneEmptyState, FileUploader } from "@/components/ui/file-drop"
import { GradientHeading } from "@/components/ui/gradient-heading"
import { Input } from "@/components/ui/input"
import {
  MinimalCard,
  MinimalCardContent,
  MinimalCardDescription,
  MinimalCardFooter,
  MinimalCardImage,
  MinimalCardTitle,
} from "@/components/ui/minimal-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSubmitForm } from "@/app/(protected)/submit-new/use-submit-form"

const categories = [
  { label: "Boilerplate", value: "boilerplate" },
  { label: "Analytics", value: "analytics" },
  { label: "Marketing Tools", value: "marketing-tools" },
  { label: "Developer Tools", value: "developer-tools" },
  { label: "E-commerce", value: "e-commerce" },
  { label: "Productivity", value: "productivity" },
  { label: "Design Tools", value: "design-tools" },
  { label: "Fintech", value: "fintech" },
  { label: "Education", value: "education" },
  { label: "SaaS", value: "saas" },
]

export const SubmitTool = ({ userId }: { userId: string }) => {
  const isMobile = useIsMobile()

  const { state, pending, loadingStep, formAction } = useSubmitForm(userId)

  // Local form state for preview and validation
  const [formData, setFormData] = useState({
    codename: "",
    punchline: "",
    description: "",
    productWebsite: "",
    categories: "",
    images: undefined as File | undefined,
  })

  // Helper functions
  const isFileTooLarge = (): boolean => {
    return Boolean(formData.images && formData.images.size > 8 * 1024 * 1024)
  }

  const isLogoMissing = (): boolean => {
    return !formData.images
  }

  const isFormValid = (): boolean => {
    return Boolean(
      formData.codename &&
        formData.punchline &&
        formData.description &&
        formData.productWebsite &&
        formData.categories &&
        formData.images &&
        !isFileTooLarge()
    )
  }

  // Update form data when inputs change
  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      {/* Error Display */}
      {state?.issues && state.issues.length > 0 && (
        <div className="mb-6">
          <ErrorDisplay issues={state.issues} />
        </div>
      )}

      <div
        className={cn(
          "grid gap-8",
          isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
        )}
      >
        {/* Form Section */}
        <div
          className={cn(
            "space-y-3",
            pending && !isMobile ? "lg:col-span-3" : "lg:col-span-2"
          )}
        >
          {!pending && (
            <GradientHeading size="xs">
              Tell us about your product
            </GradientHeading>
          )}

          <Form action={formAction} className="space-y-6 relative">
            {/* Loading overlay */}
            {pending && (
              <div className="absolute inset-0 h-full w-full bg-background  z-10 ">
                <LoadingStates currentStep={loadingStep}>
                  <PreviewCard
                    formData={{
                      ...formData,
                      images: formData.images || undefined,
                    }}
                  />
                </LoadingStates>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="codename"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Product name *
                </label>
                <Input
                  id="codename"
                  name="codename"
                  placeholder="What's your product called?"
                  disabled={pending}
                  className={pending ? "opacity-50 cursor-not-allowed" : ""}
                  required
                  value={formData.codename}
                  onChange={(e) => updateFormData("codename", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="punchline"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Product punchline *
                </label>
                <Input
                  id="punchline"
                  name="punchline"
                  placeholder="Describe your product in one sentence"
                  disabled={pending}
                  className={pending ? "opacity-50 cursor-not-allowed" : ""}
                  required
                  value={formData.punchline}
                  onChange={(e) => updateFormData("punchline", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Keep it under 30 characters for the best display
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description *
                </label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Tell us more about what your product does"
                  disabled={pending}
                  className={pending ? "opacity-50 cursor-not-allowed" : ""}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Aim for around 70 words to give users a clear understanding
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="productWebsite"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Product website *
                </label>
                <Input
                  id="productWebsite"
                  name="productWebsite"
                  type="url"
                  placeholder="https://yourproduct.com"
                  disabled={pending}
                  className={pending ? "opacity-50 cursor-not-allowed" : ""}
                  required
                  value={formData.productWebsite}
                  onChange={(e) =>
                    updateFormData("productWebsite", e.target.value)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Where can users learn more about your product?
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="categories"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Product category *
                </label>
                <Select
                  onValueChange={(value) => {
                    updateFormData("categories", value)
                  }}
                  value={formData.categories}
                  disabled={pending}
                >
                  <SelectTrigger
                    className={pending ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.label}
                        value={(category.value ?? "").toLowerCase()}
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the category that best fits your product
                </p>
                {/* Hidden input to submit the category value */}
                <input
                  type="hidden"
                  name="categories"
                  value={formData.categories}
                />
              </div>

              <div className="space-y-2 w-full">
                <label
                  htmlFor="images"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Product logo *
                </label>
                <FileUploader
                  value={formData.images || undefined}
                  onValueChange={(value) => {
                    updateFormData("images", value)
                  }}
                  disabled={pending}
                />
                {/* Hidden file input for Next.js Form submission */}
                <input
                  type="file"
                  name="images"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  ref={(input) => {
                    if (input) {
                      // Sync the FileUploader value with the hidden input
                      const dataTransfer = new DataTransfer()
                      if (formData.images) {
                        dataTransfer.items.add(formData.images)
                      }
                      input.files = dataTransfer.files
                    }
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    updateFormData("images", file)
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Upload your product logo (.jpg or .png format, recommended
                  128x128, max 8MB)
                </p>

                {/* Logo validation feedback */}
                {formData.images && !isFileTooLarge() && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Logo uploaded successfully
                  </div>
                )}

                {formData.images && isFileTooLarge() && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    File size exceeds 8MB limit
                  </div>
                )}

                {!formData.images && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="h-4 w-4" />
                    Logo is required to submit
                  </div>
                )}
              </div>
            </div>

            <Button
              disabled={pending || !isFormValid()}
              type="submit"
              className={cn(
                "w-full transition-all duration-200",
                pending &&
                  "bg-blue-600 dark:bg-blue-500 shadow-lg scale-[0.98]",
                !isFormValid() && "opacity-50 cursor-not-allowed"
              )}
            >
              {pending ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="animate-pulse">Submitting...</span>
                </div>
              ) : (
                "Submit Product"
              )}
            </Button>

            {/* Form validation summary */}
            {!isFormValid() && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Please complete the following:
                    </h3>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      {isLogoMissing() && (
                        <li className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>Upload a product logo</span>
                        </li>
                      )}
                      {isFileTooLarge() && (
                        <li className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>Logo file size must be under 8MB</span>
                        </li>
                      )}
                      {!isFormValid() && (
                        <li className="flex gap-2">
                          <span className="text-amber-500">•</span>
                          <span>Fill in all required fields</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </div>

        {/* Preview Section - Only show on desktop/tablet */}
        {!isMobile && !pending && (
          <div className="lg:col-span-1">
            <PreviewCard
              formData={{ ...formData, images: formData.images || undefined }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Preview Card Component
const PreviewCard = ({
  formData,
}: {
  formData: {
    codename: string
    punchline: string
    description: string
    productWebsite: string
    categories: string
    images: File | undefined
    logo_src?: string
  }
}) => {
  const { codename, description, images, categories } = formData
  const previewImageUrl = useFilePreview(images)

  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Preview
      </h3>
      <MinimalCard className="w-full relative">
        {previewImageUrl ? (
          <MinimalCardImage alt={codename || "Product"} src={previewImageUrl} />
        ) : (
          <div className="h-[190px] w-full rounded-[20px] mb-6 bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/20 dark:to-amber-950/20 border-2 border-dashed border-red-200 dark:border-red-700 flex flex-col items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <Tag className="h-6 w-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Logo Required
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Upload a logo to see preview
                </p>
              </div>
            </div>
          </div>
        )}

        <MinimalCardTitle className="font-semibold mb-0.5">
          {codename || "Product Name"}
        </MinimalCardTitle>

        <MinimalCardDescription className="text-sm">
          {description || "Product description will appear here..."}
        </MinimalCardDescription>

        <MinimalCardContent />

        <MinimalCardFooter>
          {categories && (
            <div className="p-1 py-1.5 px-1.5 rounded-md text-neutral-500 flex items-center gap-1 absolute bottom-2 right-2 rounded-br-[16px]">
              <Tag className="h-4 w-4 ml-[1px]" />
              <p className="flex items-center gap-1 tracking-tight text-neutral pr-1 text-xs">
                {categories}
              </p>
            </div>
          )}
        </MinimalCardFooter>
      </MinimalCard>
    </div>
  )
}

// Loading States Component
const LoadingStates = ({
  currentStep,
  children,
}: {
  currentStep: number
  children: React.ReactNode
}) => {
  const steps = [
    { label: "Validating form" },
    { label: "Uploading logo" },
    { label: "Processing data" },
    { label: "AI enrichment" },
    { label: "Finalizing submission" },
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center shadow-inner">
          <Loader2 className="h-10 w-10 text-gray-600 dark:text-gray-400 animate-spin" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Submitting your product for review
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
          This will take a few moments...
        </p>
      </div>

      <div className="flex items-start justify-center gap-8">
        <div className="mt-2 max-w-sm ">{children}</div>

        <div className="space-y-2.5 min-w-[280px]">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ease-out",
                index < currentStep
                  ? "bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-800/30"
                  : index === currentStep
                  ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 shadow-sm"
                  : "bg-gray-50/50 dark:bg-gray-900/20 border border-gray-200/30 dark:border-gray-800/20"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-500 ease-out shadow-sm",
                  index < currentStep
                    ? "bg-green-500 text-white shadow-green-200 dark:shadow-green-900/30"
                    : index === currentStep
                    ? "bg-blue-500 text-white shadow-blue-200 dark:shadow-blue-900/30 animate-pulse"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium transition-all duration-300 block",
                    index < currentStep
                      ? "text-green-700 dark:text-green-300"
                      : index === currentStep
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.label}
                </span>

                {index === currentStep && (
                  <div className="flex items-center space-x-1 mt-1.5">
                    <div className="w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"></div>
                    <div
                      className="w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-400 dark:bg-blue-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                )}
              </div>

              {index < currentStep && (
                <div className="text-green-500 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Error Display Component
const ErrorDisplay = ({ issues }: { issues: string[] }) => {
  const hasFileSizeError = issues.some(
    (issue) =>
      issue.toLowerCase().includes("file size") ||
      issue.toLowerCase().includes("8mb") ||
      issue.toLowerCase().includes("logo") ||
      issue.toLowerCase().includes("image")
  )

  const hasValidationError = issues.some(
    (issue) =>
      !issue.toLowerCase().includes("file size") &&
      !issue.toLowerCase().includes("8mb") &&
      !issue.toLowerCase().includes("logo") &&
      !issue.toLowerCase().includes("image")
  )

  return (
    <div className="space-y-4">
      {hasValidationError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Please fix the following issues:
              </h3>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {issues
                  .filter(
                    (issue) =>
                      !issue.toLowerCase().includes("file size") &&
                      !issue.toLowerCase().includes("8mb") &&
                      !issue.toLowerCase().includes("logo") &&
                      !issue.toLowerCase().includes("image")
                  )
                  .map((issue, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-red-500">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {hasFileSizeError && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Logo upload issue
              </h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {issues
                  .filter(
                    (issue) =>
                      issue.toLowerCase().includes("file size") ||
                      issue.toLowerCase().includes("8mb") ||
                      issue.toLowerCase().includes("logo") ||
                      issue.toLowerCase().includes("image")
                  )
                  .map((issue, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
              </ul>
              <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/30 rounded border border-amber-200 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Tip:</strong> Try compressing your image using online
                  tools like{" "}
                  <a
                    href="https://tinypng.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    TinyPNG
                  </a>
                  ,{" "}
                  <a
                    href="https://squoosh.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    Squoosh
                  </a>
                  , or{" "}
                  <a
                    href="https://imageoptim.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-800 dark:hover:text-amber-200"
                  >
                    ImageOptim
                  </a>{" "}
                  to reduce file size while maintaining quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubmitTool
