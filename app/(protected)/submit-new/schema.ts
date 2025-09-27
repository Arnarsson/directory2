import { z } from "zod"

export const schema = z.object({
  productWebsite: z.string().trim().url({ message: "Invalid URL." }),
  codename: z.string().trim().min(1, { message: "Product name is required." }),
  punchline: z
    .string()
    .trim()
    .min(1, { message: "Product punchline is required." })
    .max(30, { message: "Punchline must be less than 30 characters." }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required." }),
  categories: z.string().trim().min(1, { message: "Category is required." }),
  images: z.instanceof(File, { message: "Product logo is required." }),
  logo_src: z.string().optional(),
})

export const enrichmentSchema = z.object({
  tags: z
    .array(z.string())
    .min(1, { message: "At least one tag is required." }),
  labels: z
    .array(z.string())
    .min(1, { message: "At least one label is required." }),
})
