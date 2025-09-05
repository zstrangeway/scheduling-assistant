import { db } from '@/lib/db'

/**
 * Get event by ID with full details
 */
export async function getEventById(eventId: string) {
  return await db.event.findUnique({
    where: { id: eventId },
    include: {
      creator: {
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
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })
}

/**
 * Get events for a group
 */
export async function getEventsForGroup(groupId: string) {
  return await db.event.findMany({
    where: { groupId },
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
  })
}

/**
 * Create a new event
 */
export async function createEvent(data: {
  title: string
  description?: string | null
  startTime: Date
  endTime: Date
  groupId: string
  creatorId: string
}) {
  return await db.event.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      groupId: data.groupId,
      creatorId: data.creatorId,
      startTime: data.startTime,
      endTime: data.endTime,
    },
    include: {
      creator: {
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
        }
      }
    }
  })
}

/**
 * Update an event
 */
export async function updateEvent(eventId: string, data: {
  title?: string
  description?: string | null
  startTime?: Date
  endTime?: Date
}) {
  const updateData: typeof data = {}
  if (data.title) updateData.title = data.title.trim()
  if (data.description !== undefined) updateData.description = data.description?.trim() || null
  if (data.startTime) updateData.startTime = data.startTime
  if (data.endTime) updateData.endTime = data.endTime

  return await db.event.update({
    where: { id: eventId },
    data: updateData,
    include: {
      creator: {
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
        }
      }
    }
  })
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string) {
  return await db.event.delete({
    where: { id: eventId }
  })
}

/**
 * Get all responses for an event
 */
export async function getEventResponses(eventId: string) {
  return await db.availabilityResponse.findMany({
    where: { eventId },
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
      createdAt: 'desc'
    }
  })
}

/**
 * Create or update user's response to an event
 */
export async function upsertEventResponse(eventId: string, userId: string, data: {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
  comment?: string | null
}) {
  return await db.availabilityResponse.upsert({
    where: {
      eventId_userId: {
        eventId,
        userId
      }
    },
    update: {
      status: data.status,
      comment: data.comment?.trim() || null,
      updatedAt: new Date()
    },
    create: {
      eventId,
      userId,
      status: data.status,
      comment: data.comment?.trim() || null
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
      event: {
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
        }
      }
    }
  })
}

/**
 * Calculate response counts for an event
 */
export function calculateResponseCount(responses: Array<{ status: string }>) {
  return {
    available: responses.filter(r => r.status === 'AVAILABLE').length,
    unavailable: responses.filter(r => r.status === 'UNAVAILABLE').length,
    maybe: responses.filter(r => r.status === 'MAYBE').length,
    total: responses.length
  }
}