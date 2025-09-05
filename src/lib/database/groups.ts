import { db } from '@/lib/db'

/**
 * Find group by ID with basic info
 */
export async function getGroupById(groupId: string) {
  return await db.group.findUnique({
    where: { id: groupId },
    select: { 
      id: true, 
      name: true,
      description: true,
      ownerId: true 
    }
  })
}

/**
 * Find groups where user is owner or member
 */
export async function getGroupsForUser(userId: string) {
  return await db.group.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { 
          members: { 
            some: { userId } 
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
          image: true,
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
}

/**
 * Get detailed group with all relations
 */
export async function getGroupWithDetails(groupId: string) {
  return await db.group.findUnique({
    where: { id: groupId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      members: {
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
      },
      events: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          },
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                }
              }
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      },
      invites: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          expiresAt: true,
          sender: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
          invites: true,
        }
      }
    }
  })
}

/**
 * Find group with admin permission check
 */
export async function getGroupForAdmin(groupId: string, userId: string) {
  return await db.group.findFirst({
    where: {
      id: groupId,
      OR: [
        { ownerId: userId },
        { 
          members: { 
            some: { 
              userId,
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
}

/**
 * Create a new group
 */
export async function createGroup(ownerId: string, data: { name: string; description?: string }) {
  return await db.group.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
        }
      }
    }
  })
}

/**
 * Update group data
 */
export async function updateGroup(groupId: string, data: Record<string, unknown>) {
  return await db.group.update({
    where: { id: groupId },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
        }
      }
    }
  })
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string) {
  return await db.group.delete({
    where: { id: groupId }
  })
}