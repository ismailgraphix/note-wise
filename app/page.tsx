"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Note, Folder } from "@/types"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { MenuIcon, Loader2, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()

  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile)
  const [isLoading, setIsLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Adjust sidebar based on screen size
  useEffect(() => {
    setIsSidebarOpen(!isMobile)
  }, [isMobile])

  // Fetch data when session is available
  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchFolders(), fetchNotes()])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      setFolders(data)
      return data
    } catch (error) {
      console.error("Error fetching folders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      })
      return []
    }
  }

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes")
      if (!response.ok) throw new Error("Failed to fetch notes")
      const data = await response.json()
      setNotes(data)

      // Select the most recently updated note if none is selected
      if (!selectedNote && data.length > 0) {
        setSelectedNote(data[0])
      }

      return data
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
      return []
    }
  }

  // Add folder
  const handleAddFolder = async (name: string) => {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) throw new Error("Failed to create folder")

      const folder = await response.json()
      setFolders((prev) => [...prev, folder])
      return folder
    } catch (error) {
      console.error("Error creating folder:", error)
      throw error
    }
  }

  // Update folder
  const handleUpdateFolder = async (id: string, name: string) => {
    try {
      const response = await fetch("/api/folders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      })

      if (!response.ok) throw new Error("Failed to update folder")

      const updatedFolder = await response.json()
      setFolders((prev) => prev.map((f) => (f.id === id ? updatedFolder : f)))
      return updatedFolder
    } catch (error) {
      console.error("Error updating folder:", error)
      throw error
    }
  }

  // Delete folder
  const handleDeleteFolder = async (id: string) => {
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete folder")

      // Update state
      setFolders((prev) => prev.filter((f) => f.id !== id))

      // Refresh notes to get updated folder assignments
      await fetchNotes()

      // If the selected note was in this folder, keep it selected
      // It will now be in "Unfiled Notes"
    } catch (error) {
      console.error("Error deleting folder:", error)
      throw error
    }
  }

  // Add note
  const handleAddNote = async (title: string, folderId?: string) => {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: "<p></p>", folderId }),
      })

      if (!response.ok) throw new Error("Failed to create note")

      const note = await response.json()
      setNotes((prev) => [note, ...prev])
      setSelectedNote(note)

      // Refresh folders to update note counts
      await fetchFolders()

      return note
    } catch (error) {
      console.error("Error creating note:", error)
      throw error
    }
  }

  // Update note
  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) throw new Error("Failed to update note")

      const updatedNote = await response.json()

      // Update notes array
      setNotes((prev) => prev.map((n) => (n.id === id ? updatedNote : n)))

      // Update selected note if it's the one being edited
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote)
      }
    } catch (error) {
      console.error("Error updating note:", error)
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      })
    }
  }

  // Delete note
  const handleDeleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete note")

      // Remove from notes array
      setNotes((prev) => prev.filter((n) => n.id !== id))

      // If this was the selected note, select another one
      if (selectedNote?.id === id) {
        const remainingNotes = notes.filter((n) => n.id !== id)
        setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null)
      }

      // Refresh folders to update note counts
      await fetchFolders()
    } catch (error) {
      console.error("Error deleting note:", error)
      throw error
    }
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">Note-wise</h1>
        </div>
        <UserNav />
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          folders={folders}
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onAddFolder={handleAddFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
        />

        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : selectedNote ? (
            <Editor
              note={selectedNote}
              onUpdate={(content: string) => handleUpdateNote(selectedNote.id, { content })}
              onUpdateTitle={(title: string) => handleUpdateNote(selectedNote.id, { title })}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-medium mb-2">No note selected</h3>
              <p className="text-center max-w-md mb-4">
                Select a note from the sidebar or create a new one to get started
              </p>
              <Button onClick={() => handleAddNote("New Note")}>Create your first note</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

