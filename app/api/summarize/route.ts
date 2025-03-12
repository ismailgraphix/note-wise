import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { authOptions } from "../auth/[...nextauth]/auth.config"

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const { content } = await request.json()

    // Validate the content
    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        {
          error: "Please provide text to summarize.",
        },
        { status: 400 },
      )
    }

    // Extract text from HTML content
    const textContent = content.replace(/<[^>]*>/g, " ").trim()

    if (textContent.length < 50) {
      return NextResponse.json(
        {
          error: "Content is too short to summarize. Please provide more text.",
        },
        { status: 400 },
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key is not configured.",
        },
        { status: 500 },
      )
    }

    // Generate summary using OpenAI
    const { text: summary } = await generateText({
      model: openai("gpt-3.5-turbo"),
      prompt: `Summarize the following text concisely:\n\n${textContent}`,
      system:
        "You are a helpful assistant that summarizes text concisely. Create a clear, brief summary that captures the main points.",
      maxTokens: 500,
    })

    // Format the summary as HTML paragraph
    const formattedSummary = `<p>${summary}</p>`

    // Return the summary
    return NextResponse.json({ summary: formattedSummary })
  } catch (error) {
    console.error("Error in summarize API:", error)
    return NextResponse.json({ error: "Failed to summarize content. Please try again." }, { status: 500 })
  }
}

