import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = Promise<{ id: string }>

type ResponseWithUser = {
  id: string
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
  comment?: string | null
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
}

export async function GET(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const event = await db.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          }
        },
        responses: {
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
            createdAt: 'asc'
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

    // Verify user has access to this event (must be group member or owner)
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

    return NextResponse.json({
      event: {
        ...event,
        responseCount: {
          available: event.responses.filter((r: ResponseWithUser) => r.status === 'AVAILABLE').length,
          unavailable: event.responses.filter((r: ResponseWithUser) => r.status === 'UNAVAILABLE').length,
          maybe: event.responses.filter((r: ResponseWithUser) => r.status === 'MAYBE').length,
          total: event.responses.length
        }
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

    // Only event creator or group owner can edit the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, startTime, endTime } = body

    // Validate required fields
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Title, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startTime)
    const end = new Date(endTime)

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
    const updatedEvent = await db.event.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startTime: start,
        endTime: end,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        group: {
          select: {
            id: true,
            name: true,
          }
        }
      }
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

export async function DELETE(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

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

    // Only event creator or group owner can delete the event
    if (event.creatorId !== session.user.id && event.group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Delete the event (responses will be cascade deleted)
    await db.event.delete({
      where: { id }
    })

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
