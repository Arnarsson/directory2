"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/db/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  accountBasicsSchema,
  experienceLevels,
  favoriteTools,
  interestsPreferencesSchema,
  primaryInterests,
  profileInfoSchema,
  socialProfessionalSchema,
  type AccountBasics,
  type InterestsPreferences,
  type ProfileInfo,
  type SocialProfessional,
} from "@/lib/sign-up-schema"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/file-drop"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const steps = [
  { id: 1, title: "Account", description: "Basic account information" },
  { id: 2, title: "Profile", description: "Tell us about yourself" },
  { id: 3, title: "Professional", description: "Your work and social" },
  { id: 4, title: "Interests", description: "Your interests and tools" },
]

/**
 * Multi Stage Sign-Up Form 
 *
 
 * Collects comprehensive user profile information including:
 * - Account basics (name, email, password, avatar)
 * - Profile information (bio, location, website)
 * - Professional details (role, company, experience level, social handles)
 * - Interests and tools preferences
 *
 * The form automatically sets profile_completed and onboarding_completed to true
 * when all required fields are filled, aligning with the database schema.
 */
export function EnhancedSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [currentStep, setCurrentStep] = useState(1)
  const [filePreview, setFilePreview] = useState<string | undefined>()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Step 1 form
  const step1Form = useForm<AccountBasics>({
    resolver: zodResolver(accountBasicsSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: [],
    },
  })

  // Step 2 form
  const step2Form = useForm<ProfileInfo>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      bio: "",
      location: "",
      website: "",
    },
  })

  // Step 3 form
  const step3Form = useForm<SocialProfessional>({
    resolver: zodResolver(socialProfessionalSchema),
    defaultValues: {
      twitter_handle: "",
      github_handle: "",
      linkedin_handle: "",
      role: "",
      company: "",
      experience_level: "beginner",
    },
  })

  // Step 4 form
  const step4Form = useForm<InterestsPreferences>({
    resolver: zodResolver(interestsPreferencesSchema),
    defaultValues: {
      primary_interests: [],
      favorite_tools: [],
    },
  })

  // Clean up file preview when avatar changes or component unmounts
  useEffect(() => {
    const avatar = step1Form.watch("avatar")
    if (!avatar || avatar.length === 0) {
      setFilePreview(undefined)
    }

    return () => {
      // Cleanup function to revoke object URL if needed
      if (filePreview && filePreview.startsWith("blob:")) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [step1Form.watch("avatar"), filePreview])

  const getCurrentForm = () => {
    switch (currentStep) {
      case 1:
        return step1Form
      case 2:
        return step2Form
      case 3:
        return step3Form
      case 4:
        return step4Form
      default:
        return step1Form
    }
  }

  const validateCurrentStep = async () => {
    const currentForm = getCurrentForm()

    // For step 2, only validate fields that have content
    if (currentStep === 2) {
      const bioValue = step2Form.getValues("bio")
      const locationValue = step2Form.getValues("location")
      const websiteValue = step2Form.getValues("website")

      // Only validate bio if it has content
      if (bioValue && bioValue.trim().length > 0) {
        const bioValidation = await step2Form.trigger("bio")
        if (!bioValidation) return false
      }

      // Only validate location if it has content
      if (locationValue && locationValue.trim().length > 0) {
        const locationValidation = await step2Form.trigger("location")
        if (!locationValidation) return false
      }

      // Only validate website if it has content
      if (websiteValue && websiteValue.trim().length > 0) {
        const websiteValidation = await step2Form.trigger("website")
        if (!websiteValidation) return false
      }

      return true
    }

    // For step 3, only validate required fields
    if (currentStep === 3) {
      const roleValue = step3Form.getValues("role")
      const experienceLevelValue = step3Form.getValues("experience_level")

      // Validate required fields
      if (!roleValue || roleValue.trim().length < 2) {
        return false
      }

      if (!experienceLevelValue) {
        return false
      }

      // Validate optional fields only if they have content
      const twitterValue = step3Form.getValues("twitter_handle")
      const githubValue = step3Form.getValues("github_handle")
      const linkedinValue = step3Form.getValues("linkedin_handle")
      const companyValue = step3Form.getValues("company")

      if (twitterValue && twitterValue.trim().length > 0) {
        const twitterValidation = await step3Form.trigger("twitter_handle")
        if (!twitterValidation) return false
      }

      if (githubValue && githubValue.trim().length > 0) {
        const githubValidation = await step3Form.trigger("github_handle")
        if (!githubValidation) return false
      }

      if (linkedinValue && linkedinValue.trim().length > 0) {
        const linkedinValidation = await step3Form.trigger("linkedin_handle")
        if (!linkedinValidation) return false
      }

      if (companyValue && companyValue.trim().length > 0) {
        const companyValidation = await step3Form.trigger("company")
        if (!companyValidation) return false
      }

      return true
    }

    // For step 4, validate required fields
    if (currentStep === 4) {
      const primaryInterests = step4Form.getValues("primary_interests")
      const favoriteTools = step4Form.getValues("favorite_tools")

      if (!primaryInterests || primaryInterests.length === 0) {
        return false
      }

      if (!favoriteTools || favoriteTools.length === 0) {
        return false
      }

      return true
    }

    // For step 1, validate all required fields
    return await currentForm.trigger()
  }

  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinalSubmit = async () => {
    // Validate all forms
    const [step1Valid, step2Valid, step3Valid, step4Valid] = await Promise.all([
      step1Form.trigger(),
      step2Form.trigger(),
      step3Form.trigger(),
      step4Form.trigger(),
    ])

    if (!step1Valid || !step2Valid || !step3Valid || !step4Valid) {
      setError("Please fill in all required fields")
      return
    }

    // Additional validation for required profile fields
    const step1Data = step1Form.getValues()
    const step2Data = step2Form.getValues()
    const step3Data = step3Form.getValues()
    const step4Data = step4Form.getValues()

    if (!step1Data.avatar || step1Data.avatar.length === 0) {
      setError("Profile picture is required")
      return
    }

    if (
      !step4Data.primary_interests ||
      step4Data.primary_interests.length === 0
    ) {
      setError("Please select at least one primary interest")
      return
    }

    if (!step4Data.favorite_tools || step4Data.favorite_tools.length === 0) {
      setError("Please select at least one favorite tool")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Upload avatar to Supabase Storage
      let avatarUrl: string | null = null
      if (step1Data.avatar.length > 0) {
        try {
          const avatarFile = step1Data.avatar[0]
          const fileExt = avatarFile.name.split(".").pop()
          const fileName = `${
            step1Data.email.split("@")[0]
          }_${Date.now()}.${fileExt}`
          const filePath = `avatars/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(filePath, avatarFile, {
              cacheControl: "3600",
              upsert: false,
            })

          if (uploadError) {
            console.warn(
              "Avatar upload failed, but user was created:",
              uploadError.message
            )
            // Don't fail the sign-up process if avatar upload fails
          } else {
            const { data: publicUrlData } = supabase.storage
              .from("avatars")
              .getPublicUrl(filePath)
            avatarUrl = publicUrlData.publicUrl
          }
        } catch (uploadError) {
          console.warn(
            "Avatar upload failed, but user was created:",
            uploadError
          )
          // Don't fail the sign-up process if avatar upload fails
        }
      }

      // Sign up user with all data
      const { error: signUpError } = await supabase.auth.signUp({
        email: step1Data.email,
        password: step1Data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: step1Data.full_name.trim(),
            avatar_url: avatarUrl,
            bio: step2Data.bio.trim(),
            location: step2Data.location?.trim() || null,
            website: step2Data.website?.trim() || null,
            twitter_handle: step3Data.twitter_handle?.replace(/^@/, "") || null,
            github_handle: step3Data.github_handle?.trim() || null,
            linkedin_handle: step3Data.linkedin_handle?.trim() || null,
            role: step3Data.role.trim(),
            company: step3Data.company?.trim() || null,
            experience_level: step3Data.experience_level,
            primary_interests: step4Data.primary_interests.join(","),
            favorite_tools: step4Data.favorite_tools.join(","),
            profile_completed: true,
            onboarding_completed: true,
          },
        },
      })

      if (signUpError) throw signUpError

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      console.error("Sign up error:", error)
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during sign up"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Step {currentStep} of 4: {steps[currentStep - 1].description}
              </CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          {/* Step 1: Account Basics */}
          {currentStep === 1 && (
            <Form {...step1Form}>
              <form className="space-y-4">
                <FormField
                  control={step1Form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="avatar"
                  render={() => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <Dropzone
                          src={step1Form.watch("avatar")}
                          onDrop={(acceptedFiles) => {
                            step1Form.setValue("avatar", acceptedFiles)
                            // Create file preview
                            if (acceptedFiles.length > 0) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                if (typeof e.target?.result === "string") {
                                  setFilePreview(e.target.result)
                                }
                              }
                              reader.readAsDataURL(acceptedFiles[0])
                            } else {
                              setFilePreview(undefined)
                            }
                          }}
                          maxSize={5 * 1024 * 1024} // 5MB
                          accept={{
                            "image/jpeg": [".jpg", ".jpeg"],
                            "image/png": [".png"],
                            "image/gif": [".gif"],
                          }}
                        >
                          <DropzoneEmptyState>
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                              <p className="text-sm font-medium text-muted-foreground">
                                Click to upload image
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                PNG, JPG, GIF up to 5MB
                              </p>
                            </div>
                          </DropzoneEmptyState>
                          <DropzoneContent>
                            <div className="flex items-center space-x-3">
                              {filePreview ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                  <img
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                    src={filePreview}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-muted-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {step1Form.watch("avatar")[0]?.name ||
                                    "No file selected"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {step1Form.watch("avatar")[0]
                                    ? `${(
                                        step1Form.watch("avatar")[0].size /
                                        1024 /
                                        1024
                                      ).toFixed(2)} MB`
                                    : "PNG, JPG, GIF up to 5MB"}
                                </p>
                              </div>
                              {step1Form.watch("avatar")[0] && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    step1Form.setValue("avatar", [])
                                    setFilePreview(undefined)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      step1Form.setValue("avatar", [])
                                      setFilePreview(undefined)
                                    }
                                  }}
                                  className="p-1 hover:bg-muted rounded-md transition-colors flex-shrink-0 cursor-pointer"
                                  aria-label="Remove file"
                                >
                                  <X className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </DropzoneContent>
                        </Dropzone>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters long
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step1Form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Step 2: Profile Information */}
          {currentStep === 2 && (
            <Form {...step2Form}>
              <form className="space-y-4">
                <FormField
                  control={step2Form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself in a few sentences..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/160 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step2Form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco, CA" {...field} />
                      </FormControl>
                      <FormDescription>
                        City, State/Country (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step2Form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourwebsite.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your portfolio, blog, or company website (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Step 3: Social & Professional */}
          {currentStep === 3 && (
            <Form {...step3Form}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={step3Form.control}
                    name="twitter_handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="github_handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={step3Form.control}
                    name="linkedin_handle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="in/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={step3Form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role/Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Frontend Developer, UX Designer, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step3Form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your current company (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step3Form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Step 4: Interests & Preferences */}
          {currentStep === 4 && (
            <Form {...step4Form}>
              <form className="space-y-6">
                <FormField
                  control={step4Form.control}
                  name="primary_interests"
                  render={() => (
                    <FormItem>
                      <FormLabel>Primary Interests * (Select 1-5)</FormLabel>
                      <FormDescription>
                        What areas are you most interested in?
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {primaryInterests.map((interest) => (
                          <FormField
                            key={interest}
                            control={step4Form.control}
                            name="primary_interests"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(interest)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        if (current.length < 5) {
                                          field.onChange([...current, interest])
                                        }
                                      } else {
                                        field.onChange(
                                          current.filter(
                                            (item) => item !== interest
                                          )
                                        )
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {interest}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={step4Form.control}
                  name="favorite_tools"
                  render={() => (
                    <FormItem>
                      <FormLabel>Favorite Tools * (Select 1-10)</FormLabel>
                      <FormDescription>
                        What tools and technologies do you work with?
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-64 overflow-y-auto">
                        {favoriteTools.map((tool) => (
                          <FormField
                            key={tool}
                            control={step4Form.control}
                            name="favorite_tools"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(tool)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || []
                                      if (checked) {
                                        if (current.length < 10) {
                                          field.onChange([...current, tool])
                                        }
                                      } else {
                                        field.onChange(
                                          current.filter(
                                            (item) => item !== tool
                                          )
                                        )
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {tool}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
