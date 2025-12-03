"use client"

import { useState, useEffect } from "react"
import { ClipboardList, Filter } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ComplaintCard, type Complaint } from "@/components/complaint-card"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { Badge } from "@/components/ui/badge"
import { complaints as complaintsApi } from "@/lib/api"

export default function DashboardPage() {
  const { user } = useAuth()
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadComplaints()
    }
  }, [user])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const data = await complaintsApi.getDepartmentComplaints()
      // Convert API complaints to frontend format
      setComplaintsList(
        data.complaints.map((c) => ({
          id: c.id,
          category: c.category,
          username: c.username,
          address: c.address,
          description: c.description,
          upvotes: c.upvotes,
          downvotes: c.downvotes,
        }))
      )
    } catch (error) {
      console.error("Failed to load complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveClick = (id: string) => {
    setSelectedComplaint(id)
    setModalOpen(true)
  }

  const handleConfirmResolve = async () => {
    if (selectedComplaint) {
      try {
        await complaintsApi.resolve(selectedComplaint)
        await loadComplaints()
        setSelectedComplaint(null)
        setModalOpen(false)
      } catch (error) {
        console.error("Failed to resolve complaint:", error)
      }
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Complaint Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage and resolve civic complaints in your jurisdiction</p>
        </div>

        {/* Filter Info */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {user?.department}
          </Badge>
          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
            Pincode: {user?.pincode}
          </Badge>
          <span className="ml-auto text-sm text-muted-foreground">
            {complaintsList.length} complaint{complaintsList.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">Loading complaints...</p>
          </div>
        ) : complaintsList.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {complaintsList.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} onResolve={handleResolveClick} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
            <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No complaints found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              There are no pending complaints for {user?.department} in pincode {user?.pincode}.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleConfirmResolve}
        title="Resolve Complaint"
        description="Are you sure you want to resolve this complaint? This action will remove it from the pending list."
      />
    </main>
  )
}
