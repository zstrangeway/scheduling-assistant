import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { NextRequest } from 'next/server'
import { 
  getGroupById,
  getGroupWithDetails,
  getGroupForAdmin,
  updateGroup,
  deleteGroup 
} from '@/lib/database/groups'
import { getUserMembership } from '@/lib/database/memberships'
import { calculateResponseCount } from '@/lib/database/events'
import { validateUpdateGroupData } from '@/lib/database/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Check access first
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return ErrorResponses.groupNotFound()
    }

    // Get full group details
    const groupWithDetails = await getGroupWithDetails(id)

    if (!groupWithDetails) {
      return ErrorResponses.groupNotFound()
    }

    // Transform the data to include computed fields
    const transformedGroup = {
      ...groupWithDetails,
      isOwner: groupWithDetails.owner.id === session.user.id,
      isMember: groupWithDetails.members.some((m) => m.user.id === session.user.id),
      totalMembers: groupWithDetails._count.members + 1, // Owner + members
      currentUserMembership: groupWithDetails.members.find((m) => m.user.id === session.user.id),
      events: groupWithDetails.events.map((event) => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        responseCount: calculateResponseCount(event.responses),
        userResponse: event.responses.find((r) => r.userId === session.user.id) || null
      }))
    }

    return SuccessResponses.ok(transformedGroup)
  } catch (error) {
    console.error('Error fetching group:', error)
    return ErrorResponses.internalError('Failed to fetch group')
  }
}

export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const body = await req.json()
    
    // Validate the data
    const validatedData = validateUpdateGroupData(body)

    // Check permissions
    const existingGroup = await getGroupForAdmin(id, session.user.id)

    if (!existingGroup) {
      return ErrorResponses.insufficientPermissions()
    }

    const updatedGroup = await updateGroup(id, validatedData)

    return SuccessResponses.ok(updatedGroup)
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponses.validationError(error.message)
    }

    console.error('Error updating group:', error)
    return ErrorResponses.internalError('Failed to update group')
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const group = await getGroupById(id)

    if (!group) {
      return ErrorResponses.groupNotFound()
    }

    if (group.ownerId !== session.user.id) {
      return ErrorResponses.ownerCannotDelete()
    }

    await deleteGroup(id)

    return SuccessResponses.message('Group deleted successfully')
  } catch (error) {
    console.error('Error deleting group:', error)
    return ErrorResponses.internalError('Failed to delete group')
  }
}
