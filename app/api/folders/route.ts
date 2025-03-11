import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    include: {
      notes: true
    }
  })
  
  return Response.json(folders)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { name } = await req.json()
  
  if (!name) {
    return new NextResponse("Name is required", { status: 400 })
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      userId: session.user.id
    },
    include: {
      notes: true
    }
  })
  
  return Response.json(folder)
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { id, name } = await req.json()
  
  if (!id || !name) {
    return new NextResponse("ID and name are required", { status: 400 })
  }

  const folder = await prisma.folder.update({
    where: { 
      id,
      userId: session.user.id
    },
    data: { name },
    include: {
      notes: true
    }
  })
  
  return Response.json(folder)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return new NextResponse("ID is required", { status: 400 })
  }

  // First, delete all notes in the folder
  await prisma.note.deleteMany({
    where: {
      folderId: id,
      userId: session.user.id
    }
  })

  // Then delete the folder
  await prisma.folder.delete({
    where: { 
      id,
      userId: session.user.id
    }
  })
  
  return new Response(null, { status: 204 })
} 