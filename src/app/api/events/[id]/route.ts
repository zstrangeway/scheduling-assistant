import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  getEventById,
  updateEvent, 
  deleteEvent, 
  calculateResponseCount 
} from '@/lib/database/events'
import { getUserMembership } from '@/lib/database/memberships'
import { updateEventSchema } from '@/lib/database/validations'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const event = await getEventById(id)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this event (must be group member or owner)
    const membership = await getUserMembership(event.groupId, session.user.id)

    if (!membership && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      event: {
        ...event,
        responseCount: calculateResponseCount(event.responses)
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const event = await getEventById(id)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Only event creator or group owner can edit the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const result = updateEventSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.message },
        { status: 400 }
      )
    }

    const { title, description, startTime, endTime } = result.data

    // Convert string dates to Date objects and validate
    const start = new Date(startTime!)
    const end = new Date(endTime!)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Update the event
    const updatedEvent = await updateEvent(id, {
      title,
      description,
      startTime: start,
      endTime: end,
    })

    return NextResponse.json({
      event: updatedEvent,
      message: 'Event updated successfully'
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const event = await getEventById(id)

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Only event creator or group owner can delete the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete the event (responses will be cascade deleted)
    await deleteEvent(id)

    return NextResponse.json({
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
