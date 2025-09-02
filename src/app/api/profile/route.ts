import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedGroups: true,
            memberships: true,
            createdEvents: true,
            responses: true,
          }
        }
      }
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response("Name is required", { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}