import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const groupId = params.id

    // Verify user is a member of the group
    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    })

    const group = await db.group.findUnique({
      where: { id: groupId }
    })

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    // Get events for the group
    const events = await db.event.findMany({
      where: { groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({
      events: events.map(event => ({
        ...event,
        responseCount: {
          available: event.responses.filter(r => r.status === 'AVAILABLE').length,
          unavailable: event.responses.filter(r => r.status === 'UNAVAILABLE').length,
          maybe: event.responses.filter(r => r.status === 'MAYBE').length,
          total: event.responses.length
        }
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

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const groupId = params.id

    // Verify user is a member of the group
    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id
        }
      }
    })

    const group = await db.group.findUnique({
      where: { id: groupId }
    })

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Group not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
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

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Start time cannot be in the past' },
        { status: 400 }
      )
    }

    // Create the event
    const event = await db.event.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        groupId,
        creatorId: session.user.id,
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
      event,
      message: 'Event created successfully'
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}