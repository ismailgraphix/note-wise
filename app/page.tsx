"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import EmptyState from "@/components/empty-state"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function Home() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null) // Default to showing empty state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <main className="flex h-screen bg-background relative">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 lg:relative lg:flex transform transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar 
          onSelectNote={(id) => {
            setSelectedNoteId(id)
            setIsSidebarOpen(false)
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="mb-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        {selectedNoteId ? <Editor /> : <EmptyState />}
      </div>
    </main>
  )
}

