// Example API route for notes
// app/api/notes/route.ts
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    include: {
      folder: true
    }
  })
  
  return Response.json(notes)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { title, content, folderId } = await req.json()
  
  // Allow empty content when creating a new note
  if (!title) {
    return new NextResponse("Title is required", { status: 400 })
  }

  // Verify folder exists if folderId is provided
  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        userId: session.user.id
      }
    })
    
    if (!folder) {
      return new NextResponse("Invalid folder", { status: 400 })
    }
  }

  const note = await prisma.note.create({
    data: {
      title,
      content: content || "", // Ensure content is never null
      userId: session.user.id,
      folderId: folderId || null
    },
    include: {
      folder: true
    }
  })
  
  return Response.json(note)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { id, title, content, folderId } = await req.json()
  
  if (!id || !title) {
    return new NextResponse("ID and title are required", { status: 400 })
  }

  // Verify folder exists if folderId is provided
  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: {
        id: folderId,
        userId: session.user.id
      }
    })
    
    if (!folder) {
      return new NextResponse("Invalid folder", { status: 400 })
    }
  }

  const note = await prisma.note.update({
    where: { 
      id,
      userId: session.user.id
    },
    data: { 
      title,
      content: content || "", // Ensure content is never null
      folderId: folderId || null
    },
    include: {
      folder: true
    }
  })
  
  return Response.json(note)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return new NextResponse("ID is required", { status: 400 })
  }

  await prisma.note.delete({
    where: { 
      id,
      userId: session.user.id
    }
  })
  
  return new Response(null, { status: 204 })
}