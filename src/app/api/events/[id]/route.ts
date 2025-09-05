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
import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'

type Params = Promise<{ id: string }>

export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const event = await getEventById(id)

    if (!event) {
      return ErrorResponses.notFound()
    }

    // Verify user has access to this event (must be group member or owner)
    const membership = await getUserMembership(event.groupId, session.user.id)

    if (!membership && event.group.ownerId !== session.user.id) {
      return ErrorResponses.forbidden()
    }

    return NextResponse.json({
      event: {
        ...event,
        responseCount: calculateResponseCount(event.responses)
      }
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    return ErrorResponses.internalError()
  }
}

export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const event = await getEventById(id)

    if (!event) {
      return ErrorResponses.notFound()
    }

    // Only event creator or group owner can edit the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return ErrorResponses.forbidden()
    }

    const body = await req.json()
    const result = updateEventSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
    }

    const { title, description, startTime, endTime } = result.data

    if (!title || !description || !startTime || !endTime) {
      return ErrorResponses.validationError('All fields are required')
    }

    // Convert string dates to Date objects and validate
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return ErrorResponses.validationError('Invalid date format')
    }

    if (start >= end) {
      return ErrorResponses.validationError('End time must be after start time')
    }

    // Update the event
    const updatedEvent = await updateEvent(id, {
      title,
      description,
      startTime: start,
      endTime: end,
    })

    return SuccessResponses.ok({
      event: updatedEvent,
      message: 'Event updated successfully'
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return ErrorResponses.internalError()
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const event = await getEventById(id)

    if (!event) {
      return ErrorResponses.notFound()
    }

    // Only event creator or group owner can delete the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return ErrorResponses.forbidden()
    }

    // Delete the event (responses will be cascade deleted)
    await deleteEvent(id)

    return SuccessResponses.ok({
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return ErrorResponses.internalError()
  }
}
