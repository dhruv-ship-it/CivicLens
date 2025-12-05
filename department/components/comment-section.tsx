"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { complaints, type Comment as CommentType } from "@/lib/api"

interface CommentSectionProps {
  complaintId: string
}

export function CommentSection({ complaintId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Load initial comments
  useEffect(() => {
    loadComments(1)
  }, [complaintId])

  const loadComments = async (pageNum: number) => {
    try {
      setLoadingComments(true)
      const data = await complaints.getComments(complaintId, pageNum, 5)
      if (pageNum === 1) {
        setComments(data.comments)
      } else {
        setComments(prev => [...prev, ...data.comments])
      }
      setPage(pageNum)
      setHasMore(data.pagination.hasNextPage)
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const loadMoreComments = () => {
    loadComments(page + 1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium">Comments</h3>
        <span className="text-sm text-muted-foreground">
          ({comments.length})
        </span>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {loadingComments && page === 1 ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Card key={comment.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={loadMoreComments}
                  disabled={loadingComments}
                >
                  {loadingComments ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More Comments
                </Button>
              </div>
            )}

            {!hasMore && comments.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No more comments to load
              </p>
            )}

            {comments.length === 0 && !loadingComments && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No comments yet.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}