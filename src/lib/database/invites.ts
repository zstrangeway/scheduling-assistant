import { db, TransactionClient } from '@/lib/db'
import { getUserByEmailWithMemberships } from './users'
import crypto from 'crypto'

export interface InviteWithDetails {
  id: string
  email: string
  token: string
  status: string
  createdAt: Date
  expiresAt: Date
  groupId: string
  senderId: string
  group: {
    id: string
    name: string
    description: string | null
  }
  sender: {
    name: string | null
    email: string
  }
}

export interface CreateInviteData {
  email: string
}

export interface ProcessInviteData {
  action: 'accept' | 'decline'
}

export interface ProcessInviteResult {
  message: string
  groupId?: string
  groupName?: string
  alreadyMember?: boolean
}

/**
 * Validate invite data
 */
export function validateInviteData(data: Record<string, unknown>): { email: string } {
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

/**
 * Get invites for a group
 */
export async function getInvitesForGroup(groupId: string) {
  return await db.invite.findMany({
    where: { groupId },
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
}

/**
 * Get invite by token
 */
export async function getInviteByToken(token: string): Promise<InviteWithDetails | null> {
  return await db.invite.findUnique({
    where: { token },
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
}

/**
 * Check if invite is valid and active
 */
export async function validateInvite(token: string): Promise<{
  valid: boolean
  invite: InviteWithDetails | null
  error?: string
}> {
  const invite = await getInviteByToken(token)

  if (!invite) {
    return { valid: false, invite: null, error: 'Invitation not found' }
  }

  if (invite.status !== 'PENDING') {
    return { 
      valid: false, 
      invite, 
      error: 'Invitation has already been processed'
    }
  }

  if (invite.expiresAt < new Date()) {
    // Mark as expired
    await db.invite.update({
      where: { id: invite.id },
      data: { status: 'EXPIRED' }
    })
    
    return { 
      valid: false, 
      invite, 
      error: 'Invitation has expired' 
    }
  }

  return { valid: true, invite }
}

/**
 * Check if user exists and is already a member
 */
export async function checkExistingMembership(email: string, groupId: string) {
  const existingUser = await getUserByEmailWithMemberships(email)
  
  if (!existingUser) return false

  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true }
  })

  if (!group) return false

  return existingUser.id === group.ownerId || 
    existingUser.memberships.some(m => m.groupId === groupId)
}

/**
 * Check for pending invitation
 */
export async function checkPendingInvite(email: string, groupId: string) {
  const existingInvite = await db.invite.findFirst({
    where: {
      email,
      groupId,
      status: 'PENDING',
      expiresAt: {
        gt: new Date()
      }
    }
  })

  return !!existingInvite
}

/**
 * Create a new invitation
 */
export async function createInvite(
  groupId: string, 
  senderId: string, 
  email: string
): Promise<InviteWithDetails> {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  
  // Create invitation (expires in 7 days)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  return await db.invite.create({
    data: {
      email,
      token,
      groupId,
      senderId,
      expiresAt,
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
}


/**
 * Process an invitation (accept or decline)
 */
export async function processInvite(
  token: string, 
  userId: string, 
  userEmail: string,
  data: ProcessInviteData
): Promise<ProcessInviteResult> {
  const { valid, invite, error } = await validateInvite(token)
  
  if (!valid || !invite) {
    throw new Error(error || 'Invalid invitation')
  }

  // Check if the user's email matches the invitation email
  if (userEmail !== invite.email) {
    throw new Error('This invitation was sent to a different email address')
  }

  // Check if user is already a member
  const existingMembership = await db.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: invite.groupId,
        userId
      }
    }
  })

  const group = await db.group.findUnique({
    where: { id: invite.groupId },
    select: { ownerId: true, name: true }
  })

  if (!group) {
    throw new Error('Group not found')
  }

  if (existingMembership || group.ownerId === userId) {
    // Update invite status but don't create duplicate membership
    await db.invite.update({
      where: { id: invite.id },
      data: { 
        status: data.action === 'accept' ? 'ACCEPTED' : 'DECLINED',
        updatedAt: new Date()
      }
    })

    return {
      message: 'You are already a member of this group',
      alreadyMember: true
    }
  }

  if (data.action === 'accept') {
    // Create group membership and update invite status in a transaction
    await db.$transaction(async (tx: TransactionClient) => {
      await tx.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId,
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

    return {
      message: 'Invitation accepted successfully',
      groupId: invite.groupId,
      groupName: group.name
    }
  } else {
    // Just update the invite status
    await db.invite.update({
      where: { id: invite.id },
      data: { 
        status: 'DECLINED',
        updatedAt: new Date()
      }
    })

    return {
      message: 'Invitation declined'
    }
  }
}

/**
 * Delete/cleanup expired invites (utility function)
 */
export async function cleanupExpiredInvites(): Promise<number> {
  const result = await db.invite.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: new Date()
      }
    },
    data: {
      status: 'EXPIRED'
    }
  })

  return result.count
}