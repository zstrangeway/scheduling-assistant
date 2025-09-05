interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}

interface ApiResponse<T> {
  success: true
  data: T
}

interface ApiError {
  success: false
  error: string
}

type ApiResult<T> = ApiResponse<T> | ApiError

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(
    endpoint: string, 
    config: ApiRequestConfig = {}
  ): Promise<ApiResult<T>> {
    const { method = 'GET', headers = {}, body } = config
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders
    }

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, requestConfig)
      const responseData = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: responseData.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      return { success: true, data: responseData }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred'
      }
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', headers })
  }

  async post<T>(
    endpoint: string, 
    body?: unknown, 
    headers?: Record<string, string>
  ): Promise<ApiResult<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, headers })
  }

  async put<T>(
    endpoint: string, 
    body?: unknown, 
    headers?: Record<string, string>
  ): Promise<ApiResult<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body, headers })
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResult<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', headers })
  }
}

// Create default API client instance
export const api = new ApiClient('/api')

// Utility functions for common store patterns
export interface StoreState {
  loading: boolean
  error: string | null
}

export function createAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<ApiResult<TResult>>,
  onSuccess: (data: TResult) => void,
  onError?: (error: string) => void,
  loadingKey = 'loading',
  errorKey = 'error'
) {
  return async (setState: (state: Record<string, unknown>) => void, ...args: TArgs): Promise<TResult> => {
    setState({ [loadingKey]: true, [errorKey]: null })
    
    try {
      const result = await action(...args)
      
      if (!result.success) {
        setState({ [loadingKey]: false, [errorKey]: result.error })
        if (onError) onError(result.error)
        throw new Error(result.error)
      }
      
      setState({ [loadingKey]: false })
      onSuccess(result.data)
      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState({ [loadingKey]: false, [errorKey]: errorMessage })
      if (onError) onError(errorMessage)
      throw error
    }
  }
}

import type {
  DashboardData,
  UserProfile,
  GroupWithCounts,
  GroupDetail,
  ApiSuccessResponse,
  CreateGroupRequest,
  UpdateGroupRequest,
  CreateEventRequest,
  UpdateEventRequest,
  EventResponseRequest,
  UpdateProfileRequest
} from '@/types'

// Common API endpoints with proper typing
export const apiEndpoints = {
  // Dashboard
  getDashboard: () => api.get<DashboardData>('/dashboard'),

  // Groups
  getGroups: () => api.get<GroupWithCounts[]>('/groups'),
  createGroup: (data: CreateGroupRequest) => 
    api.post<GroupWithCounts>('/groups', data),
  getGroup: (id: string) => api.get<GroupDetail>(`/groups/${id}`),
  updateGroup: (id: string, data: UpdateGroupRequest) =>
    api.put<GroupWithCounts>(`/groups/${id}`, data),
  deleteGroup: (id: string) => api.delete<void>(`/groups/${id}`),
  leaveGroup: (id: string) => api.post<void>(`/groups/${id}/leave`),

  // Group Invites
  inviteToGroup: (groupId: string, email: string) =>
    api.post<ApiSuccessResponse>(`/groups/${groupId}/invites`, { email }),

  // Events
  createEvent: (groupId: string, data: CreateEventRequest) => 
    api.post<ApiSuccessResponse>(`/groups/${groupId}/events`, data),
  updateEvent: (eventId: string, data: UpdateEventRequest) => 
    api.put<ApiSuccessResponse>(`/events/${eventId}`, data),
  deleteEvent: (eventId: string) => api.delete<void>(`/events/${eventId}`),
  respondToEvent: (eventId: string, data: EventResponseRequest) => 
    api.post<ApiSuccessResponse>(`/events/${eventId}/responses`, data),

  // User Profile
  getProfile: () => api.get<UserProfile>('/profile'),
  updateProfile: (data: UpdateProfileRequest) => api.put<UserProfile>('/profile', data),
}