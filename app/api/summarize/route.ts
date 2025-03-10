import { NextResponse } from "next/server"

// Mock AI summarization function for testing
function mockSummarize(text: string): string {
  // This is a simple mock that returns a shortened version of the text
  if (!text || text.trim() === "") {
    return "No content to summarize"
  }

  // Split text into sentences and take the first few
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const summaryLength = Math.max(1, Math.min(3, Math.ceil(sentences.length / 3)))
  const summary = sentences.slice(0, summaryLength).join(". ")

  return summary + (summary.endsWith(".") ? "" : ".")
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json()
    const { content } = body

    console.log("Received content for summarization:", content?.substring(0, 50) + "...")

    // Validate the content
    if (!content || typeof content !== "string" || content.trim() === "") {
      console.log("Invalid content received")
      return NextResponse.json(
        {
          error: "Invalid content. Please provide text to summarize.",
        },
        { status: 400 },
      )
    }

    // Generate summary (mock for now)
    console.log("Generating summary...")
    const summary = mockSummarize(content)
    console.log("Summary generated:", summary)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return the summary
    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error in summarize API:", error)
    return NextResponse.json({ error: "Failed to summarize content. Please try again." }, { status: 500 })
  }
}

