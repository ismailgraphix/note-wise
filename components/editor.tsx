"use client"

import { useState, useEffect} from "react"
import type { Note } from "@/types"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoonIcon, SunIcon, Save, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

interface EditorProps {
  note: Note
  onUpdate: (content: string) => void
  onUpdateTitle?: (title: string) => void
}

export default function Editor({ note, onUpdate, onUpdateTitle }: EditorProps) {
  const [title, setTitle] = useState(note.title)
  const [isSaving, setIsSaving] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Create editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your note here...",
      }),
    ],
    content: note.content || "<p></p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] p-4",
      },
    },
  })

  // Update content when editor changes
  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const html = editor.getHTML()
      onUpdate(html)
    }

    editor.on("update", handleUpdate)

    return () => {
      editor.off("update", handleUpdate)
    }
  }, [editor, onUpdate])

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content || "<p></p>")
    }
    setTitle(note.title)
  }, [note, editor])

  // Set mounted state for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (onUpdateTitle) {
      onUpdateTitle(newTitle)
    }
  }

  // Handle manual save
  const handleSave = async () => {
    if (!editor) return

    setIsSaving(true)
    try {
      await onUpdate(editor.getHTML())
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      })
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error saving:", err)
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle summarize
  const handleSummarize = async () => {
    if (!editor || editor.isEmpty) {
      toast({
        title: "Empty content",
        description: "Please write something before summarizing.",
        variant: "destructive",
      })
      return
    }

    setIsSummarizing(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editor.getHTML() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize")
      }

      if (data.summary) {
        editor.commands.setContent(data.summary)
        onUpdate(data.summary)
        toast({
          title: "Summary created",
          description: "Your note has been summarized successfully.",
        })
      }
    } catch (err) {
      // Using err instead of error to avoid the unused variable warning
      console.error("Error during summarization:", err)
      toast({
        title: "Summarization failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  // Get word count
  const getWordCount = () => {
    if (!editor) return 0
    const text = editor.getText()
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-xl md:text-2xl font-bold bg-transparent border-0 p-0 focus-visible:ring-0"
            placeholder="Note title..."
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </>
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {mounted && (theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />)}
            </Button>
          </div>
        </div>

        <div className="border rounded-lg bg-background overflow-hidden">
          {editor && (
            <EditorContent editor={editor} className="min-h-[400px] focus-within:ring-1 focus-within:ring-primary" />
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground flex gap-4">
            <span>{getWordCount()} words</span>
            <span>Last updated: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
          <Button onClick={handleSummarize} disabled={isSummarizing}>
            {isSummarizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Summarizing...
              </>
            ) : (
              "Summarize"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

