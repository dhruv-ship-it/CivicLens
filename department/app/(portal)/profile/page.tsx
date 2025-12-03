"use client"

import { useRouter } from "next/navigation"
import { Building2, Calendar, LogOut, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="min-h-[calc(100vh-56px)] p-6">
      <div className="mx-auto max-w-lg">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="text-center border-b border-border pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-semibold text-foreground">Department Profile</CardTitle>
            <CardDescription className="text-muted-foreground">Your registered department information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Department Name
              </Label>
              <Input value={user?.department || ""} disabled className="bg-muted text-foreground cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pincode
              </Label>
              <Input value={user?.pincode || ""} disabled className="bg-muted text-foreground cursor-not-allowed" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <Input value={user?.createdAt || ""} disabled className="bg-muted text-foreground cursor-not-allowed" />
            </div>

            <div className="pt-4 border-t border-border">
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
