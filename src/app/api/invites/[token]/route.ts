import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { authOptions } from '@/lib/auth'
import { validateInvite, processInvite } from '@/lib/database/invites'
import { processInviteSchema } from '@/lib/database/validations'
import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'

type Params = Promise<{ token: string }>

// Get invitation details
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const { token } = await ctx.params
    
    const { valid, invite, error } = await validateInvite(token)

    if (!valid || !invite) {
      return ErrorResponses.validationError(error || 'Invalid invitation')
    }

    return SuccessResponses.ok({
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
    return ErrorResponses.internalError('Failed to fetch invitation')
  }
}

// Accept or decline invitation
export async function POST(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { token } = await ctx.params
    
    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const body = await req.json()
    const result = processInviteSchema.safeParse(body)

    if (!result.success) {
      return ErrorResponses.validationError(result.error.message)
    }

    const response = await processInvite(
      token, 
      session.user.id, 
      session.user.email!, 
      result.data
    )

    return SuccessResponses.ok(response)
  } catch (error) {
    if (error instanceof Error) {
      return ErrorResponses.validationError(error.message)
    }

    console.error('Error processing invitation:', error)
    return ErrorResponses.internalError('Failed to process invitation')
  }
}
