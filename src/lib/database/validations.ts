import { z } from 'zod'

// Group validation schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').nullish(),
})

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullish(),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
}).refine(data => {
  const start = new Date(data.startTime)
  const end = new Date(data.endTime)
  return start < end
}, {
  message: 'End time must be after start time',
  path: ['endTime']
}).refine(data => {
  const start = new Date(data.startTime)
  return start > new Date()
}, {
  message: 'Start time cannot be in the past',
  path: ['startTime']
})

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').nullish(),
  startTime: z.string().datetime('Invalid start time format').optional(),
  endTime: z.string().datetime('Invalid end time format').optional(),
}).refine(data => {
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime)
    const end = new Date(data.endTime)
    return start < end
  }
  return true
}, {
  message: 'End time must be after start time',
  path: ['endTime']
})

// Invite validation schemas
export const createInviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const processInviteSchema = z.object({
  action: z.enum(['accept', 'decline'], {
    message: 'Action must be "accept" or "decline"'
  }),
})

// Response validation schemas
export const eventResponseSchema = z.object({
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAYBE'], {
    message: 'Status must be AVAILABLE, UNAVAILABLE, or MAYBE'
  }),
  comment: z.string().max(500, 'Comment must be less than 500 characters').nullish(),
})

// User profile validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
})

// Membership validation schemas
export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'], {
    message: 'Role must be ADMIN or MEMBER'
  }),
})

// Common validation utilities
export function validateUpdateGroupData(data: Record<string, unknown>) {
  const updates: Record<string, unknown> = {}
  
  if (data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Group name is required')
    }
    if (data.name.length > 100) {
      throw new Error('Group name must be less than 100 characters')
    }
    updates.name = data.name.trim()
  }
  
  if (data.description !== undefined) {
    if (data.description && typeof data.description === 'string' && data.description.length > 500) {
      throw new Error('Description must be less than 500 characters')
    }
    updates.description = typeof data.description === 'string' ? data.description.trim() || null : null
  }
  
  return updates
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateDateRange(startTime: string | Date, endTime: string | Date): {
  valid: boolean
  error?: string
  dates?: { start: Date; end: Date }
} {
  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (start >= end) {
    return { valid: false, error: 'End time must be after start time' }
  }

  return { valid: true, dates: { start, end } }
}

export function validatePastDate(date: string | Date, allowPast: boolean = false): {
  valid: boolean
  error?: string
  date?: Date
} {
  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (!allowPast && dateObj < new Date()) {
    return { valid: false, error: 'Date cannot be in the past' }
  }

  return { valid: true, date: dateObj }
}

// Type exports for the schemas
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type CreateInviteInput = z.infer<typeof createInviteSchema>
export type ProcessInviteInput = z.infer<typeof processInviteSchema>
export type EventResponseInput = z.infer<typeof eventResponseSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>