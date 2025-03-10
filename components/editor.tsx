"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

export default function Editor() {
  const [content, setContent] = useState("")
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

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
      console.log("Sending content for summarization:", content.substring(0, 50) + "...")

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize")
      }

      if (data.summary) {
        toast({
          title: "Summary created",
          description: "Your note has been summarized successfully.",
        })
        setContent(data.summary)
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
        <h1 className="text-xl md:text-2xl font-bold">YOUR NOTE</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="self-end sm:self-auto"
        >
          {mounted && (
            theme === "dark" ? 
              <SunIcon className="h-5 w-5" /> : 
              <MoonIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px] resize-none bg-background border rounded-lg p-3 md:p-4 mb-4 text-sm md:text-base"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <span className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
          {content.length} Characters
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

