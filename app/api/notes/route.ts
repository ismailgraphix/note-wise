import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../auth/[...nextauth]/auth.config"

// Create a single Prisma instance to be reused across requests
const prisma = new PrismaClient()

/**
 * GET: Fetch all notes for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")

    const where = {
      userId: session.user.id,
      ...(folderId ? { folderId } : {}),
    }

    const notes = await prisma.note.findMany({
      where,
      include: { folder: true },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

/**
 * POST: Create a new note
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, folderId } = await request.json()

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // If folderId is provided, verify it exists and belongs to the user
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      })

      if (!folder || folder.userId !== session.user.id) {
        return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 })
      }
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content || "",
        userId: session.user.id,
        folderId: folderId || null,
      },
      include: { folder: true },
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

/**
 * PUT: Update an existing note
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, title, content, folderId } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    // Verify ownership
    const note = await prisma.note.findUnique({
      where: { id },
    })

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 })
    }

    // If folderId is provided, verify it exists and belongs to the user
    if (folderId && folderId !== note.folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      })

      if (!folder || folder.userId !== session.user.id) {
        return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 })
      }
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : note.title,
        content: content !== undefined ? content : note.content,
        folderId: folderId !== undefined ? folderId : note.folderId,
        updatedAt: new Date(), // Force update timestamp
      },
      include: { folder: true },
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

/**
 * DELETE: Remove a note
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    // Verify ownership
    const note = await prisma.note.findUnique({
      where: { id },
    })

    if (!note || note.userId !== session.user.id) {
      return NextResponse.json({ error: "Note not found or unauthorized" }, { status: 404 })
    }

    await prisma.note.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Note deleted successfully" })
  } catch (error) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}

