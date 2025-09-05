// API request and response types (only when different from entities)

// API Request types
export interface CreateGroupRequest {
  name: string
  description?: string
}

export interface UpdateGroupRequest {
  name?: string
  description?: string
}

export interface CreateEventRequest {
  title: string
  description?: string
  startTime: string
  endTime: string
}

export interface UpdateEventRequest {
  title: string
  description?: string
  startTime: string
  endTime: string
}

export interface EventResponseRequest {
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
  comment?: string
}

export interface InviteMemberRequest {
  email: string
}

export interface UpdateProfileRequest {
  name: string
}

// API Response types (when serialization differs from entities)
// Most responses use the entity types directly, but these handle special cases

export interface ApiSuccessResponse {
  message: string
}

export interface InviteResponse {
  successful: number
  errors: Array<{
    email: string
    error: string
  }>
}

// Error response
export interface ApiErrorResponse {
  error: string
}