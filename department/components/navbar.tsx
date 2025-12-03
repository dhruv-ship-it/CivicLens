"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Eye, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAuthPage = pathname === "/login" || pathname === "/signup"

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={user ? "/dashboard" : "/login"} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Civic Lens</span>
          <span className="hidden sm:inline-block rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            Department Portal
          </span>
        </Link>

        {!isAuthPage && user && (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Link>
          </div>
        )}
        {isAuthPage && <ThemeToggle />}
      </div>
    </header>
  )
}
