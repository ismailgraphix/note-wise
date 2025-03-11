"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Folder as FolderIcon, FileText, Trash2, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Note } from "@/types/note"
import type { Folder } from "@/app/page"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  notes: Note[]
  folders: Folder[]
  selectedNote: Note | null
  onSelectNote: (note: Note | null) => void
  onAddNote: (note: Note) => void
  onDeleteNote: (id: string) => void
  onAddFolder: (folder: Folder) => void
  onUpdateFolder: (folder: Folder) => void
  onDeleteFolder: (id: string) => void
}

export default function Sidebar({ 
  notes,
  folders,
  selectedNote,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder
}: SidebarProps) {
  const { toast } = useToast()
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState("")

  const addNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: `New Note ${notes.length + 1}`,
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    onAddNote(newNote)
    toast({
      title: "Note created",
      description: "New note has been created successfully."
    })
  }

  const deleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteNote(noteId)
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully.",
      variant: "destructive"
    })
  }

  const addNewFolder = () => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: `New Folder ${folders.length + 1}`
    }
    onAddFolder(newFolder)
    toast({
      title: "Folder created",
      description: "New folder has been created successfully."
    })
  }

  const startEditingFolder = (folder: Folder) => {
    setEditingFolderId(folder.id)
    setEditingFolderName(folder.name)
  }

  const saveFolder = (folderId: string) => {
    if (editingFolderName.trim()) {
      onUpdateFolder({ id: folderId, name: editingFolderName.trim() })
      setEditingFolderId(null)
      toast({
        title: "Folder updated",
        description: "Folder name has been updated successfully."
      })
    }
  }

  const deleteFolder = (folderId: string) => {
    onDeleteFolder(folderId)
    toast({
      title: "Folder deleted",
      description: "The folder has been deleted successfully.",
      variant: "destructive"
    })
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

      {notes.length > 0 && (
        <div className="p-4">
          <h2 className="text-sm font-medium mb-2">Recent</h2>
          {notes.map((note) => (
            <div key={note.id} className="group relative">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 mb-1",
                  selectedNote?.id === note.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => onSelectNote(note)}
              >
                <FileText size={16} />
                <span className="truncate">{note.title}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => deleteNote(note.id, e)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <h2 className="text-sm font-medium mb-2">Folders</h2>
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            {editingFolderId === folder.id ? (
              <div className="flex items-center gap-1 mb-1">
                <Input
                  value={editingFolderName}
                  onChange={(e) => setEditingFolderName(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => saveFolder(folder.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingFolderId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center mb-1">
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-2"
                >
                  <FolderIcon size={16} />
                  {folder.name}
                </Button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => startEditingFolder(folder)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteFolder(folder.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        <Button variant="outline" className="w-full justify-start gap-2 mt-2" onClick={addNewFolder}>
          <PlusCircle size={16} />
          New Folder
        </Button>
      </div>
    </div>
  )
}
