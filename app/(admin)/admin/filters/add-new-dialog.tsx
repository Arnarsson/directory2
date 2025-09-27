"use client"

import React, { useState, useTransition } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createCategory, createLabel, createTag } from "./actions"

interface AddNewItemDialogProps {
  itemType: "category" | "label" | "tag"
}

export const AddNewItemDialog: React.FC<AddNewItemDialogProps> = ({
  itemType,
}) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      try {
        if (itemType === "category") {
          await createCategory(name.trim(), icon.trim() || undefined)
        } else if (itemType === "label") {
          await createLabel(name.trim())
        } else {
          await createTag(name.trim())
        }

        toast.success(
          `${
            itemType.charAt(0).toUpperCase() + itemType.slice(1)
          } created successfully!`
        )

        // Reset form and close dialog
        setName("")
        setIcon("")
        setOpen(false)
      } catch (error) {
        console.error(`Error creating ${itemType}:`, error)
        toast.error(`Failed to create ${itemType}. Please try again.`)
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName("")
      setIcon("")
    }
    setOpen(newOpen)
  }

  const getItemTypeInfo = () => {
    switch (itemType) {
      case "category":
        return {
          title: "Add New Category",
          description: "Create a new category to organize products",
          placeholder: "Enter category name",
          iconPlaceholder: "Enter icon name (optional)",
        }
      case "label":
        return {
          title: "Add New Label",
          description: "Create a new label for special attributes",
          placeholder: "Enter label name",
          iconPlaceholder: "",
        }
      case "tag":
        return {
          title: "Add New Tag",
          description: "Create a new tag for product features",
          placeholder: "Enter tag name",
          iconPlaceholder: "",
        }
    }
  }

  const itemInfo = getItemTypeInfo()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemInfo.title}</DialogTitle>
          <DialogDescription>{itemInfo.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={itemInfo.placeholder}
                disabled={isPending}
                required
                maxLength={50}
                minLength={1}
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/50 characters
              </p>
            </div>
            {itemType === "category" && (
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder={itemInfo.iconPlaceholder}
                  disabled={isPending}
                  maxLength={30}
                />
                <p className="text-xs text-muted-foreground">
                  {icon.length}/30 characters
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
