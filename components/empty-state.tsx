import { FileText } from "lucide-react"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Select a note to view</h2>
      <p className="text-muted-foreground max-w-md">
        Choose a note from the list on the left to view its contents, or create a new note to add to your collection.
      </p>
    </div>
  )
}

