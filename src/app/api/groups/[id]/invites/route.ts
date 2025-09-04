import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

type Params = Promise<{ id: string }>

function validateInviteData(data: Record<string, unknown>) {
  if (!data.email || typeof data.email !== 'string') {
    throw new Error('Email is required')
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('Please enter a valid email address')
  }
  
  return {
    email: data.email.toLowerCase().trim()
  }
}

// Send invitation
export async function POST(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { email } = validateInviteData(body)

    // Check if group exists and user has permission to invite
    const group = await db.group.findFirst({
      where: {
        id,
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
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or insufficient permissions' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingUser = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: { groupId: id }
        }
      }
    })

    if (existingUser && (existingUser.id === group.ownerId || existingUser.memberships.length > 0)) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation
    const existingInvite = await db.invite.findFirst({
      where: {
        email,
        groupId: id,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email address' },
        { status: 400 }
      )
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Create invitation (expires in 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invite = await db.invite.create({
      data: {
        email,
        token,
        groupId: id,
        senderId: session.user.id,
        expiresAt,
      },
      include: {
        group: {
          select: {
            name: true,
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

    // Send email invitation
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join "${invite.group.name}"</h2>
        <p>Hello!</p>
        <p>${invite.sender.name || invite.sender.email} has invited you to join the group "${invite.group.name}" on Availability Helper.</p>
        <p>Click the link below to accept the invitation:</p>
        <p>
          <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${inviteUrl}</p>
        <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `

    try {
      await sendEmail({
        to: email,
        subject: `Invitation to join "${invite.group.name}"`,
        html: emailContent,
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Delete the invite if email failed to send
      await db.invite.delete({ where: { id: invite.id } })
      
      return NextResponse.json(
        { error: 'Failed to send invitation email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invite: {
        id: invite.id,
        email: invite.email,
        status: invite.status,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

// Get group invitations
export async function GET(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params
    
    if (!session || !session.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if user has permission to view invitations
    const group = await db.group.findFirst({
      where: {
        id,
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

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found or insufficient permissions' },
        { status: 404 }
      )
    }

    const invites = await db.invite.findMany({
      where: {
        groupId: id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
