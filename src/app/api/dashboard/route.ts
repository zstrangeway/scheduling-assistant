import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserStats } from '@/lib/database/users'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userStats = await getUserStats(session.user.id)

    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const totalGroups = userStats._count.ownedGroups + userStats._count.memberships
    
    // Get upcoming events (this will be enhanced in later phases)
    const upcomingEvents = 0
    const pendingInvites = 0

    return NextResponse.json({
      totalGroups,
      upcomingEvents,
      pendingInvites,
      createdEvents: userStats._count.createdEvents,
      responses: userStats._count.responses
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
