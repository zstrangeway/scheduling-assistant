import { z } from 'zod'

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const requiredStringSchema = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .trim()

export const optionalStringSchema = z
  .string()
  .optional()
  .transform(val => val?.trim() || undefined)

export const dateTimeSchema = z
  .string()
  .min(1, 'Date and time are required')
  .refine(
    (val) => !isNaN(Date.parse(val)),
    'Please enter a valid date and time'
  )

export const futureDateSchema = z
  .string()
  .min(1, 'Date and time are required')
  .refine(
    (val) => !isNaN(Date.parse(val)),
    'Please enter a valid date and time'
  )
  .refine(
    (val) => new Date(val) > new Date(),
    'Date must be in the future'
  )