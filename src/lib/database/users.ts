import { db } from '@/lib/db'

/**
 * Get user profile with detailed statistics
 */
export async function getUserWithStats(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ownedGroups: true,
          memberships: true,
          createdEvents: true,
          responses: true,
        }
      }
    }
  })
}

/**
 * Get basic user stats for dashboard
 */
export async function getUserStats(userId: string) {
  return await db.user.findUnique({
    where: { id: userId },
    select: {
      _count: {
        select: {
          ownedGroups: true,
          memberships: true,
          createdEvents: true,
          responses: true,
        }
      }
    }
  })
}

/**
 * Update user profile
 */
export async function updateUser(userId: string, data: { name: string }) {
  return await db.user.update({
    where: { id: userId },
    data: { name: data.name.trim() },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    }
  })
}

/**
 * Find user by email with memberships
 */
export async function getUserByEmailWithMemberships(email: string) {
  return await db.user.findUnique({
    where: { email },
    include: {
      memberships: {
        select: {
          groupId: true
        }
      }
    }
  })
}

/**
 * Find user by email (basic)
 */
export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email }
  })
}