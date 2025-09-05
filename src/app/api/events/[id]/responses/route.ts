import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  getEventById, 
  getEventResponses, 
  upsertEventResponse 
} from '@/lib/database/events'
import { getUserMembership } from '@/lib/database/memberships'
import { eventResponseSchema } from '@/lib/database/validations'
import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'

type Params = Promise<{ id: string }>

// Get all responses for an event
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Verify user has access to this event (must be group member or owner)
    const event = await getEventById(id)

    if (!event) {
      return ErrorResponses.notFound()
    }

    const membership = await getUserMembership(event.groupId, session.user.id)

    if (!membership && event.group.ownerId !== session.user.id) {
      return ErrorResponses.forbidden()
    }

    // Get all responses for the event
    const responses = await getEventResponses(id)

    return SuccessResponses.ok({ responses })
  } catch (error) {
    console.error('Error fetching event responses:', error)
    return ErrorResponses.internalError()
  }
}

// Create or update user's response to an event
export async function POST(request: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Verify user has access to this event (must be group member or owner)
    const event = await getEventById(id)

    if (!event) {
      return ErrorResponses.notFound()
    }

    const membership = await getUserMembership(event.groupId, session.user.id)

    if (!membership && event.group.ownerId !== session.user.id) {
      return ErrorResponses.forbidden()
    }

    const body = await request.json()
    const result = eventResponseSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
    }

    const { status, comment } = result.data

    // Create or update the response using upsert
    const response = await upsertEventResponse(id, session.user.id, {
      status,
      comment
    })

    return SuccessResponses.ok({
      response,
      message: 'Response saved successfully'
    })
  } catch (error) {
    console.error('Error saving event response:', error)
    return ErrorResponses.internalError()
  }
}
