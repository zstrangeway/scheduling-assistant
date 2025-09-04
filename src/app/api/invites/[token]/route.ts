import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

type Params = Promise<{ token: string }>

// Get invitation details
export async function GET(req: NextRequest, ctx: { params: Params }) {
  try {
    const { token } = await ctx.params
    const invite = await db.invite.findUnique({
      where: {
        token,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        sender: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation has already been processed', status: invite.status },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      // Mark as expired
      await db.invite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { error: 'Invitation has expired', status: 'EXPIRED' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        group: invite.group,
        sender: invite.sender,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      }
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}

// Accept or decline invitation
export async function POST(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { token } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { action } = body // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "decline"' },
        { status: 400 }
      )
    }

    const invite = await db.invite.findUnique({
      where: {
        token,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          }
        }
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation has already been processed' },
        { status: 400 }
      )
    }

    if (invite.expiresAt < new Date()) {
      await db.invite.update({
        where: { id: invite.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if the user's email matches the invitation email
    if (session.user.email !== invite.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 400 }
      )
    }

    // Check if user is already a member
    const existingMembership = await db.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: invite.group.id,
          userId: session.user.id
        }
      }
    })

    if (existingMembership || invite.group.ownerId === session.user.id) {
      // Update invite status but don't create duplicate membership
      await db.invite.update({
        where: { id: invite.id },
        data: { 
          status: action === 'accept' ? 'ACCEPTED' : 'DECLINED',
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'You are already a member of this group',
        alreadyMember: true
      })
    }

    if (action === 'accept') {
      // Create group membership and update invite status in a transaction
      await db.$transaction(async (tx) => {
        await tx.groupMember.create({
          data: {
            groupId: invite.group.id,
            userId: session.user.id,
            role: 'MEMBER'
          }
        })

        await tx.invite.update({
          where: { id: invite.id },
          data: { 
            status: 'ACCEPTED',
            updatedAt: new Date()
          }
        })
      })

      return NextResponse.json({
        message: 'Invitation accepted successfully',
        groupId: invite.group.id,
        groupName: invite.group.name
      })
    } else {
      // Just update the invite status
      await db.invite.update({
        where: { id: invite.id },
        data: { 
          status: 'DECLINED',
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Invitation declined'
      })
    }
  } catch (error) {
    console.error('Error processing invitation:', error)
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}
