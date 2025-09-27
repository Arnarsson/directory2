import { useEffect, useState } from "react"
import { createClient } from "@/db/supabase/client"

export const useCurrentUserMeta = () => {
  const [name, setName] = useState<string | null>(null)
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserMetadata = async () => {
      const { data, error } = await createClient().auth.getClaims()
      if (error) {
        console.error(error)
      }

      setName(data?.claims?.user_metadata?.full_name ?? "?")
      setImage(data?.claims?.user_metadata?.avatar_url ?? null)
    }

    fetchUserMetadata()
  }, [])

  return { name: name || "?", image: image || null }
}
