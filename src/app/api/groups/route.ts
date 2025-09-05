import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { NextRequest } from 'next/server'
import { 
  createGroup, 
  getGroupsForUser 
} from '@/lib/database/groups'
import { createGroupSchema } from '@/lib/database/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }
    
    const body = await req.json()
    const result = createGroupSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
    }

    const group = await createGroup(session.user.id, result.data)
    return SuccessResponses.created(group)
  } catch (error) {
    console.error('Error creating group:', error)
    return ErrorResponses.internalError('Failed to create group') 
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const groups = await getGroupsForUser(session.user.id)
    return SuccessResponses.ok(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return ErrorResponses.internalError('Failed to fetch groups')
  }
}
