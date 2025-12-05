"use client"

import { useState } from "react"
import { MapPin, User, FileText, MessageCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { complaints } from "@/lib/api"
import { CommentSection } from "@/components/comment-section"

export interface Complaint {
  id: string
  username: string
  category: string
  address: string
  description?: string
  pincode: string
  upvotes: number
  downvotes: number
  status: "active" | "resolved"
  createdAt: string
}

interface ComplaintCardProps {
  complaint: Complaint
  onResolve: (complaintId: string) => void
}

export function ComplaintCard({ complaint, onResolve }: ComplaintCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleResolve = async () => {
    try {
      const data = await complaints.resolve(complaint.id)
      onResolve(complaint.id)
    } catch (error) {
      console.error("Failed to resolve complaint:", error)
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
    <>
      <Card className="border border-border/50 bg-card transition-all duration-200 hover:shadow-lg hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
              {complaint.category}
            </Badge>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className="text-muted-foreground">
                {complaint.upvotes} upvotes
              </Badge>
              {complaint.status === "resolved" && (
                <Badge variant="default" className="bg-green-500 text-white">
                  Resolved
                </Badge>
              )}
            </div>
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{complaint.upvotes} upvotes</span>
            <span>•</span>
            <span>{complaint.downvotes} downvotes</span>
          </div>
          {complaint.status === "active" ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowConfirmation(true)}
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Resolved
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              Resolved
            </Button>
          )}
        </CardFooter>
        
        {/* Comment section */}
        {showComments && (
          <div className="px-6 pb-6">
            <CommentSection complaintId={complaint.id} />
          </div>
        )}
      </Card>

      {complaint.status === "active" && (
        <ConfirmationModal
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          onConfirm={handleResolve}
          title="Mark as Resolved"
          description="Are you sure you want to mark this complaint as resolved? This action cannot be undone."
        />
      )}
    </>
  )
}