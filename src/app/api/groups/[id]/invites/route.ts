import { ErrorResponses, SuccessResponses } from '@/lib/api/responses'
import { NextRequest } from 'next/server'
import { sendEmail } from '@/lib/email'
import { 
  createInvite, 
  getInvitesForGroup,
  validateInviteData,
  checkExistingMembership,
  checkPendingInvite 
} from '@/lib/database/invites'
import { getGroupForAdmin } from '@/lib/database/groups'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

type Params = Promise<{ id: string }>

// Send invitation
export async function POST(req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    const body = await req.json()
    const { email } = validateInviteData(body)

    // Check if group exists and user has permission to invite
    const group = await getGroupForAdmin(id, session.user.id)

    if (!group) {
      return ErrorResponses.insufficientPermissions()
    }

    // Check if user is already a member
    const isAlreadyMember = await checkExistingMembership(email, id)
    if (isAlreadyMember) {
      return ErrorResponses.alreadyMember()
    }

    // Check if there's already a pending invitation
    const hasPendingInvite = await checkPendingInvite(email, id)
    if (hasPendingInvite) {
      return ErrorResponses.pendingInviteExists()
    }

    // Create invitation
    const invite = await createInvite(id, session.user.id, email)

    // Send email invitation
    const inviteUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${invite.token}`
    
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
      
      return ErrorResponses.internalError('Failed to send invitation email. Please try again.')
    }

    return SuccessResponses.ok({
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
      return ErrorResponses.validationError(error.message)
    }

    console.error('Error sending invitation:', error)
    return ErrorResponses.internalError('Failed to send invitation')
  }
}

// Get group invitations
export async function GET(_req: NextRequest, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await ctx.params

    if (!session || !session.user?.id) {
      return ErrorResponses.unauthorized()
    }

    // Check if user has permission to view invitations
    const group = await getGroupForAdmin(id, session.user.id)

    if (!group) {
      return ErrorResponses.insufficientPermissions()
    }

    const invites = await getInvitesForGroup(id)

    return SuccessResponses.ok(invites)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return ErrorResponses.internalError('Failed to fetch invitations')
  }
}
