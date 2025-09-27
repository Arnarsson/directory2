"use client"

import React, { useOptimistic, useState, useTransition } from "react"
import { MoveHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  deleteUser,
  updateBillingAddress,
  updatePaymentMethod,
  updateUser,
} from "./actions"

interface User {
  id: string
  full_name: string
  avatar_url: string
  billing_address?: object
  payment_method?: object
}

interface UserAdminTableProps {
  users: User[]
}

type UserState = {
  users: User[]
  pendingUserIds: Set<string>
  deletedUserIds: Set<string>
}

type UpdateUserState = {
  updatedUser?: User
  pendingUserId?: string
  pendingUserIdToRemove?: string
  deletedUserId?: string
}

export const UserAdminTable: React.FC<UserAdminTableProps> = ({ users }) => {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useOptimistic<UserState, UpdateUserState>(
    { users, pendingUserIds: new Set(), deletedUserIds: new Set() },
    updateUserState
  )

  const [editUser, setEditUser] = useState<User | null>(null)
  const [newName, setNewName] = useState<string>("")
  const [newBillingAddress, setNewBillingAddress] = useState<string>("")
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  const handleEditUser = (user: User) => {
    setEditUser(user)
    setNewName(user.full_name)
    setNewBillingAddress(JSON.stringify(user.billing_address || {}, null, 2))
    setNewPaymentMethod(JSON.stringify(user.payment_method || {}, null, 2))
  }

  const handleSaveChanges = async () => {
    if (editUser) {
      startTransition(async () => {
        setState({
          updatedUser: {
            ...editUser,
            full_name: newName,
            billing_address: JSON.parse(newBillingAddress || "{}"),
            payment_method: JSON.parse(newPaymentMethod || "{}"),
          },
          pendingUserId: editUser.id,
        })
        try {
          await updateUser(editUser.id, newName)
          await updateBillingAddress(
            editUser.id,
            JSON.parse(newBillingAddress || "{}")
          )
          await updatePaymentMethod(
            editUser.id,
            JSON.parse(newPaymentMethod || "{}")
          )

          toast.success("User updated successfully!")
          setEditUser(null)
        } catch (error) {
          console.error("Error updating user:", error)
          toast.error("Failed to update user. Please try again.")
        } finally {
          setState({ pendingUserIdToRemove: editUser.id })
        }
      })
    }
  }

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      setState({ pendingUserId: id })
      try {
        await deleteUser(id)
        toast.success("User deleted successfully!")
        setState({ deletedUserId: id })
      } catch (error) {
        console.error("Error deleting user:", error)
        toast.error("Failed to delete user. Please try again.")
      } finally {
        setState({ pendingUserIdToRemove: id })
      }
    })
    setDeleteDialogOpen(null)
  }

  const filteredUsers = state.users.filter(
    (user) => !state.deletedUserIds.has(user.id)
  )

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead>Billing Address</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              className={`${
                state.pendingUserIds.has(user.id) ? "opacity-50" : "opacity-100"
              } transition-opacity duration-1000 ease-out`}
            >
              <TableCell>
                <Avatar>
                  <AvatarImage
                    src={user.avatar_url}
                    alt={`${user.full_name}'s avatar`}
                  />
                  <AvatarFallback>
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">{user.full_name}</TableCell>
              <TableCell>
                {user.billing_address ? (
                  <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
                    {JSON.stringify(user.billing_address, null, 2)}
                  </pre>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                {user.payment_method ? (
                  <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
                    {JSON.stringify(user.payment_method, null, 2)}
                  </pre>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-haspopup="true"
                      variant="ghost"
                      disabled={state.pendingUserIds.has(user.id)}
                    >
                      <MoveHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleEditUser(user)}
                      disabled={state.pendingUserIds.has(user.id)}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteDialogOpen(user.id)}
                      disabled={state.pendingUserIds.has(user.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editUser && (
        <Dialog open={Boolean(editUser)} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to the user profile here. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                  maxLength={100}
                  minLength={1}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billing_address" className="text-right">
                  Billing Address
                </Label>
                <Input
                  id="billing_address"
                  value={newBillingAddress}
                  onChange={(e) => setNewBillingAddress(e.target.value)}
                  className="col-span-3 font-mono text-xs"
                  placeholder='{"street": "123 Main St", "city": "Example City"}'
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_method" className="text-right">
                  Payment Method
                </Label>
                <Input
                  id="payment_method"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="col-span-3 font-mono text-xs"
                  placeholder='{"type": "card", "last4": "1234"}'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSaveChanges}
                disabled={!newName.trim()}
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialogOpen}
        onOpenChange={() => setDeleteDialogOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user "
              {
                filteredUsers.find((user) => user.id === deleteDialogOpen)
                  ?.full_name
              }
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

const updateUserState = (
  state: UserState,
  newState: UpdateUserState
): UserState => ({
  users: newState.updatedUser
    ? state.users.map((user) =>
        user.id === newState.updatedUser!.id ? newState.updatedUser! : user
      )
    : state.users,
  pendingUserIds: newState.pendingUserId
    ? new Set([...state.pendingUserIds, newState.pendingUserId])
    : new Set(
        [...state.pendingUserIds].filter(
          (id) => id !== newState.pendingUserIdToRemove
        )
      ),
  deletedUserIds: newState.deletedUserId
    ? new Set([...state.deletedUserIds, newState.deletedUserId])
    : state.deletedUserIds,
})
