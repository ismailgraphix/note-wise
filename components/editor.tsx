"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MoonIcon, SunIcon, Save } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
}

interface EditorProps {
  note: Note
  onUpdate: (title: string, content: string) => void
}

export default function Editor({ note, onUpdate }: EditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await onUpdate(title, content)
    setIsSaving(false)
  }

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty content",
        description: "Please write something before summarizing.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize")
      }

      if (data.summary) {
        setContent(data.summary)
        handleSave()
        toast({
          title: "Summary created",
          description: "Your note has been summarized successfully.",
        })
      } else {
        throw new Error("No summary returned from API")
      }
    } catch (error) {
      console.error("Error during summarization:", error)
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 md:mb-6">
        <div className="flex-1 w-full">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl md:text-2xl font-bold bg-transparent border-0 p-0 focus-visible:ring-0"
            placeholder="Note title..."
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && (
              theme === "dark" ? 
                <SunIcon className="h-5 w-5" /> : 
                <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px] resize-none bg-background border rounded-lg p-3 md:p-4 mb-4 text-sm md:text-base"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <span className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
          Last updated: {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        <Button 
          onClick={handleSummarize} 
          disabled={isLoading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {isLoading ? "Summarizing..." : "Summarize"}
        </Button>
      </div>
    </div>
  )
}

