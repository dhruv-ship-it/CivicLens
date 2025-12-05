"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { complaints } from "@/lib/api"
import { CommentSection } from "@/components/comment-section"

export interface Complaint {
  id: string
  username: string
  category: "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"
  address: string
  description?: string
  pincode: string
  upvotes: number
  downvotes: number
  status: "active" | "resolved"
  createdAt: string
  userVote?: "upvote" | "downvote" | null
}

interface ComplaintCardProps {
  complaint: Complaint
  currentUser: string
  onVoteUpdate?: (complaintId: string, upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => void
}

export function ComplaintCard({ complaint, currentUser, onVoteUpdate }: ComplaintCardProps) {
  const [upvotes, setUpvotes] = useState(complaint.upvotes)
  const [downvotes, setDownvotes] = useState(complaint.downvotes)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(complaint.userVote || null)
  const [showComments, setShowComments] = useState(false)
  const { toast } = useToast()

  const handleUpvote = async () => {
    try {
      const data = await complaints.upvote(complaint.id)
      setUpvotes(data.upvote)
      setDownvotes(data.downvote)
      setUserVote(data.userVote)
      if (onVoteUpdate) {
        onVoteUpdate(complaint.id, data.upvote, data.downvote, data.userVote)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upvote complaint",
        variant: "destructive",
      })
    }
  }

  const handleDownvote = async () => {
    try {
      const data = await complaints.downvote(complaint.id)
      setUpvotes(data.upvote)
      setDownvotes(data.downvote)
      setUserVote(data.userVote)
      if (onVoteUpdate) {
        onVoteUpdate(complaint.id, data.upvote, data.downvote, data.userVote)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to downvote complaint",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card className="border border-border/50 bg-card transition-all duration-200 hover:shadow-lg hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
            {complaint.category}
          </Badge>
          {complaint.status === "resolved" && (
            <Badge variant="default" className="bg-green-500 text-white">
              Resolved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{complaint.username}</span>
          <span>•</span>
          <span>{formatDate(complaint.createdAt)}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{complaint.address}</span>
        </div>
        {complaint.description && (
          <div className="flex items-start gap-2 text-sm text-foreground">
            <FileText className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="line-clamp-2">{complaint.description}</p>
          </div>
        )}
        
        {/* Comment section toggle */}
        <div className="pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Comments
            <span className="ml-1 text-xs">({/* We'll update this with actual count */})</span>
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Button
            variant={userVote === "upvote" ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1"
            onClick={handleUpvote}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{upvotes}</span>
          </Button>
          <Button
            variant={userVote === "downvote" ? "default" : "outline"}
            size="sm"
            className="h-8 gap-1"
            onClick={handleDownvote}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{downvotes}</span>
          </Button>
        </div>
      </CardFooter>
      
      {/* Comment section */}
      {showComments && (
        <div className="px-6 pb-6">
          <CommentSection complaintId={complaint.id} currentUser={currentUser} />
        </div>
      )}
    </Card>
  )
}