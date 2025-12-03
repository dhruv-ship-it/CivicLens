"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, MapPin, Calendar, User } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Complaint } from "@/lib/api"
import { complaints } from "@/lib/api"
import { categoryColors, categoryLabels } from "@/lib/mock-data"

interface ComplaintCardProps {
  complaint: Complaint
  onUpdate?: () => void
}

export function ComplaintCard({ complaint, onUpdate }: ComplaintCardProps) {
  const [upvotes, setUpvotes] = useState(complaint.upvotes)
  const [downvotes, setDownvotes] = useState(complaint.downvotes)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(
    (complaint as any).userVote || null
  )
  const [loading, setLoading] = useState(false)

  const handleUpvote = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await complaints.upvote(complaint.id)
      setUpvotes(result.upvote)
      setDownvotes(result.downvote)
      setUserVote(result.userVote || null)
      onUpdate?.()
    } catch (error) {
      console.error("Failed to upvote:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownvote = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await complaints.downvote(complaint.id)
      setUpvotes(result.upvote)
      setDownvotes(result.downvote)
      setUserVote(result.userVote || null)
      onUpdate?.()
    } catch (error) {
      console.error("Failed to downvote:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg hover-lift border-border/50">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge className={`${categoryColors[complaint.category]} border-0 font-medium`}>
            {categoryLabels[complaint.category]}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{complaint.username}</span>
        </div>

        <div className="mb-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{complaint.address}</span>
        </div>

        {complaint.description && (
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{complaint.description}</p>
        )}
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-4 py-3">
        <div className="flex w-full items-center gap-2">
          <Button
            variant={userVote === "upvote" ? "default" : "outline"}
            size="sm"
            onClick={handleUpvote}
            disabled={loading}
            className={`gap-1.5 ${userVote === "upvote" ? "bg-primary" : ""}`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{upvotes}</span>
          </Button>
          <Button
            variant={userVote === "downvote" ? "destructive" : "outline"}
            size="sm"
            onClick={handleDownvote}
            disabled={loading}
            className="gap-1.5"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{downvotes}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
