import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { getUserStats } from '@/lib/database/users'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }
    
    const userStats = await getUserStats(session.user.id)

    if (!userStats) {
      return ErrorResponses.userNotFound()
    }

    const totalGroups = userStats._count.ownedGroups + userStats._count.memberships
    
    // Get upcoming events (this will be enhanced in later phases)
    const upcomingEvents = 0
    const pendingInvites = 0

    return SuccessResponses.ok({
      totalGroups,
      upcomingEvents,
      pendingInvites,
      createdEvents: userStats._count.createdEvents,
      responses: userStats._count.responses
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return ErrorResponses.internalError()
  }
}
