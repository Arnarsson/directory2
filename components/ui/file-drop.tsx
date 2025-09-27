"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import { FileIcon, UploadIcon, X } from "lucide-react"
import type { DropEvent, DropzoneOptions, FileRejection } from "react-dropzone"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type DropzoneContextType = {
  src?: File[]
  accept?: DropzoneOptions["accept"]
  maxSize?: DropzoneOptions["maxSize"]
  minSize?: DropzoneOptions["minSize"]
  maxFiles?: DropzoneOptions["maxFiles"]
}
const renderBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(2)}${units[unitIndex]}`
}
const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined
)
export type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
  src?: File[]
  className?: string
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void
  children?: ReactNode
}
export const Dropzone = ({
  accept,
  maxFiles = 1,
  maxSize,
  minSize,
  onDrop,
  onError,
  disabled,
  src,
  className,
  children,
  ...props
}: DropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept,
      maxFiles,
      maxSize,
      minSize,
      onError,
      disabled,
      onDrop: (acceptedFiles, fileRejections, event) => {
        if (fileRejections.length > 0) {
          const rejection = fileRejections[0]
          const error = rejection.errors[0]

          let message = error.message
          if (error.code === "file-too-large" && maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
            message = `File is too large. Maximum size is ${maxSizeMB}MB.`
          } else if (error.code === "file-too-small" && minSize) {
            const minSizeMB = (minSize / (1024 * 1024)).toFixed(1)
            message = `File is too small. Minimum size is ${minSizeMB}MB.`
          } else if (error.code === "file-invalid-type") {
            message = `Invalid file type. Please upload a valid image file.`
          }

          onError?.(new Error(message))
          return
        }
        onDrop?.(acceptedFiles, fileRejections, event)
      },
      ...props,
    })

  return (
    <DropzoneContext.Provider
      key={JSON.stringify(src)}
      value={{ src, accept, maxSize, minSize, maxFiles }}
    >
      <div className="space-y-2">
        <Button
          className={cn(
            "relative h-auto w-full flex-col overflow-hidden p-8",
            "bg-gradient-to-b from-white to-gray-50 text-black dark:from-background/30 dark:to-neutral-800 dark:text-white",
            " rounded-[9px] dark:border-[1px] dark:border-black/30",
            "shadow-[0_0_0_1px_rgba(0,0,0,0.1)_inset,0_0.5px_0.5px_rgba(0,0,0,0.05)_inset,0_-0.5px_0.5px_rgba(0,0,0,0.05)_inset,0_1px_2px_rgba(0,0,0,0.1)]",
            "dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.06)_inset,0_0.5px_0.5px_rgba(255,255,255,0.1)_inset,0_-0.5px_0.5px_rgba(255,255,255,0.1)_inset,0_0.5px_1px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.4)]",
            "dark:hover:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)_inset,0_0.5px_0.5px_rgba(255,255,255,0.1)_inset,0_-0.5px_0.5px_rgba(255,255,255,0.1)_inset,0_0.5px_1px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.5)]",
            "border border-black/5 dark:border-white/5",
            isDragActive && "outline-none ring-1 ring-ring",
            className
          )}
          disabled={disabled}
          type="button"
          variant="outline"
          {...getRootProps()}
        >
          <input {...getInputProps()} disabled={disabled} />
          {children}
        </Button>

        {/* Show file rejection errors */}
        {fileRejections.length > 0 && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {fileRejections.map((rejection, index) => (
              <div key={index} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                <span>
                  {rejection.file.name}: {rejection.errors[0]?.message}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DropzoneContext.Provider>
  )
}
const useDropzoneContext = () => {
  const context = useContext(DropzoneContext)
  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone")
  }
  return context
}
export type DropzoneContentProps = {
  children?: ReactNode
  className?: string
}
const maxLabelItems = 3
export const DropzoneContent = ({
  children,
  className,
}: DropzoneContentProps) => {
  const { src } = useDropzoneContext()
  if (!src) {
    return null
  }
  if (children) {
    return children
  }
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <UploadIcon size={16} />
      </div>
      <p className="my-2 w-full truncate font-medium text-sm">
        {src.length > maxLabelItems
          ? `${new Intl.ListFormat("en").format(
              src.slice(0, maxLabelItems).map((file) => file.name)
            )} and ${src.length - maxLabelItems} more`
          : new Intl.ListFormat("en").format(src.map((file) => file.name))}
      </p>
      <p className="w-full text-wrap text-muted-foreground text-xs">
        Drag and drop or click to replace
      </p>
    </div>
  )
}
export type DropzoneEmptyStateProps = {
  children?: ReactNode
  className?: string
}
export const DropzoneEmptyState = ({
  children,
  className,
}: DropzoneEmptyStateProps) => {
  const { src, accept, maxSize, minSize, maxFiles } = useDropzoneContext()
  if (src && src.length > 0) {
    return null
  }
  if (children) {
    return children
  }
  let caption = ""
  if (accept) {
    caption += "Accepts "
    caption += new Intl.ListFormat("en").format(Object.keys(accept))
  }
  if (minSize && maxSize) {
    caption += ` between ${renderBytes(minSize)} and ${renderBytes(maxSize)}`
  } else if (minSize) {
    caption += ` at least ${renderBytes(minSize)}`
  } else if (maxSize) {
    caption += ` less than ${renderBytes(maxSize)}`
  }
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex size-8 items-center justify-center rounded-md bg-card text-muted-foreground">
        <FileIcon size={16} className="fill-muted-foreground/20" />
      </div>
      <p className="my-2 w-full truncate text-wrap font-medium text-sm">
        Upload {maxFiles === 1 ? "a file" : "files"}
      </p>
      <p className="w-full truncate text-wrap text-muted-foreground text-xs">
        Drag and drop or click to upload
      </p>
      {caption && (
        <p className="text-wrap text-muted-foreground text-xs">{caption}.</p>
      )}
      {maxSize && (
        <p className="text-wrap text-muted-foreground text-[10px] mt-1">
          <strong>Tip:</strong> For best performance, keep files under{" "}
          {((maxSize / (1024 * 1024)) * 0.8).toFixed(1)}MB
        </p>
      )}
    </div>
  )
}

export type FileUploaderProps = {
  value?: File | null
  onValueChange?: (file: File | null) => void
  accept?: DropzoneOptions["accept"]
  maxSize?: DropzoneOptions["maxSize"]
  minSize?: DropzoneOptions["minSize"]
  maxFiles?: DropzoneOptions["maxFiles"]
  className?: string
  disabled?: boolean
}

export const FileUploader = ({
  value = null,
  onValueChange,
  accept = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSize = 2 * 1024 * 1024, // 2MB
  minSize,
  maxFiles = 1,
  className,
  disabled,
}: FileUploaderProps) => {
  const handleDrop = (acceptedFiles: File[]) => {
    // Take only the first file since we only need one logo
    const file = acceptedFiles[0] || null
    onValueChange?.(file)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isFileTooLarge = value && value.size > maxSize
  const fileSizePercentage = value ? (value.size / maxSize) * 100 : 0

  return (
    <div className="space-y-3">
      <Dropzone
        accept={accept}
        maxSize={maxSize}
        minSize={minSize}
        maxFiles={maxFiles}
        onDrop={handleDrop}
        src={value ? [value] : []}
        className={className}
        disabled={disabled}
      >
        {value ? <DropzoneContent /> : <DropzoneEmptyState />}
      </Dropzone>

      {/* File size indicator */}
      {value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">File size:</span>
            <span
              className={
                isFileTooLarge
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-foreground"
              }
            >
              {formatFileSize(value.size)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-200 ${
                isFileTooLarge
                  ? "bg-red-500"
                  : fileSizePercentage > 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(fileSizePercentage, 100)}%` }}
            />
          </div>

          {/* Size limit info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>0 MB</span>
            <span
              className={
                isFileTooLarge
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : ""
              }
            >
              {formatFileSize(maxSize)}
            </span>
          </div>

          {/* Warning message */}
          {isFileTooLarge && (
            <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4" />
                <span>
                  File is too large. Maximum size is {formatFileSize(maxSize)}.
                  Please compress your image and try again.
                </span>
              </div>
            </div>
          )}

          {/* Warning for files approaching limit */}
          {!isFileTooLarge && fileSizePercentage > 80 && (
            <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠</span>
                <span>
                  File size is approaching the limit. Consider compressing for
                  better performance.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
