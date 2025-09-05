import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { getGroupById } from '@/lib/database/groups'
import { getUserMembership, removeMembership } from '@/lib/database/memberships'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Params = Promise<{ id: string }>

export async function DELETE(_req: Request, ctx: { params: Params }) {
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

    if (group.ownerId === session.user.id) {
      return ErrorResponses.cannotLeaveAsOwner()
    }

    const membership = await getUserMembership(id, session.user.id)

    if (!membership) {
      return ErrorResponses.notAMember()
    }

    await removeMembership(id, session.user.id)
    return SuccessResponses.message('Left group successfully')
  } catch (error) {
    console.error('Error leaving group:', error)
    return ErrorResponses.internalError('Failed to leave group')
  }
}
