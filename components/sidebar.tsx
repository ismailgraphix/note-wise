"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Folder, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
}

interface SidebarFolder {
  id: string
  name: string
}

interface SidebarProps {
  onSelectNote: (id: string) => void
}

export default function Sidebar({ onSelectNote }: SidebarProps) {
  const [recentNotes, setRecentNotes] = useState<Note[]>([{ id: "1", title: "test" }])

  const [folders, setFolders] = useState<SidebarFolder[]>([
    { id: "1", name: "Personal" },
    { id: "2", name: "Work" },
    { id: "3", name: "Travel" },
  ])

  return (
    <div className="w-64 h-screen bg-background border-r border-border overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Note Wise</h1>
        <Button variant="outline" className="w-full justify-start gap-2">
          <PlusCircle size={16} />
          New Note
        </Button>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-medium mb-2">Recent</h2>
        {recentNotes.map((note) => (
          <Button
            key={note.id}
            variant="ghost"
            className={cn("w-full justify-start gap-2 mb-1", note.id === "1" && "bg-primary text-primary-foreground")}
            onClick={() => onSelectNote(note.id)}
          >
            <FileText size={16} />
            {note.title}
          </Button>
        ))}
      </div>

      <div className="p-4">
        <h2 className="text-sm font-medium mb-2">Folders</h2>
        {folders.map((folder) => (
          <Button key={folder.id} variant="ghost" className="w-full justify-start gap-2 mb-1">
            <Folder size={16} />
            {folder.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

