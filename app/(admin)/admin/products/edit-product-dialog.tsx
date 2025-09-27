"use client"

import { useState, useTransition } from "react"
import { Edit3, Loader2, Save, X } from "lucide-react"

import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { updateProductDetails } from "./actions"

interface EditProductDialogProps {
  product: Product
  onProductUpdated: (updatedProduct: Product) => void
}

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

export function EditProductDialog({
  product,
  onProductUpdated,
}: EditProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    codename: product.codename || "",
    full_name: product.full_name || "",
    punchline: product.punchline || "",
    description: product.description || "",
    product_website: product.product_website || "",
    categories: product.categories || "",
    tags: product.tags || [],
    labels: product.labels || [],
    twitter_handle: product.twitter_handle || "",
    email: product.email || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.codename.trim()) {
      newErrors.codename = "Codename is required"
    }

    if (!formData.punchline.trim()) {
      newErrors.punchline = "Punchline is required"
    } else if (formData.punchline.length > 30) {
      newErrors.punchline = "Punchline must be less than 30 characters"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.product_website.trim()) {
      newErrors.product_website = "Website is required"
    } else {
      try {
        new URL(formData.product_website)
      } catch {
        newErrors.product_website = "Invalid website URL"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    startTransition(async () => {
      try {
        await updateProductDetails(product.id, formData)

        // Create updated product object
        const updatedProduct: Product = {
          ...product,
          ...formData,
        }

        onProductUpdated(updatedProduct)
        setIsOpen(false)

        // Reset form
        setFormData({
          codename: product.codename || "",
          full_name: product.full_name || "",
          punchline: product.punchline || "",
          description: product.description || "",
          product_website: product.product_website || "",
          categories: product.categories || "",
          tags: product.tags || [],
          labels: product.labels || [],
          twitter_handle: product.twitter_handle || "",
          email: product.email || "",
        })
        setErrors({})
      } catch (error) {
        console.error("Error updating product:", error)
        // You could add a toast notification here
      }
    })
  }

  const handleTagInput = (value: string) => {
    if (value.endsWith(",") || value.endsWith(" ")) {
      const tag = value.slice(0, -1).trim()
      if (tag && !formData.tags.includes(tag)) {
        handleInputChange("tags", [...formData.tags, tag])
        return ""
      }
    }
    return value
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    )
  }

  const handleLabelInput = (value: string) => {
    if (value.endsWith(",") || value.endsWith(" ")) {
      const label = value.slice(0, -1).trim()
      if (label && !formData.labels.includes(label)) {
        handleInputChange("labels", [...formData.labels, label])
        return ""
      }
    }
    return value
  }

  const removeLabel = (labelToRemove: string) => {
    handleInputChange(
      "labels",
      formData.labels.filter((label) => label !== labelToRemove)
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Edit3 className="h-4 w-4" />
          <span className="sr-only">Edit product</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product: {product.codename}</DialogTitle>
          <DialogDescription>
            Update product details. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codename">Codename *</Label>
                <Input
                  id="codename"
                  value={formData.codename}
                  onChange={(e) =>
                    handleInputChange("codename", e.target.value)
                  }
                  placeholder="e.g., magic_ui"
                  className={errors.codename ? "border-red-500" : ""}
                />
                {errors.codename && (
                  <p className="text-sm text-red-500">{errors.codename}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                  placeholder="e.g., Magic UI"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="punchline">Punchline *</Label>
              <Input
                id="punchline"
                value={formData.punchline}
                onChange={(e) => handleInputChange("punchline", e.target.value)}
                placeholder="e.g., Beautiful UI components for React"
                maxLength={30}
                className={errors.punchline ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                {errors.punchline && (
                  <span className="text-red-500">{errors.punchline}</span>
                )}
                <span>{formData.punchline.length}/30</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your product..."
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_website">Website *</Label>
              <Input
                id="product_website"
                value={formData.product_website}
                onChange={(e) =>
                  handleInputChange("product_website", e.target.value)
                }
                placeholder="https://example.com"
                type="url"
                className={errors.product_website ? "border-red-500" : ""}
              />
              {errors.product_website && (
                <p className="text-sm text-red-500">{errors.product_website}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact & Social</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@example.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_handle">Twitter Handle</Label>
                <Input
                  id="twitter_handle"
                  value={formData.twitter_handle}
                  onChange={(e) =>
                    handleInputChange("twitter_handle", e.target.value)
                  }
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories & Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories & Tags</h3>

            <div className="space-y-2">
              <Label htmlFor="categories">Category</Label>
              <select
                id="categories"
                value={formData.categories}
                onChange={(e) =>
                  handleInputChange("categories", e.target.value)
                }
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Type tags separated by commas..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const target = e.target as HTMLInputElement
                    const value = target.value.trim()
                    if (value && !formData.tags.includes(value)) {
                      handleInputChange("tags", [...formData.tags, value])
                      target.value = ""
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim()
                  if (value && !formData.tags.includes(value)) {
                    handleInputChange("tags", [...formData.tags, value])
                    e.target.value = ""
                  }
                }}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                placeholder="Type labels separated by commas..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const target = e.target as HTMLInputElement
                    const value = target.value.trim()
                    if (value && !formData.labels.includes(value)) {
                      handleInputChange("labels", [...formData.labels, value])
                      target.value = ""
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim()
                  if (value && !formData.labels.includes(value)) {
                    handleInputChange("labels", [...formData.labels, value])
                    e.target.value = ""
                  }
                }}
              />
              {formData.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => removeLabel(label)}
                    >
                      {label} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
