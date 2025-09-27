import { useEffect, useState } from "react"
import { createClient } from "@/db/supabase/client"

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserImage = async () => {
      const { data, error } = await createClient().auth.getClaims()
      if (error) {
        console.error(error)
      }

      setImage(data?.claims?.user_metadata?.avatar_url ?? null)
    }
    fetchUserImage()
  }, [])

  return image
}
