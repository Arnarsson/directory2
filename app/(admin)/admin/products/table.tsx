"use client"

import React, { useEffect, useOptimistic, useState, useTransition } from "react"
import { PencilIcon, SettingsIcon, ShieldCheckIcon } from "lucide-react"

import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  approveAllPendingProducts,
  deleteProduct,
  toggleProductFeatured,
  updateProduct,
} from "./actions"
import { EditProductDialog } from "./edit-product-dialog"

interface AdminProduct extends Product {
  archived?: boolean
}

interface AdminTableProps {
  products: AdminProduct[]
}

type ProductState = {
  products: AdminProduct[]
  pendingProductIds: Set<string>
}

type UpdateProductState = {
  updatedProduct?: AdminProduct
  pendingProductId?: string
  pendingProductIdToRemove?: string
  deletedProductId?: string
  approvedProductIds?: string[]
}

export const AdminTable: React.FC<AdminTableProps> = ({ products }) => {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useOptimistic<ProductState, UpdateProductState>(
    { products, pendingProductIds: new Set() },
    updateProductState
  )

  const [undoDelete, setUndoDelete] = useState<null | {
    id: string
    timeout: NodeJS.Timeout
  }>(null)

  const [deletingProductIds, setDeletingProductIds] = useState<Set<string>>(
    new Set()
  )

  const toggleApproval = async (id: string, approved: boolean) => {
    const product = state.products.find((p) => p.id === id)
    if (!product) return
    const updatedProduct = { ...product, approved }

    startTransition(async () => {
      setState({ updatedProduct, pendingProductId: id })
      try {
        await updateProduct(id, approved)
      } finally {
        setState({
          pendingProductIdToRemove: id,
        })
      }
    })
  }

  const toggleFeatured = async (id: string) => {
    const product = state.products.find((p) => p.id === id)
    if (!product) return
    const updatedProduct = { ...product, featured: !product.featured }

    startTransition(async () => {
      setState({ updatedProduct, pendingProductId: id })
      try {
        await toggleProductFeatured(id)
      } finally {
        setState({
          pendingProductIdToRemove: id,
        })
      }
    })
  }

  const handleDelete = (id: string) => {
    startTransition(() => {
      setState({ pendingProductId: id })
      handleDeleteProduct(id, setState, setUndoDelete, setDeletingProductIds)
    })
  }

  const cancelDelete = (id: string) =>
    cancelDeleteProduct(id, undoDelete, setUndoDelete, setDeletingProductIds)

  const handleApproveAllPending = async () => {
    startTransition(async () => {
      try {
        const approvedIds = await approveAllPendingProducts()
        setState({
          approvedProductIds: approvedIds,
        })
      } catch (error) {
        console.error("Error approving all pending products:", error)
      }
    })
  }

  useEffect(() => {
    if (undoDelete) {
      const interval = setInterval(() => {
        setDeletingProductIds((prev) => {
          const newSet = new Set(prev)
          if (newSet.has(undoDelete.id)) {
            newSet.delete(undoDelete.id)
          } else {
            newSet.add(undoDelete.id)
          }
          return newSet
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [undoDelete])

  return (
    <div>
      <div className="flex w-full mb-4">
        <Button onClick={handleApproveAllPending} className="ml-auto text-sm">
          <ShieldCheckIcon className="size-4 mr-1" />
          <span className="hidden sm:inline">Approve All Pending</span>
          <span className="sm:hidden">Approve All</span>
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-md border shadow-sm">
        <div className="min-w-full inline-block align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 hidden md:table-cell">
                  <span className="sr-only">Logo</span>
                </TableHead>
                <TableHead className="w-32 md:w-40">Name</TableHead>
                <TableHead className="w-24 hidden sm:table-cell">
                  Twitter
                </TableHead>
                <TableHead className="w-32 hidden lg:table-cell">
                  Website
                </TableHead>
                <TableHead className="w-40 hidden xl:table-cell">
                  Punchline
                </TableHead>
                <TableHead className="w-48 hidden 2xl:table-cell">
                  Description
                </TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-20">Featured</TableHead>
                <TableHead className="w-16">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.products.map((product) => (
                <TableRow
                  key={product.id}
                  className={`${
                    deletingProductIds.has(product.id)
                      ? "opacity-50"
                      : "opacity-100"
                  } transition-opacity duration-1000 ease-in-out`}
                >
                  <TableCell className="hidden md:table-cell">
                    <img
                      alt={`${product.codename} logo`}
                      className="h-12 w-12 rounded-md object-cover"
                      src={product.logo_src || "/placeholder.png"}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div
                      className="max-w-[120px] md:max-w-[160px] truncate"
                      title={product.full_name || undefined}
                    >
                      <div className="text-xs text-muted-foreground ">
                        {product.codename}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div
                      className="max-w-[96px] truncate"
                      title={product.twitter_handle || undefined}
                    >
                      {product.twitter_handle}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <a
                      href={product.product_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[128px] truncate block hover:underline"
                      title={product.product_website}
                    >
                      {product.product_website}
                    </a>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div
                      className="max-w-[160px] truncate"
                      title={product.punchline}
                    >
                      {product.punchline}
                    </div>
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell">
                    <div
                      className="max-w-[192px] truncate"
                      title={product.description}
                    >
                      {product.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.approved ? (
                      <Badge className="text-xs">
                        <span className="hidden sm:inline">Approved</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        <span className="hidden sm:inline">Pending</span>
                        <span className="sm:hidden">⏳</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Badge className="text-xs">
                        <span className="hidden sm:inline">Featured</span>
                        <span className="sm:hidden">⭐</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <span className="hidden sm:inline">Not Featured</span>
                        <span className="sm:hidden">-</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            variant="ghost"
                            disabled={state.pendingProductIds.has(product.id)}
                          >
                            <SettingsIcon className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleApproval(product.id, !product.approved)
                            }
                            disabled={state.pendingProductIds.has(product.id)}
                          >
                            {product.approved ? "Revoke Approval" : "Approve"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleFeatured(product.id)}
                            disabled={state.pendingProductIds.has(product.id)}
                          >
                            {product.featured
                              ? "Remove Featured"
                              : "Mark Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              // Edit dialog will be handled by the EditProductDialog component
                            }}
                            disabled={state.pendingProductIds.has(product.id)}
                          >
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            disabled={state.pendingProductIds.has(product.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                          {undoDelete && undoDelete.id === product.id && (
                            <DropdownMenuItem
                              onClick={() => cancelDelete(product.id)}
                              disabled={state.pendingProductIds.has(product.id)}
                            >
                              Cancel Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <EditProductDialog
                        product={product}
                        onProductUpdated={(updatedProduct) => {
                          setState({ updatedProduct })
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {undoDelete && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <span>Product will be archived in 5 seconds</span>
          <Button onClick={() => cancelDelete(undoDelete.id)} className="ml-4">
            Undo
          </Button>
        </div>
      )}
    </div>
  )
}

export const updateProductState = (
  state: ProductState,
  newState: UpdateProductState
): ProductState => ({
  products: newState.updatedProduct
    ? state.products.map((product) =>
        product.id === newState.updatedProduct!.id
          ? newState.updatedProduct!
          : product
      )
    : newState.deletedProductId
    ? state.products.filter(
        (product) => product.id !== newState.deletedProductId
      )
    : newState.approvedProductIds
    ? state.products.map((product) =>
        newState.approvedProductIds!.includes(product.id)
          ? { ...product, approved: true }
          : product
      )
    : state.products,
  pendingProductIds: newState.pendingProductId
    ? new Set([...state.pendingProductIds, newState.pendingProductId])
    : new Set(
        [...state.pendingProductIds].filter(
          (id) => id !== newState.pendingProductIdToRemove
        )
      ),
})

export const handleDeleteProduct = (
  id: string,
  setState: React.Dispatch<UpdateProductState>,
  setUndoDelete: React.Dispatch<
    React.SetStateAction<null | { id: string; timeout: NodeJS.Timeout }>
  >,
  setDeletingProductIds: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  const timeout = setTimeout(async () => {
    await deleteProduct(id)
    setState({
      deletedProductId: id,
    })
    setUndoDelete(null)
  }, 5000)

  setUndoDelete({ id, timeout })
  setDeletingProductIds((prev) => new Set(prev.add(id)))
}

export const cancelDeleteProduct = (
  id: string,
  undoDelete: { id: string; timeout: NodeJS.Timeout } | null,
  setUndoDelete: React.Dispatch<
    React.SetStateAction<null | { id: string; timeout: NodeJS.Timeout }>
  >,
  setDeletingProductIds: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
  if (undoDelete && undoDelete.id === id) {
    clearTimeout(undoDelete.timeout)
    setUndoDelete(null)
    setDeletingProductIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }
}
