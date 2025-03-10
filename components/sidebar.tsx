"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Folder, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const [folders, setFolders] = useState<SidebarFolder[]>([
    { id: "1", name: "Personal" },
    { id: "2", name: "Work" },
    { id: "3", name: "Travel" },
  ])

  const addNewNote = () => {
    const newNote = {
      id: String(recentNotes.length + 1),
      title: `New Note ${recentNotes.length + 1}`
    }
    setRecentNotes([newNote, ...recentNotes])
    setSelectedNoteId(newNote.id)
    onSelectNote(newNote.id)
  }

  const addNewFolder = () => {
    const newFolder = {
      id: String(folders.length + 1),
      name: `New Folder ${folders.length + 1}`
    }
    setFolders([...folders, newFolder])
  }

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId)
    onSelectNote(noteId)
  }

  return (
    <div className="w-[280px] h-screen bg-background border-r border-border overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h1 className="text-xl font-semibold mb-4">Note Wise</h1>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={addNewNote}>
          <PlusCircle size={16} />
          New Note
        </Button>
      </div>

      {recentNotes.length > 0 && (
        <div className="p-4">
          <h2 className="text-sm font-medium mb-2">Recent</h2>
          {recentNotes.map((note) => (
            <Button
              key={note.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 mb-1",
                selectedNoteId === note.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleNoteSelect(note.id)}
            >
              <FileText size={16} />
              {note.title}
            </Button>
          ))}
        </div>
      )}

      <div className="p-4">
        <h2 className="text-sm font-medium mb-2">Folders</h2>
        {folders.map((folder) => (
          <Button key={folder.id} variant="ghost" className="w-full justify-start gap-2 mb-1">
            <Folder size={16} />
            {folder.name}
          </Button>
        ))}
        <Button variant="outline" className="w-full justify-start gap-2 mt-2" onClick={addNewFolder}>
          <PlusCircle size={16} />
          New Folder
        </Button>
      </div>
    </div>
  )
}
