import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { 
  getInviteByToken, 
  validateInvite, 
  processInvite 
} from '@/lib/database/invites'
import { processInviteSchema } from '@/lib/database/validations'

type Params = Promise<{ token: string }>

// Get invitation details
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const { token } = await ctx.params
    
    const { valid, invite, error } = await validateInvite(token)

    if (!valid || !invite) {
      return NextResponse.json(
        { error: error || 'Invalid invitation' },
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
    const result = processInviteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.message },
        { status: 400 }
      )
    }

    const response = await processInvite(
      token, 
      session.user.id, 
      session.user.email!, 
      result.data
    )

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Error processing invitation:', error)
    return NextResponse.json(
      { error: 'Failed to process invitation' },
      { status: 500 }
    )
  }
}
