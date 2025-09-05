import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { NextRequest } from 'next/server'
import { 
  getEventsForGroup, 
  createEvent, 
  calculateResponseCount 
} from '@/lib/database/events'
import { getGroupById } from '@/lib/database/groups'
import { getUserMembership } from '@/lib/database/memberships'
import { createEventSchema } from '@/lib/database/validations'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Params = Promise<{ id: string }>

// Get all events for a group
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Verify user has access to the group
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return ErrorResponses.insufficientPermissions()
    }

    // Get events for the group
    const events = await getEventsForGroup(id)

    return SuccessResponses.ok({
      events: events.map((event) => ({
        ...event,
        responseCount: calculateResponseCount(event.responses)
      }))
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return ErrorResponses.internalError('Failed to fetch events')
  }
}

export async function POST(request: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Verify user has access to the group
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return ErrorResponses.insufficientPermissions()
    }

    const body = await request.json()
    const result = createEventSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
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

    return SuccessResponses.ok(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return ErrorResponses.internalError()
  }
}
