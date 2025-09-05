import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  createGroup, 
  getGroupsForUser 
} from '@/lib/database/groups'
import { createGroupSchema } from '@/lib/database/validations'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const result = createGroupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.message },
        { status: 400 }
      )
    }

    const group = await createGroup(session.user.id, result.data)

    return NextResponse.json(group)
  } catch (error) {
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

    const groups = await getGroupsForUser(session.user.id)

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}
