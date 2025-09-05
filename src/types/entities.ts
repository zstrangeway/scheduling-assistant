import type { User, Group, GroupMember, Event, AvailabilityResponse, Invite } from '@prisma/client'

// User entity (extends Prisma User with computed fields)
export interface UserProfile extends User {
  _count: {
    ownedGroups: number
    memberships: number
    createdEvents: number
    responses: number
  }
}

// Group entities
export interface GroupWithCounts extends Group {
  owner: User
  members: Array<{
    user: User
  }>
  _count: {
    members: number
    events: number
  }
}

export interface GroupMemberWithUser extends GroupMember {
  user: User
}

export interface GroupDetail extends Group {
  owner: User
  members: GroupMemberWithUser[]
  events: EventWithDetails[]
  invites: InviteWithSender[]
  _count: {
    members: number
    events: number
    invites: number
  }
  isOwner: boolean
  isMember: boolean
  totalMembers: number
  currentUserMembership?: GroupMemberWithUser
}

// Event entities
export interface EventResponseWithUser extends AvailabilityResponse {
  user: User
}

export interface EventWithDetails extends Event {
  creator: User
  responses: EventResponseWithUser[]
  responseCount: {
    available: number
    unavailable: number
    maybe: number
    total: number
  }
  userResponse?: {
    id: string
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
    comment: string | null
  } | null
}

// Invite entities
export interface InviteWithSender extends Invite {
  sender: {
    name?: string | null
    email: string
  }
}

// Dashboard data
export interface DashboardData {
  totalGroups: number
  upcomingEvents: number
  pendingInvites: number
  createdEvents: number
  responses: number
}