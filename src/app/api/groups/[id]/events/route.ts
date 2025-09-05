import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  getEventsForGroup, 
  createEvent, 
  calculateResponseCount 
} from '@/lib/database/events'
import { getGroupById } from '@/lib/database/groups'
import { getUserMembership } from '@/lib/database/memberships'
import { createEventSchema } from '@/lib/database/validations'

type Params = Promise<{ id: string }>

type EventWithRelations = {
  id: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  groupId: string
  creatorId: string
  createdAt: Date
  updatedAt: Date
  creator: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  responses: Array<{
    id: string
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
    comment: string | null
    eventId: string
    userId: string
    createdAt: Date
    updatedAt: Date
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }>
}

// Get all events for a group
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to the group
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    // Get events for the group
    const events = await getEventsForGroup(id)

    return NextResponse.json({
      events: events.map((event) => ({
        ...event,
        responseCount: calculateResponseCount(event.responses)
      }))
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to the group
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = createEventSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.message },
        { status: 400 }
      )
    }

    const { title, description, startTime, endTime } = result.data

    // Convert string dates to Date objects
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Create the event
    const event = await createEvent({
      title,
      description,
      startTime: start,
      endTime: end,
      groupId: id,
      creatorId: session.user.id
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
