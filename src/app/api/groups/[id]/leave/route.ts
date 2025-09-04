import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = Promise<{ id: string }>

export async function DELETE(req: Request, ctx: {params: Params}) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const group = await db.group.findUnique({
      where: { id },
      select: { 
        ownerId: true,
        _count: {
          select: { members: true }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    if (group.ownerId === session.user.id) {
      return NextResponse.json(
        { error: 'Group owner cannot leave the group. Transfer ownership or delete the group instead.' },
        { status: 400 }
      )
    }

    const membership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 400 }
      )
    }

    await db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.user.id
        }
      }
    })

    return NextResponse.json({ message: 'Left group successfully' })
  } catch (error) {
    console.error('Error leaving group:', error)
    return NextResponse.json(
      { error: 'Failed to leave group' },
      { status: 500 }
    )
  }
}
