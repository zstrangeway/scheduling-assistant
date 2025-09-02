import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

function validateCreateGroupData(data: Record<string, unknown>) {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new Error('Group name is required')
  }
  if (data.name.length > 100) {
    throw new Error('Group name must be less than 100 characters')
  }
  if (data.description && data.description.length > 500) {
    throw new Error('Description must be less than 500 characters')
  }
  return {
    name: data.name.trim(),
    description: data.description?.trim() || undefined
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const validatedData = validateCreateGroupData(body)

    const group = await db.group.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        ownerId: session.user.id,
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
        _count: {
          select: {
            members: true,
            events: true,
          }
        }
      }
    })

    return NextResponse.json(group)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const groups = await db.group.findMany({
      where: {
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
          }
        },
        _count: {
          select: {
            members: true,
            events: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}