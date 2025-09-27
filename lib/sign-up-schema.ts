import { z } from "zod"

export const experienceLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
] as const

export const primaryInterests = [
  "Design",
  "Frontend Development",
  "Backend Development",
  "Full Stack Development",
  "Mobile Development",
  "DevOps",
  "AI/Machine Learning",
  "Data Science",
  "Product Management",
  "UX Research",
  "Marketing",
  "Sales",
] as const

export const favoriteTools = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Svelte",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "Go",
  "Rust",
  "Java",
  "C#",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "Figma",
  "Adobe XD",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "Tailwind CSS",
  "Bootstrap",
  "Sass",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Vercel",
  "Supabase",
  "Firebase",
] as const

// Step 1: Account basics
export const accountBasicsSchema = z
  .object({
    full_name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    avatar: z
      .array(z.instanceof(File))
      .max(1, "Only one avatar allowed")
      .optional()
      .default([]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Step 2: Profile information
export const profileInfoSchema = z.object({
  bio: z
    .string()
    .trim()
    .min(10, "Bio must be at least 10 characters")
    .max(160, "Bio must be less than 160 characters"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
})

// Step 3: Social & professional
export const socialProfessionalSchema = z.object({
  twitter_handle: z
    .string()
    .trim()
    .regex(/^@?[\w]{1,15}$/, "Invalid Twitter handle")
    .optional()
    .or(z.literal("")),
  github_handle: z
    .string()
    .trim()
    .regex(/^[\w\-\.]{1,39}$/, "Invalid GitHub username")
    .optional()
    .or(z.literal("")),
  linkedin_handle: z.string().trim().optional().or(z.literal("")),
  role: z.string().trim().min(2, "Role is required"),
  company: z.string().trim().optional().or(z.literal("")),
  experience_level: z.enum(["beginner", "intermediate", "senior", "expert"]),
})

// Step 4: Interests & preferences
export const interestsPreferencesSchema = z.object({
  primary_interests: z
    .array(z.string())
    .min(1, "Please select at least one interest")
    .max(5, "Maximum 5 interests allowed"),
  favorite_tools: z
    .array(z.string())
    .min(1, "Please select at least one tool")
    .max(10, "Maximum 10 tools allowed"),
})

// Combined schema for the complete form
export const completeSignUpSchema = accountBasicsSchema
  .merge(profileInfoSchema)
  .merge(socialProfessionalSchema)
  .merge(interestsPreferencesSchema)

export type AccountBasics = z.infer<typeof accountBasicsSchema>
export type ProfileInfo = z.infer<typeof profileInfoSchema>
export type SocialProfessional = z.infer<typeof socialProfessionalSchema>
export type InterestsPreferences = z.infer<typeof interestsPreferencesSchema>
export type CompleteSignUp = z.infer<typeof completeSignUpSchema>
