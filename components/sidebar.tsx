"use client"

import { useState, useEffect } from "react"
import type { Note, Folder } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  X,
  Search,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  isOpen: boolean
  folders: Folder[]
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onAddFolder: (name: string) => Promise<void>
  onUpdateFolder: (id: string, name: string) => Promise<void>
  onDeleteFolder: (id: string) => Promise<void>
  onAddNote: (title: string, folderId?: string) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
}

export default function Sidebar({
  isOpen,
  folders,
  notes,
  selectedNote,
  onSelectNote,
  onAddFolder,
  onUpdateFolder,
  onDeleteFolder,
  onAddNote,
  onDeleteNote,
}: SidebarProps) {
  const [isAddingFolder, setIsAddingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")

  // Initialize expanded state for folders
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {}
    folders.forEach((folder) => {
      initialExpandedState[folder.id] = !!(selectedNote?.folderId && selectedNote.folderId === folder.id)
    })
    setExpandedFolders(initialExpandedState)
  }, [folders, selectedNote]) // Added missing dependencies

  // Toggle folder expanded state
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  // Handle add folder
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await onAddFolder(newFolderName)
      setNewFolderName("")
      setIsAddingFolder(false)
      toast({
        title: "Success",
        description: "Folder created successfully",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error creating folder:", err)
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      })
    }
  }

  // Handle update folder
  const handleUpdateFolder = async (id: string) => {
    if (!editingFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }

    try {
      await onUpdateFolder(id, editingFolderName)
      setEditingFolderId(null)
      setEditingFolderName("")
      toast({
        title: "Success",
        description: "Folder updated successfully",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error updating folder:", err)
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      })
    }
  }

  // Handle delete folder
  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder? Notes will be moved to Unfiled Notes.")) {
      return
    }

    try {
      await onDeleteFolder(id)
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error deleting folder:", err)
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      })
    }
  }

  // Handle add note
  const handleAddNote = async (folderId?: string) => {
    try {
      await onAddNote("New Note", folderId)

      // Expand the folder if a note is added to it
      if (folderId) {
        setExpandedFolders((prev) => ({
          ...prev,
          [folderId]: true,
        }))
      }

      toast({
        title: "Success",
        description: "Note created successfully",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error creating note:", err)
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      })
    }
  }

  // Handle delete note
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return
    }

    try {
      await onDeleteNote(id)
      toast({
        title: "Success",
        description: "Note deleted successfully",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error deleting note:", err)
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      })
    }
  }

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // Filter folders based on search query
  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      folder.notes?.some((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (!isOpen) return null

  return (
    <div className="w-[270px] border-r bg-background flex flex-col h-full">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <div className="ml-auto flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsAddingFolder(true)}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new folder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isAddingFolder && (
            <div className="flex gap-2 mb-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFolder()
                  if (e.key === "Escape") {
                    setIsAddingFolder(false)
                    setNewFolderName("")
                  }
                }}
              />
              <Button size="sm" onClick={handleAddFolder}>
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsAddingFolder(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {filteredFolders.length > 0 ? (
            filteredFolders.map((folder) => (
              <div key={folder.id} className="mb-2">
                <div className="group flex items-center">
                  {editingFolderId === folder.id ? (
                    <div className="flex flex-1 items-center">
                      <Input
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateFolder(folder.id)
                          if (e.key === "Escape") {
                            setEditingFolderId(null)
                            setEditingFolderName("")
                          }
                        }}
                        autoFocus
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFolderId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFolder(folder.id)}>
                        {expandedFolders[folder.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start gap-2 px-2"
                        onClick={() => toggleFolder(folder.id)}
                      >
                        <FolderIcon className="h-4 w-4" />
                        <span className="truncate">{folder.name}</span>
                        {folder.notes && folder.notes.length > 0 && (
                          <Badge variant="outline" className="ml-auto">
                            {folder.notes.length}
                          </Badge>
                        )}
                      </Button>
                      <div className="flex opacity-0 group-hover:opacity-100">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingFolderId(folder.id)
                                  setEditingFolderName(folder.name)
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Rename folder</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteFolder(folder.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete folder</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </>
                  )}
                </div>

                {expandedFolders[folder.id] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {folder.notes
                      ?.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((note) => (
                        <div key={note.id} className="group flex items-center">
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start gap-2 px-2 py-1 h-auto",
                              selectedNote?.id === note.id && "bg-accent",
                            )}
                            onClick={() => onSelectNote(note)}
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{note.title}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 px-2 text-muted-foreground"
                      onClick={() => handleAddNote(folder.id)}
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add Note</span>
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : searchQuery ? (
            <div className="py-4 text-center text-muted-foreground">No folders match your search</div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">No folders yet. Create one to get started.</div>
          )}

          <div className="mt-4">
            <div className="px-2 pb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Unfiled Notes</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleAddNote()}>
                <PlusIcon className="h-3 w-3" />
              </Button>
            </div>

            {filteredNotes
              .filter((note) => !note.folderId)
              .map((note) => (
                <div key={note.id} className="group flex items-center">
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex-1 justify-start gap-2 px-2 py-1 h-auto",
                      selectedNote?.id === note.id && "bg-accent",
                    )}
                    onClick={() => onSelectNote(note)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}

            {filteredNotes.filter((note) => !note.folderId).length === 0 && (
              <div className="px-2 py-1 text-sm text-muted-foreground">No unfiled notes</div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="p-2 border-t text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Total notes: {notes.length}</span>
          <span>Folders: {folders.length}</span>
        </div>
      </div>
    </div>
  )
}

