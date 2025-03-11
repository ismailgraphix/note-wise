import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error("Signup error:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 