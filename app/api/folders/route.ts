import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "../auth/[...nextauth]/auth.config"

// Create a single Prisma instance to be reused across requests
const prisma = new PrismaClient()

/**
 * GET: Fetch all folders for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      include: {
        notes: {
          orderBy: { updatedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error("Error fetching folders:", error)
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 })
  }
}

/**
 * POST: Create a new folder
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        userId: session.user.id,
      },
      include: { notes: true },
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error("Error creating folder:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}

/**
 * PUT: Update an existing folder
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name } = await request.json()

    if (!id || !name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Folder ID and name are required" }, { status: 400 })
    }

    // Verify ownership
    const folder = await prisma.folder.findUnique({
      where: { id },
    })

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 })
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: { name: name.trim() },
      include: { notes: true },
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error("Error updating folder:", error)
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 })
  }
}

/**
 * DELETE: Remove a folder
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
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 })
    }

    // Verify ownership
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: { notes: true },
    })

    if (!folder || folder.userId !== session.user.id) {
      return NextResponse.json({ error: "Folder not found or unauthorized" }, { status: 404 })
    }

    // First update all notes in this folder to have no folder
    if (folder.notes.length > 0) {
      await prisma.note.updateMany({
        where: { folderId: id },
        data: { folderId: null },
      })
    }

    // Then delete the folder
    await prisma.folder.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Folder deleted successfully",
      notesUpdated: folder.notes.length,
    })
  } catch (error) {
    console.error("Error deleting folder:", error)
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
  }
}

