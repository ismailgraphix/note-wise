"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import Editor from "@/components/editor"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
}

interface Folder {
  id: string
  name: string
  notes: Note[]
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchFolders()
    fetchNotes()
  }, [])

  async function fetchFolders() {
    try {
      const response = await fetch("/api/folders")
      if (!response.ok) throw new Error("Failed to fetch folders")
      const data = await response.json()
      setFolders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch folders",
        variant: "destructive",
      })
    }
  }

  async function fetchNotes() {
    try {
      const response = await fetch("/api/notes")
      if (!response.ok) throw new Error("Failed to fetch notes")
      const data = await response.json()
      setNotes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      })
    }
  }

  async function addFolder(name: string) {
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Failed to create folder")
      const folder = await response.json()
      setFolders([...folders, folder])
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  async function updateFolder(id: string, name: string) {
    try {
      const response = await fetch("/api/folders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      })
      if (!response.ok) throw new Error("Failed to update folder")
      const updatedFolder = await response.json()
      setFolders(folders.map(f => f.id === id ? updatedFolder : f))
      toast({
        title: "Success",
        description: "Folder updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      })
    }
  }

  async function deleteFolder(id: string) {
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete folder")
      setFolders(folders.filter(f => f.id !== id))
      setNotes(notes.filter(n => n.folderId !== id))
      if (selectedNote?.folderId === id) setSelectedNote(null)
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  async function addNote(title: string, content: string = "", folderId: string | null = null) {
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, folderId }),
      })
      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to create note")
      }
      const note = await response.json()
      setNotes([...notes, note])
      
      // Update folder notes if the note was added to a folder
      if (folderId) {
        setFolders(folders.map(folder => {
          if (folder.id === folderId) {
            return {
              ...folder,
              notes: [...(folder.notes || []), note]
            }
          }
          return folder
        }))
      }
      
      setSelectedNote(note)
      toast({
        title: "Success",
        description: "Note created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      })
    }
  }

  async function updateNote(id: string, title: string, content: string) {
    try {
      const response = await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, content, folderId: selectedNote?.folderId }),
      })
      if (!response.ok) throw new Error("Failed to update note")
      const updatedNote = await response.json()
      setNotes(notes.map(n => n.id === id ? updatedNote : n))
      
      // Update folder notes if the note is in a folder
      if (updatedNote.folderId) {
        setFolders(folders.map(folder => {
          if (folder.id === updatedNote.folderId) {
            return {
              ...folder,
              notes: folder.notes?.map(n => n.id === id ? updatedNote : n) || []
            }
          }
          return folder
        }))
      }
      
      setSelectedNote(updatedNote)
      toast({
        title: "Success",
        description: "Note updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      })
    }
  }

  async function deleteNote(id: string) {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete note")
      
      const noteToDelete = notes.find(n => n.id === id)
      setNotes(notes.filter(n => n.id !== id))
      
      // Update folder notes if the note was in a folder
      if (noteToDelete?.folderId) {
        setFolders(folders.map(folder => {
          if (folder.id === noteToDelete.folderId) {
            return {
              ...folder,
              notes: folder.notes?.filter(n => n.id !== id) || []
            }
          }
          return folder
        }))
      }
      
      if (selectedNote?.id === id) setSelectedNote(null)
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-screen w-full">
      <header className="flex h-14 items-center border-b px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="mr-4"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <div className="ml-auto">
          <UserNav />
        </div>
      </header>
      <div className="grid h-[calc(100vh-3.5rem)] lg:grid-cols-[270px_1fr]">
        <Sidebar
          isOpen={isSidebarOpen}
          notes={notes}
          folders={folders}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onAddFolder={addFolder}
          onUpdateFolder={updateFolder}
          onDeleteFolder={deleteFolder}
        />
        {selectedNote ? (
          <Editor
            note={selectedNote}
            onUpdate={(title: string, content: string) => updateNote(selectedNote.id, title, content)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

