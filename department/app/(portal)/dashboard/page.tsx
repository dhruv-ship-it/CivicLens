"use client"

import { useState, useEffect } from "react"
import { MapPin, Filter } from "lucide-react"
import { ComplaintCard } from "@/components/complaint-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { complaints, type Complaint } from "@/lib/api"

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeComplaints, setActiveComplaints] = useState<Complaint[]>([])
  const [resolvedComplaints, setResolvedComplaints] = useState<Complaint[]>([])
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingResolved, setLoadingResolved] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    if (user) {
      loadActiveComplaints()
      loadResolvedComplaints()
    }
  }, [user])

  const loadActiveComplaints = async () => {
    try {
      setLoadingActive(true)
      const data = await complaints.getDepartmentComplaints()
      setActiveComplaints(data.complaints)
    } catch (error) {
      console.error("Failed to load active complaints:", error)
    } finally {
      setLoadingActive(false)
    }
  }

  const loadResolvedComplaints = async () => {
    try {
      setLoadingResolved(true)
      const data = await complaints.getDepartmentResolvedComplaints()
      setResolvedComplaints(data.complaints)
    } catch (error) {
      console.error("Failed to load resolved complaints:", error)
    } finally {
      setLoadingResolved(false)
    }
  }

  const handleResolve = (complaintId: string) => {
    // Move complaint from active to resolved
    const resolvedComplaint = activeComplaints.find(c => c.id === complaintId)
    if (resolvedComplaint) {
      setActiveComplaints(prev => prev.filter(c => c.id !== complaintId))
      setResolvedComplaints(prev => [resolvedComplaint, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Department Dashboard</h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {user?.department} • Pincode: {user?.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Complaints Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Complaints</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowResolved(!showResolved)}
            >
              {showResolved ? "Hide Resolved" : "Show Resolved"} ({resolvedComplaints.length})
            </Button>
          </div>

          <div className="space-y-4">
            {loadingActive ? (
              <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                <p className="text-muted-foreground">Loading complaints...</p>
              </div>
            ) : activeComplaints.length > 0 ? (
              activeComplaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} onResolve={handleResolve} />
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                <p className="text-muted-foreground">No active complaints found for your department.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resolved Complaints Section */}
        {showResolved && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Resolved Complaints</h2>
            <div className="space-y-4">
              {loadingResolved ? (
                <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                  <p className="text-muted-foreground">Loading resolved complaints...</p>
                </div>
              ) : resolvedComplaints.length > 0 ? (
                resolvedComplaints.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} onResolve={handleResolve} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                  <p className="text-muted-foreground">No resolved complaints found for your department.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}