import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = Promise<{ id: string }>

// Get all responses for an event
export async function GET(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to this event (must be group member or owner)
    const event = await db.event.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            ownerId: true,
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: event.groupId,
          userId: session.user.id
        }
      }
    })

    if (!membership && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all responses for the event
    const responses = await db.availabilityResponse.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Error fetching event responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}

// Create or update user's response to an event
export async function POST(request: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Verify user has access to this event (must be group member or owner)
    const event = await db.event.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            ownerId: true,
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: event.groupId,
          userId: session.user.id
        }
      }
    })

    if (!membership && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, comment } = body

    // Validate status
    if (!status || !['AVAILABLE', 'UNAVAILABLE', 'MAYBE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be AVAILABLE, UNAVAILABLE, or MAYBE' },
        { status: 400 }
      )
    }

    // Create or update the response using upsert
    const response = await db.availabilityResponse.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId: session.user.id
        }
      },
      update: {
        status,
        comment: comment?.trim() || null,
        updatedAt: new Date()
      },
      create: {
        eventId: id,
        userId: session.user.id,
        status,
        comment: comment?.trim() || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
          }
        }
      }
    })

    return NextResponse.json({
      response,
      message: 'Response saved successfully'
    })
  } catch (error) {
    console.error('Error saving event response:', error)
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    )
  }
}
