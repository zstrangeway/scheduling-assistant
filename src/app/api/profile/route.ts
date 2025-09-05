import { ErrorResponses, SuccessResponses } from "@/lib/api/responses"
import { getUserWithStats, updateUser } from "@/lib/database/users"
import { updateProfileSchema } from "@/lib/database/validations"
import { NextRequest } from "next/server"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const userProfile = await getUserWithStats(session.user.id)

    if (!userProfile) {
      return ErrorResponses.userNotFound()
    }

    return SuccessResponses.ok(userProfile)
  } catch (error) {
    console.error("Failed to fetch user profile:", error)
    return ErrorResponses.internalError()
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const body = await req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
    }

    const updatedUser = await updateUser(session.user.id, result.data)
    return SuccessResponses.ok(updatedUser)
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return ErrorResponses.internalError()
  }
}
