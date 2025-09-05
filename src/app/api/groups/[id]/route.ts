import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  getGroupById,
  getGroupWithDetails,
  getGroupForAdmin,
  updateGroup,
  deleteGroup 
} from '@/lib/database/groups'
import { getUserMembership } from '@/lib/database/memberships'
import { calculateResponseCount } from '@/lib/database/events'
import { validateUpdateGroupData } from '@/lib/database/validations'

type Params = Promise<{ id: string }>

type GroupMember = {
  id: string
  userId: string
  groupId: string
  role: string
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

type GroupWithRelations = {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  members: GroupMember[]
  events: Array<{
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
  }>
  invites: Array<{
    id: string
    email: string
    status: string
    createdAt: Date
    expiresAt: Date
    sender: {
      name: string | null
      email: string
    }
  }>
  _count: {
    members: number
  }
}

export async function GET(_req: NextRequest, ctx:  {params: Params}) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check access first
    const membership = await getUserMembership(id, session.user.id)
    const group = await getGroupById(id)

    if (!group || (!membership && group.ownerId !== session.user.id)) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Get full group details
    const groupWithDetails = await getGroupWithDetails(id)

    if (!groupWithDetails) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Transform the data to include computed fields
    const transformedGroup = {
      ...groupWithDetails,
      isOwner: groupWithDetails.owner.id === session.user.id,
      isMember: groupWithDetails.members.some((m) => m.user.id === session.user.id),
      totalMembers: groupWithDetails._count.members + 1, // Owner + members
      currentUserMembership: groupWithDetails.members.find((m) => m.user.id === session.user.id),
      events: groupWithDetails.events.map((event) => ({
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        responseCount: calculateResponseCount(event.responses),
        userResponse: event.responses.find((r) => r.userId === session.user.id) || null
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

export async function PUT(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    
    // Validate the data
    const validatedData = validateUpdateGroupData(body)

    // Check permissions
    const existingGroup = await getGroupForAdmin(id, session.user.id)

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found or insufficient permissions' },
        { status: 404 }
      )
    }

    const updatedGroup = await updateGroup(id, validatedData)

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

export async function DELETE(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const group = await getGroupById(id)

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

    await deleteGroup(id)

    return NextResponse.json({ message: 'Group deleted successfully' })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}
