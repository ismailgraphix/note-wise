"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import EmptyState from "@/components/empty-state"

export default function Home() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>("1") // Default to showing the editor

  return (
    <main className="flex h-screen bg-background">
      <Sidebar onSelectNote={(id) => setSelectedNoteId(id)} />
      {selectedNoteId ? <Editor /> : <EmptyState />}
    </main>
  )
}

