"use client"

import { useState, useEffect } from "react"
import { MapPin, Filter } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { ComplaintCard } from "@/components/complaint-card"
import { FloatingActionButton } from "@/components/floating-action-button"
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
import { categoryLabels, categoryColors } from "@/lib/mock-data"

const categories: Array<Complaint["category"]> = ["waterlogging", "potholes", "garbages", "streetlight", "others"]

export default function HomePage() {
  const { user } = useAuth()
  const [selectedCategories, setSelectedCategories] = useState<Complaint["category"][]>([])
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
      const data = await complaints.getUserComplaints()
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
      const data = await complaints.getUserResolvedComplaints()
      setResolvedComplaints(data.complaints)
    } catch (error) {
      console.error("Failed to load resolved complaints:", error)
    } finally {
      setLoadingResolved(false)
    }
  }

  const filteredActiveComplaints =
    selectedCategories.length > 0
      ? activeComplaints.filter((c) => selectedCategories.includes(c.category))
      : activeComplaints

  const filteredResolvedComplaints =
    selectedCategories.length > 0
      ? resolvedComplaints.filter((c) => selectedCategories.includes(c.category))
      : resolvedComplaints

  const toggleCategory = (category: Complaint["category"]) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleVoteUpdate = (complaintId: string, upvotes: number, downvotes: number, userVote: "upvote" | "downvote" | null) => {
    // Update in active complaints
    setActiveComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, upvotes, downvotes, userVote } 
          : complaint
      )
    )
    
    // Update in resolved complaints
    setResolvedComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId 
          ? { ...complaint, upvotes, downvotes, userVote } 
          : complaint
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Local Issues</h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Pincode: {user?.pincode || "N/A"}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleCategory(category)}
                  >
                    <span
                      className={`mr-2 inline-block h-2 w-2 rounded-full ${categoryColors[category].split(" ")[0]}`}
                    />
                    {categoryLabels[category]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className={`${categoryColors[category]} cursor-pointer`}
                  onClick={() => toggleCategory(category)}
                >
                  {categoryLabels[category]} ×
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setSelectedCategories([])}>
                Clear all
              </Button>
            </div>
          )}
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
            ) : filteredActiveComplaints.length > 0 ? (
              filteredActiveComplaints.map((complaint) => (
                <ComplaintCard 
                  key={complaint.id} 
                  complaint={complaint} 
                  currentUser={user?.username || ""} 
                  onVoteUpdate={handleVoteUpdate}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                <p className="text-muted-foreground">No active complaints found for the selected filters.</p>
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
              ) : filteredResolvedComplaints.length > 0 ? (
                filteredResolvedComplaints.map((complaint) => (
                  <ComplaintCard 
                    key={complaint.id} 
                    complaint={complaint} 
                    currentUser={user?.username || ""} 
                    onVoteUpdate={handleVoteUpdate}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed bg-card p-12 text-center">
                  <p className="text-muted-foreground">No resolved complaints found for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <FloatingActionButton />
    </div>
  )
}