import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function validateUpdateGroupData(data: Record<string, unknown>) {
  const updates: Record<string, unknown> = {}
  
  if (data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Group name is required')
    }
    if (data.name.length > 100) {
      throw new Error('Group name must be less than 100 characters')
    }
    updates.name = data.name.trim()
  }
  
  if (data.description !== undefined) {
    if (data.description && typeof data.description === 'string' && data.description.length > 500) {
      throw new Error('Description must be less than 500 characters')
    }
    updates.description = typeof data.description === 'string' ? data.description.trim() || null : null
  }
  
  return updates
}

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

    const group = await db.group.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          { 
            members: { 
              some: { userId: session.user.id } 
            } 
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        members: {
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
            joinedAt: 'asc'
          }
        },
        events: {
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
        },
        invites: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true,
            expiresAt: true,
            sender: {
              select: {
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            members: true,
            events: true,
            invites: true,
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Transform the data to include computed fields
    const transformedGroup = {
      ...group,
      isOwner: group.owner.id === session.user.id,
      isMember: group.members.some(m => m.user.id === session.user.id),
      totalMembers: group._count.members + 1, // Owner + members
      currentUserMembership: group.members.find(m => m.user.id === session.user.id),
      events: group.events.map(event => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        responseCount: {
          available: event.responses.filter(r => r.status === 'AVAILABLE').length,
          unavailable: event.responses.filter(r => r.status === 'UNAVAILABLE').length,
          maybe: event.responses.filter(r => r.status === 'MAYBE').length,
          total: event.responses.length
        }
      }))
    }

    return NextResponse.json(transformedGroup)
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const validatedData = validateUpdateGroupData(body)

    const existingGroup = await db.group.findFirst({
      where: {
        id: params.id,
        OR: [
          { ownerId: session.user.id },
          { 
            members: { 
              some: { 
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] }
              } 
            } 
          }
        ]
      }
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found or insufficient permissions' },
        { status: 404 }
      )
    }

    const updatedGroup = await db.group.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        },
        _count: {
          select: {
            members: true,
            events: true,
          }
        }
      }
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const group = await db.group.findUnique({
      where: { id: params.id },
      select: { ownerId: true }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    if (group.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the group owner can delete the group' },
        { status: 403 }
      )
    }

    await db.group.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}