import { z } from 'zod'
import { requiredStringSchema, optionalStringSchema, dateTimeSchema, futureDateSchema } from './common'

export const createEventSchema = z.object({
  title: requiredStringSchema('Event title').max(100, 'Event title must be 100 characters or less'),
  description: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    'Description must be 500 characters or less'
  ),
  startTime: futureDateSchema,
  endTime: dateTimeSchema,
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

export const editEventSchema = z.object({
  title: requiredStringSchema('Event title').max(100, 'Event title must be 100 characters or less'),
  description: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    'Description must be 500 characters or less'
  ),
  startTime: dateTimeSchema,
  endTime: dateTimeSchema,
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
)

export const eventResponseSchema = z.object({
  status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAYBE'], {
    required_error: 'Please select your availability'
  }),
  comment: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    'Comment must be 500 characters or less'
  ),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type EditEventInput = z.infer<typeof editEventSchema>
export type EventResponseInput = z.infer<typeof eventResponseSchema>