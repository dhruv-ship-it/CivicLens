"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, ImageIcon, Send } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryLabels } from "@/lib/mock-data"
import { complaints } from "@/lib/api"

const categories: Array<"waterlogging" | "potholes" | "garbages" | "streetlight" | "others"> = [
  "waterlogging",
  "potholes",
  "garbages",
  "streetlight",
  "others",
]

export default function AddComplaintPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: "" as "waterlogging" | "potholes" | "garbages" | "streetlight" | "others" | "",
    address: "",
    description: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isFormValid = formData.category || imagePreview

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.category && !imagePreview) {
      newErrors.general = "Please select a category or upload an image"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Allow submission with just an image (ML classification will be used)
    if (!formData.category && !imagePreview) {
      newErrors.general = "Please select a category or upload an image for classification"
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Prepare form data for submission
      const complaintData = new FormData()
      complaintData.append('address', formData.address.trim())
      
      if (formData.category) {
        complaintData.append('category', formData.category)
      }
      
      if (formData.description.trim()) {
        complaintData.append('description', formData.description.trim())
      }
      
      if (fileInputRef.current?.files?.[0]) {
        complaintData.append('image', fileInputRef.current.files[0])
      }
      
      await complaints.createWithImage(complaintData)
      router.push("/home")
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to submit complaint. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link
          href="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Report an Issue</CardTitle>
            <CardDescription>Help improve your community by reporting civic issues in your area.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value as typeof formData.category })
                    setErrors({ ...errors, general: "" })
                  }}
                  disabled={loading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {categoryLabels[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a category or upload an image (at least one required)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Upload Image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />

                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-lg border">
                    <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-48 w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted"
                  >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Click to upload image</span>
                    <span className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter the location of the issue"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    setErrors({ ...errors, address: "" })
                  }}
                  className={errors.address ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about the issue..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push("/home")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={!isFormValid || loading}>
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
