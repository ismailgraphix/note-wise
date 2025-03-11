"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  FolderPlus,
  Plus,
  Trash,
  X,
} from "lucide-react"
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

interface SidebarProps {
  isOpen: boolean
  notes: Note[]
  folders: Folder[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onAddNote: (title: string, content: string, folderId: string | null) => void
  onDeleteNote: (id: string) => void
  onAddFolder: (name: string) => void
  onUpdateFolder: (id: string, name: string) => void
  onDeleteFolder: (id: string) => void
}

export default function Sidebar({
  isOpen,
  notes,
  folders,
  selectedNote,
  onSelectNote,
  onAddNote,
  onDeleteNote,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
}: SidebarProps) {
  const { toast } = useToast()
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleAddNote = (folderId: string | null = null) => {
    const title = "Untitled Note"
    const content = ""
    onAddNote(title, content, folderId)
  }

  const handleAddFolder = () => {
    const name = "New Folder"
    onAddFolder(name)
  }

  const handleUpdateFolder = (id: string, name: string) => {
    if (name.trim()) {
      onUpdateFolder(id, name.trim())
      setEditingFolderId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="w-[270px] border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Notes</h2>
        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAddNote(null)}
            title="Add note"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddFolder}
            title="Add folder"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="p-2">
          {/* Folders */}
          {folders.map((folder) => (
            <div key={folder.id} className="mb-2">
              <div className="group flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => toggleFolder(folder.id)}
                >
                  {expandedFolders.has(folder.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                {editingFolderId === folder.id ? (
                  <div className="flex flex-1 items-center">
                    <Input
                      defaultValue={folder.name}
                      className="h-8"
                      onBlur={(e) => handleUpdateFolder(folder.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateFolder(folder.id, e.currentTarget.value)
                        } else if (e.key === "Escape") {
                          setEditingFolderId(null)
                        }
                      }}
                      autoFocus
                    />
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
                  <>
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start gap-2 px-2"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{folder.name}</span>
                    </Button>
                    <div className="flex opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingFolderId(folder.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDeleteFolder(folder.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              {expandedFolders.has(folder.id) && (
                <div className="ml-4 mt-1">
                  {folder.notes?.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-center"
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex-1 justify-start gap-2 px-2",
                          selectedNote?.id === note.id && "bg-accent"
                        )}
                        onClick={() => onSelectNote(note)}
                      >
                        <File className="h-4 w-4" />
                        <span className="truncate">{note.title}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => onDeleteNote(note.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    className="mt-1 w-full justify-start gap-2 px-2"
                    onClick={() => handleAddNote(folder.id)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Note</span>
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Notes without folders */}
          <div className="mt-4">
            <div className="px-2 pb-2 text-sm font-medium text-muted-foreground">
              Unfiled Notes
            </div>
            {notes
              .filter((note) => !note.folderId)
              .map((note) => (
                <div key={note.id} className="group flex items-center">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 justify-start gap-2 px-2",
                      selectedNote?.id === note.id && "bg-accent"
                    )}
                    onClick={() => onSelectNote(note)}
                  >
                    <File className="h-4 w-4" />
                    <span className="truncate">{note.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => onDeleteNote(note.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
