import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        {children}
      </div>
    </AuthProvider>
  )
}
