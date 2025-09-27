import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { submitProductFormAction } from "./action"
import { schema } from "./schema"

export function useSubmitForm(userId: string) {
  const router = useRouter()

  const [state, formAction, pending] = useActionState(submitProductFormAction, {
    message: "",
    issues: [],
  })

  const [loadingStep, setLoadingStep] = useState(1)

  const form = useForm<z.output<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      productWebsite: "",
      codename: "",
      punchline: "",
      description: "",
      images: undefined as any,
      logo_src: "",
      categories: "",
    },
  })

  // Helper functions
  const isFileTooLarge = (): boolean => {
    const images = form.getValues("images")
    return Boolean(images && images.size > 8 * 1024 * 1024)
  }

  const isLogoMissing = (): boolean => {
    const images = form.getValues("images")
    return !images
  }

  const isFormValid = (): boolean => {
    const isValid = form.formState.isValid
    const hasLogo = !isLogoMissing()
    const logoSizeOk = !isFileTooLarge()
    return isValid && hasLogo && logoSizeOk
  }

  // Loading step animation
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (pending) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 5 ? prev + 1 : prev))
      }, 2200)
    } else {
      setLoadingStep(1)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [pending])

  // Handle state changes and side effects
  useEffect(() => {
    // Handle success/error toasts and redirects
    if (state.message && state.issues.length < 1) {
      toast.success(state.message)
      router.push(`/profile/${userId}`)
    } else if (state.issues.length >= 1) {
      toast.error("Please fix the issues below")
    }

    // Update form values when state changes (for form validation errors)
    if (state?.fields && typeof state.fields === "object") {
      Object.entries(state.fields).forEach(([key, value]) => {
        if (key in form.getValues()) {
          form.setValue(key as keyof z.output<typeof schema>, value as any)
        }
      })
    }
  }, [state, router, userId, form])

  const onSubmit = async (data: z.output<typeof schema>) => {
    // Validate logo is present
    if (isLogoMissing()) {
      toast.error("Product logo is required")
      return
    }

    // Validate file size
    if (isFileTooLarge()) {
      toast.error("Logo file size must be under 8MB")
      return
    }

    // Create FormData and submit
    const formData = new FormData()
    formData.append("codename", data.codename)
    formData.append("punchline", data.punchline)
    formData.append("description", data.description)
    formData.append("productWebsite", data.productWebsite)
    formData.append("categories", data.categories)
    if (data.images) {
      formData.append("images", data.images)
    }

    // Call the server action
    formAction(formData)
  }

  return {
    form,
    state,
    pending,
    loadingStep,
    onSubmit,
    isFormValid,
    isFileTooLarge,
    isLogoMissing,
    formAction,
  }
}
