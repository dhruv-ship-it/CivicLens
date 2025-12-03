"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { LogoutModal } from "@/components/logout-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { userAuth } from "@/lib/api"
import { useEffect } from "react"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    pincode: "",
    currentPassword: "",
    newPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        pincode: user.pincode,
        currentPassword: "",
        newPassword: "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required"
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode"
    }

    if (formData.newPassword && !formData.currentPassword) {
      newErrors.currentPassword = "Current password is required to change password"
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const updates: any = {}
      if (formData.username !== user?.username) updates.username = formData.username
      if (formData.pincode !== user?.pincode) updates.pincode = formData.pincode
      if (formData.newPassword) {
        updates.currentPassword = formData.currentPassword
        updates.newPassword = formData.newPassword
      }

      const result = await userAuth.updateProfile(updates)
      updateUser(result.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setFormData({ ...formData, currentPassword: "", newPassword: "" })
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to update profile. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(false)
    logout()
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
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-xl text-primary">
                  {formData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">Profile Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {saved && (
                <div className="rounded-lg border border-primary/50 bg-primary/10 p-3 text-sm text-primary">
                  Changes saved successfully!
                </div>
              )}

              {errors.general && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value })
                    setErrors({ ...errors, username: "" })
                  }}
                  className={errors.username ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => {
                    setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })
                    setErrors({ ...errors, pincode: "" })
                  }}
                  className={errors.pincode ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.pincode && <p className="text-sm text-destructive">{errors.pincode}</p>}
                <p className="text-xs text-muted-foreground">Your pincode determines which local complaints you see</p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Change Password</h3>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, currentPassword: e.target.value })
                        setErrors({ ...errors, currentPassword: "" })
                      }}
                      className={errors.currentPassword ? "border-destructive pr-10" : "pr-10"}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value })
                        setErrors({ ...errors, newPassword: "" })
                      }}
                      className={errors.newPassword ? "border-destructive pr-10" : "pr-10"}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="flex-1 gap-2" disabled={loading}>
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowLogoutModal(true)}
                  disabled={loading}
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <LogoutModal open={showLogoutModal} onOpenChange={setShowLogoutModal} onConfirm={handleLogout} />
    </div>
  )
}
