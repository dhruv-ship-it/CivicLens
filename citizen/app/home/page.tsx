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
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadComplaints()
    }
  }, [user])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const data = await complaints.getUserComplaints()
      setComplaintsList(data.complaints)
    } catch (error) {
      console.error("Failed to load complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComplaints =
    selectedCategories.length > 0
      ? complaintsList.filter((c) => selectedCategories.includes(c.category))
      : complaintsList

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
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

        <div className="space-y-4 pb-24">
          {loading ? (
            <div className="rounded-lg border border-dashed bg-card p-12 text-center">
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} onUpdate={loadComplaints} />
            ))
          ) : (
            <div className="rounded-lg border border-dashed bg-card p-12 text-center">
              <p className="text-muted-foreground">No complaints found for the selected filters.</p>
            </div>
          )}
        </div>
      </main>

      <FloatingActionButton />
    </div>
  )
}
