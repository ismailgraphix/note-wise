import { FileText } from "lucide-react"

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-6">
      <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-3 md:mb-4">
        <FileText className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg md:text-xl font-semibold mb-2">No note selected</h2>
      <p className="text-sm md:text-base text-muted-foreground max-w-[280px] md:max-w-md">
        Create a new note using the "New Note" button or select an existing note from the sidebar to get started.
      </p>
    </div>
  )
}

