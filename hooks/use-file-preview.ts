import { useEffect, useState } from "react"

export function useFilePreview(file: File | undefined) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Cleanup function to prevent memory leaks
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return previewUrl
}