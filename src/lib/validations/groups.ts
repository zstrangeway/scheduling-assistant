import { z } from 'zod'
import { requiredStringSchema, optionalStringSchema, emailSchema } from './common'

export const createGroupSchema = z.object({
  name: requiredStringSchema('Group name').max(100, 'Group name must be 100 characters or less'),
  description: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    'Description must be 500 characters or less'
  ),
})

export const updateGroupSchema = z.object({
  name: requiredStringSchema('Group name').max(100, 'Group name must be 100 characters or less'),
  description: optionalStringSchema.refine(
    (val) => !val || val.length <= 500,
    'Description must be 500 characters or less'
  ),
})

export const inviteMembersSchema = z.object({
  emails: z
    .array(z.object({ email: emailSchema }))
    .min(1, 'At least one email is required')
    .max(10, 'Maximum 10 invitations at once')
    .refine(
      (emails) => {
        const emailValues = emails.map(item => item.email.toLowerCase())
        const uniqueEmails = new Set(emailValues)
        return uniqueEmails.size === emailValues.length
      },
      'Duplicate email addresses are not allowed'
    ),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type InviteMembersInput = z.infer<typeof inviteMembersSchema>