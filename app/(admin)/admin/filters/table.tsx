"use client"

import React, { useOptimistic, useState, useTransition } from "react"
import {
  CheckIcon,
  MoveHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  deleteCategory,
  deleteLabel,
  deleteTag,
  updateCategory,
  updateLabel,
  updateTag,
} from "./actions"

interface Item {
  id: string
  name: string
  icon?: string
  created_at: string
}

interface AdminTableProps {
  items: Item[]
  itemType: "category" | "label" | "tag"
}

type ItemState = {
  items: Item[]
  pendingItemIds: Set<string>
  deletedItemIds: Set<string>
}

type UpdateItemState = {
  updatedItem?: Item
  pendingItemId?: string
  pendingItemIdToRemove?: string
  deletedItemId?: string
}

export const AdminTable: React.FC<AdminTableProps> = ({ items, itemType }) => {
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editIcon, setEditIcon] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  const [state, setState] = useOptimistic<ItemState, UpdateItemState>(
    { items, pendingItemIds: new Set(), deletedItemIds: new Set() },
    updateItemState
  )

  const startEditing = (item: Item) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditIcon(item.icon || "")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName("")
    setEditIcon("")
  }

  const saveEdit = async (id: string) => {
    const item = state.items.find((u) => u.id === id)
    if (!item) return

    startTransition(async () => {
      setState({ pendingItemId: id })
      try {
        if (itemType === "category") {
          await updateCategory(id, editName, editIcon)
        } else if (itemType === "label") {
          await updateLabel(id, editName)
        } else {
          await updateTag(id, editName)
        }

        toast.success(
          `${
            itemType.charAt(0).toUpperCase() + itemType.slice(1)
          } updated successfully!`
        )

        setEditingId(null)
        setEditName("")
        setEditIcon("")
      } catch (error) {
        console.error(`Error updating ${itemType}:`, error)
        toast.error(`Failed to update ${itemType}. Please try again.`)
      } finally {
        setState({
          pendingItemIdToRemove: id,
        })
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit(id)
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEditing()
    }
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      setState({ pendingItemId: id })
      try {
        if (itemType === "category") {
          await deleteCategory(id)
        } else if (itemType === "label") {
          await deleteLabel(id)
        } else {
          await deleteTag(id)
        }

        toast.success(
          `${
            itemType.charAt(0).toUpperCase() + itemType.slice(1)
          } deleted successfully!`
        )

        setState({ deletedItemId: id })
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error)
        toast.error(`Failed to delete ${itemType}. Please try again.`)
      } finally {
        setState({
          pendingItemIdToRemove: id,
        })
      }
    })
    setDeleteDialogOpen(null)
  }

  const filteredItems = state.items.filter(
    (item) => !state.deletedItemIds.has(item.id)
  )

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Created At</TableHead>
            {itemType === "category" && (
              <TableHead className="hidden sm:table-cell">Icon</TableHead>
            )}
            <TableHead>
              <span>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow
              key={item.id}
              className={`${
                state.pendingItemIds.has(item.id) ? "opacity-50" : "opacity-100"
              } transition-opacity duration-1000 ease-out`}
            >
              <TableCell className="font-medium">
                {editingId === item.id ? (
                  <div className="space-y-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full"
                      placeholder="Enter name..."
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      maxLength={50}
                      minLength={1}
                    />
                    <p className="text-xs text-muted-foreground">
                      {editName.length}/50 characters
                    </p>
                  </div>
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell font-medium">
                {item.created_at}
              </TableCell>
              {itemType === "category" && (
                <TableCell className="hidden sm:table-cell">
                  {editingId === item.id ? (
                    <div className="space-y-1">
                      <Input
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        className="w-full"
                        placeholder="Enter icon name..."
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        maxLength={30}
                      />
                      <p className="text-xs text-muted-foreground">
                        {editIcon.length}/30 characters
                      </p>
                    </div>
                  ) : (
                    item.icon || "N/A"
                  )}
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  {editingId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveEdit(item.id)}
                        disabled={
                          state.pendingItemIds.has(item.id) || !editName.trim()
                        }
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={state.pendingItemIds.has(item.id)}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="sm"
                          variant="ghost"
                          disabled={state.pendingItemIds.has(item.id)}
                        >
                          <MoveHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => startEditing(item)}
                          disabled={state.pendingItemIds.has(item.id)}
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialogOpen(item.id)}
                          disabled={state.pendingItemIds.has(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {itemType}"
              {filteredItems.find((item) => item.id === deleteDialogOpen)?.name}
              ".
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const updateItemState = (
  state: ItemState,
  newState: UpdateItemState
): ItemState => ({
  items: newState.updatedItem
    ? state.items.map((item) =>
        item.id === newState.updatedItem!.id ? newState.updatedItem! : item
      )
    : state.items,
  pendingItemIds: newState.pendingItemId
    ? new Set([...state.pendingItemIds, newState.pendingItemId])
    : new Set(
        [...state.pendingItemIds].filter(
          (id) => id !== newState.pendingItemIdToRemove
        )
      ),
  deletedItemIds: newState.deletedItemId
    ? new Set([...state.deletedItemIds, newState.deletedItemId])
    : state.deletedItemIds,
})
