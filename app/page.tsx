"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import EmptyState from "@/components/empty-state"
import type { Note } from "@/types/note"

export interface Folder {
  id: string
  name: string
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([
    { id: "1", name: "Personal" },
    { id: "2", name: "Work" },
    { id: "3", name: "Travel" },
  ])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Load notes and folders from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    const savedFolders = localStorage.getItem("folders")
    if (savedNotes) setNotes(JSON.parse(savedNotes))
    if (savedFolders) setFolders(JSON.parse(savedFolders))
  }, [])

  // Save notes and folders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders))
  }, [folders])

  const handleUpdateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    )
    setNotes(updatedNotes)
    setSelectedNote(updatedNote)
  }

  const handleAddNote = (newNote: Note) => {
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
  }

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    setNotes(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
    }
  }

  const handleUpdateFolder = (updatedFolder: Folder) => {
    const updatedFolders = folders.map(folder =>
      folder.id === updatedFolder.id ? updatedFolder : folder
    )
    setFolders(updatedFolders)
  }

  const handleAddFolder = (newFolder: Folder) => {
    setFolders([...folders, newFolder])
  }

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== folderId)
    setFolders(updatedFolders)
  }

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
          notes={notes}
          folders={folders}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
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
        {selectedNote ? (
          <Editor 
            note={selectedNote} 
            onUpdateNote={handleUpdateNote}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </main>
  )
}

