"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingActionButton() {
  return (
    <Link href="/add-complaint">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 md:bottom-8 md:right-8"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Complaint</span>
      </Button>
    </Link>
  )
}
