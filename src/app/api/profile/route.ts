import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserWithStats, updateUser } from "@/lib/database/users"
import { updateProfileSchema } from "@/lib/database/validations"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await getUserWithStats(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.message },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(session.user.id, result.data)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
