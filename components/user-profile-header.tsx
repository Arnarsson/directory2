"use client"

import { Github, Globe, Linkedin, MapPin, Twitter } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"

interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  location: string | null
  twitter_handle: string | null
  github_handle: string | null
  linkedin_handle: string | null
  role: string | null
  company: string | null
  experience_level: string | null
  primary_interests: string[] | null
  favorite_tools: string[] | null
  created_at: string | null
}

interface UserStats {
  productsCount: number
  bookmarksCount: number
}

interface UserProfileHeaderProps {
  user: User
  stats: UserStats
}

export function UserProfileHeader({ user, stats }: UserProfileHeaderProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
    }).format(new Date(dateString))
  }

  const getSocialUrl = (platform: string, handle: string) => {
    const urls = {
      twitter: `https://twitter.com/${handle}`,
      github: `https://github.com/${handle}`,
      linkedin: `https://linkedin.com/in/${handle}`,
    }
    return urls[platform as keyof typeof urls] || "#"
  }

  return (
    <div className="p-6">
      <div className="flex flex-col  gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xl">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold">
              {user.full_name || "Anonymous User"}
            </h1>
            {user.role && (
              <Badge variant="secondary" className="w-fit">
                {user.role}
              </Badge>
            )}
          </div>

          {user.company && (
            <p className="text-sm text-muted-foreground">{user.company}</p>
          )}

          {user.bio && (
            <p className="text-muted-foreground mt-2 mb-4 ">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
            )}

            {user.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {user.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}

            <div>Joined {formatDate(user.created_at || "")}</div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {user.twitter_handle && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getSocialUrl("twitter", user.twitter_handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Twitter className="h-3 w-3" />@{user.twitter_handle}
                </a>
              </Button>
            )}

            {user.github_handle && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getSocialUrl("github", user.github_handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Github className="h-3 w-3" />
                  {user.github_handle}
                </a>
              </Button>
            )}

            {user.linkedin_handle && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={getSocialUrl("linkedin", user.linkedin_handle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Linkedin className="h-3 w-3" />
                  {user.linkedin_handle}
                </a>
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <Badge variant="secondary">
                {stats.productsCount} Product
                {stats.productsCount !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="secondary">
                {stats.bookmarksCount} Bookmark
                {stats.bookmarksCount !== 1 ? "s" : ""}
              </Badge>
              {user.experience_level && (
                <Badge variant="outline">
                  {user.experience_level.charAt(0).toUpperCase() +
                    user.experience_level.slice(1)}{" "}
                  Level
                </Badge>
              )}
            </div>

            {user.primary_interests && user.primary_interests.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1">
                  {user.primary_interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {user.favorite_tools && user.favorite_tools.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Favorite Tools</h4>
                <div className="flex flex-wrap gap-1">
                  {user.favorite_tools.slice(0, 8).map((tool, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {user.favorite_tools.length > 8 && (
                    <Badge variant="secondary" className="text-xs">
                      +{user.favorite_tools.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
