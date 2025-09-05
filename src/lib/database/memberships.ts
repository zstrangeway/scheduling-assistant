import { db } from '@/lib/db'
import { GroupMemberRole } from '@prisma/client'

export interface MembershipWithUser {
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

export interface MembershipRole {
  OWNER: 'OWNER'
  ADMIN: 'ADMIN'
  MEMBER: 'MEMBER'
}

/**
 * Get membership details for user in a group
 */
export async function getUserMembership(groupId: string, userId: string) {
  return await db.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        }
      }
    }
  })
}

/**
 * Get all members of a group
 */
export async function getGroupMembers(groupId: string): Promise<MembershipWithUser[]> {
  return await db.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      }
    },
    orderBy: {
      joinedAt: 'asc'
    }
  })
}

/**
 * Get all groups a user is a member of
 */
export async function getUserMemberships(userId: string) {
  return await db.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    },
    orderBy: {
      joinedAt: 'desc'
    }
  })
}

/**
 * Create a new membership (when accepting invites)
 */
export async function createMembership(groupId: string, userId: string, role: GroupMemberRole = 'MEMBER') {
  return await db.groupMember.create({
    data: {
      groupId,
      userId,
      role
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        }
      }
    }
  })
}

/**
 * Update membership role (admin operations)
 */
export async function updateMembershipRole(
  groupId: string, 
  userId: string, 
  newRole: GroupMemberRole,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Check if updater has admin permissions
  const group = await db.group.findFirst({
    where: {
      id: groupId,
      OR: [
        { ownerId: updatedBy },
        { 
          members: { 
            some: { 
              userId: updatedBy,
              role: { in: ['OWNER', 'ADMIN'] }
            } 
          } 
        }
      ]
    }
  })

  if (!group) {
    return { success: false, error: 'Group not found or insufficient permissions' }
  }

  // Can't change owner role
  if (group.ownerId === userId) {
    return { success: false, error: 'Cannot change owner role' }
  }

  // Check if membership exists
  const membership = await getUserMembership(groupId, userId)
  if (!membership) {
    return { success: false, error: 'Membership not found' }
  }

  await db.groupMember.update({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    },
    data: { role: newRole }
  })

  return { success: true }
}

/**
 * Remove a membership (delete from database)
 */
export async function removeMembership(groupId: string, userId: string) {
  return await db.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId
      }
    }
  })
}

/**
 * Remove a membership (kick member) - admin operation
 */
export async function kickMember(
  groupId: string, 
  userId: string,
  removedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Check if remover has admin permissions
  const group = await db.group.findFirst({
    where: {
      id: groupId,
      OR: [
        { ownerId: removedBy },
        { 
          members: { 
            some: { 
              userId: removedBy,
              role: { in: ['OWNER', 'ADMIN'] }
            } 
          } 
        }
      ]
    }
  })

  if (!group) {
    return { success: false, error: 'Group not found or insufficient permissions' }
  }

  // Can't remove owner
  if (group.ownerId === userId) {
    return { success: false, error: 'Cannot remove group owner' }
  }

  // Check if membership exists
  const membership = await getUserMembership(groupId, userId)
  if (!membership) {
    return { success: false, error: 'User is not a member of this group' }
  }

  await removeMembership(groupId, userId)

  return { success: true }
}

/**
 * Leave a group (self-removal)
 */
export async function leaveMembership(groupId: string, userId: string): Promise<{
  success: boolean
  error?: string
}> {
  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { 
      ownerId: true,
      _count: {
        select: { members: true }
      }
    }
  })

  if (!group) {
    return { success: false, error: 'Group not found' }
  }

  if (group.ownerId === userId) {
    return { 
      success: false, 
      error: 'Group owner cannot leave the group. Transfer ownership or delete the group instead.' 
    }
  }

  const membership = await getUserMembership(groupId, userId)
  if (!membership) {
    return { success: false, error: 'You are not a member of this group' }
  }

  await removeMembership(groupId, userId)

  return { success: true }
}

/**
 * Transfer group ownership
 */
export async function transferOwnership(
  groupId: string, 
  currentOwnerId: string, 
  newOwnerId: string
): Promise<{ success: boolean; error?: string }> {
  // Verify current owner
  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true }
  })

  if (!group || group.ownerId !== currentOwnerId) {
    return { success: false, error: 'Only the current owner can transfer ownership' }
  }

  // Verify new owner is a member
  const newOwnerMembership = await getUserMembership(groupId, newOwnerId)
  if (!newOwnerMembership) {
    return { success: false, error: 'New owner must be a member of the group' }
  }

  // Update group owner and remove membership (since they become owner)
  await db.$transaction([
    db.group.update({
      where: { id: groupId },
      data: { ownerId: newOwnerId }
    }),
    db.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: newOwnerId
        }
      }
    }),
    // Add old owner as admin member
    db.groupMember.create({
      data: {
        groupId,
        userId: currentOwnerId,
        role: 'ADMIN'
      }
    })
  ])

  return { success: true }
}

/**
 * Get membership statistics for a group
 */
export async function getGroupMembershipStats(groupId: string) {
  const [memberCount, roleDistribution] = await Promise.all([
    db.groupMember.count({
      where: { groupId }
    }),
    db.groupMember.groupBy({
      by: ['role'],
      where: { groupId },
      _count: true
    })
  ])

  return {
    totalMembers: memberCount + 1, // +1 for owner
    memberCount,
    roleDistribution: roleDistribution.reduce((acc, item) => {
      acc[item.role] = item._count
      return acc
    }, {} as Record<string, number>)
  }
}