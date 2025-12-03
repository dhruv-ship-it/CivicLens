"use client"

import { MapPin, User, ThumbsUp, ThumbsDown, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Complaint {
  id: string
  category: string
  username: string
  address: string
  description?: string
  upvotes: number
  downvotes: number
}

interface ComplaintCardProps {
  complaint: Complaint
  onResolve: (id: string) => void
}

export function ComplaintCard({ complaint, onResolve }: ComplaintCardProps) {
  return (
    <Card className="border border-border/50 bg-card transition-all duration-200 hover:shadow-lg hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
            {complaint.category}
          </Badge>
          <Button
            size="sm"
            onClick={() => onResolve(complaint.id)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Resolve
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{complaint.username}</span>
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
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ThumbsUp className="h-4 w-4" />
            <span>{complaint.upvotes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ThumbsDown className="h-4 w-4" />
            <span>{complaint.downvotes}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
