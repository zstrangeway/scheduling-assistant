import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userStats = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
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

    const totalGroups = (userStats?._count.ownedGroups || 0) + (userStats?._count.memberships || 0)
    
    // Get upcoming events (this will be enhanced in later phases)
    const upcomingEvents = 0
    const pendingInvites = 0

    return Response.json({
      totalGroups,
      upcomingEvents,
      pendingInvites,
      createdEvents: userStats?._count.createdEvents || 0,
      responses: userStats?._count.responses || 0
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
