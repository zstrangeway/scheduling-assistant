import { NextResponse } from 'next/server'

/**
 * Reusable error responses
 */
export const ErrorResponses = {
  // Common HTTP errors
  unauthorized: () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  forbidden: () => NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
  notFound: (message = 'Not found') => NextResponse.json({ error: message }, { status: 404 }),
  validationError: (details?: string) => NextResponse.json({ 
    error: 'Invalid input',
    ...(details && { details })
  }, { status: 400 }),
  internalError: (message = 'Internal Server Error') => NextResponse.json({ error: message }, { status: 500 }),
  
  // Domain-specific errors
  groupNotFound: () => NextResponse.json({ error: 'Group not found' }, { status: 404 }),
  ownerCannotDelete: () => NextResponse.json({ error: 'Only the group owner can delete the group' }, { status: 403 }),
  eventNotFound: () => NextResponse.json({ error: 'Event not found' }, { status: 404 }),
  inviteNotFound: () => NextResponse.json({ error: 'Invitation not found' }, { status: 404 }),
  userNotFound: () => NextResponse.json({ error: 'User not found' }, { status: 404 }),
  insufficientPermissions: () => NextResponse.json({ error: 'Group not found or insufficient permissions' }, { status: 404 }),
  alreadyMember: () => NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 }),
  pendingInviteExists: () => NextResponse.json({ error: 'An invitation has already been sent to this email address' }, { status: 400 }),
  invalidInvite: () => NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 }),
  cannotLeaveAsOwner: () => NextResponse.json({ error: 'Group owner cannot leave the group. Transfer ownership or delete the group instead.' }, { status: 400 }),
  notAMember: () => NextResponse.json({ error: 'You are not a member of this group' }, { status: 400 }),
}

/**
 * Success responses
 */
export const SuccessResponses = {
  ok: (data?: any) => NextResponse.json(data || { success: true }),
  created: (data: any) => NextResponse.json(data, { status: 201 }),
  message: (message: string) => NextResponse.json({ message }),
}