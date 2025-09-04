import { create } from 'zustand'

interface User {
  id: string
  name?: string | null
  email: string
  image?: string | null
}

interface GroupMember {
  id: string
  userId: string
  groupId: string
  role: string
  joinedAt: Date | string
  user: User
}

interface EventResponse {
  id: string
  status: string
  user: User
}

interface Event {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  createdAt: Date | string
  creator: User
  responses: EventResponse[]
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

interface Invite {
  id: string
  email: string
  status: string
  createdAt: Date | string
  expiresAt: Date | string
  sender: {
    name?: string | null
    email: string
  }
}

interface GroupDetail {
  id: string
  name: string
  description?: string | null
  createdAt: Date | string
  owner: User
  members: GroupMember[]
  events: Event[]
  invites: Invite[]
  _count: {
    members: number
    events: number
    invites: number
  }
  isOwner: boolean
  isMember: boolean
  totalMembers: number
  currentUserMembership?: GroupMember
}

interface GroupDetailStore {
  group: GroupDetail | null
  loading: boolean
  error: string | null
  inviteLoading: boolean
  inviteError: string | null
  fetchGroup: (id: string) => Promise<void>
  updateGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  leaveGroup: (id: string) => Promise<void>
  inviteMembers: (groupId: string, emails: string[]) => Promise<{ successful: number; errors: { email: string; error: string }[] }>
  reset: () => void
}

export const useGroupDetailStore = create<GroupDetailStore>((set, get) => ({
  group: null,
  loading: false,
  error: null,
  inviteLoading: false,
  inviteError: null,

  fetchGroup: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/groups/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Group not found')
        }
        throw new Error('Failed to fetch group')
      }
      const group = await response.json()
      set({ group, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group', 
        loading: false 
      })
    }
  },

  updateGroup: async (id: string, data: { name?: string; description?: string }) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update group')
      }

      const updatedGroup = await response.json()
      const currentGroup = get().group
      
      if (currentGroup) {
        set({ 
          group: { 
            ...currentGroup, 
            ...updatedGroup 
          } 
        })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update group'
      })
      throw error
    }
  },

  deleteGroup: async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete group')
      }

      set({ group: null })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete group'
      })
      throw error
    }
  },

  leaveGroup: async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}/leave`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to leave group')
      }

      set({ group: null })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to leave group'
      })
      throw error
    }
  },

  inviteMembers: async (groupId: string, emails: string[]) => {
    set({ inviteLoading: true, inviteError: null })
    
    try {
      const results = await Promise.allSettled(
        emails.map(email =>
          fetch(`/api/groups/${groupId}/invites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          }).then(async response => {
            const data = await response.json()
            if (!response.ok) {
              throw new Error(data.error || 'Failed to send invitation')
            }
            return { email, success: true }
          }).catch(error => ({
            email,
            success: false,
            error: error.message
          }))
        )
      )

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length

      const errors = results
        .map((result, index) => {
          if (result.status === 'fulfilled' && !result.value.success) {
            const failedResult = result.value as { email: string; success: false; error: string }
            return { email: emails[index], error: failedResult.error }
          }
          return null
        })
        .filter(Boolean) as { email: string; error: string }[]

      set({ inviteLoading: false })
      
      // Refresh group data to show updated invites
      if (successful > 0) {
        const currentGroup = get().group
        if (currentGroup) {
          get().fetchGroup(currentGroup.id)
        }
      }
      
      return { successful, errors }
    } catch (error) {
      set({ 
        inviteError: error instanceof Error ? error.message : 'Failed to send invitations',
        inviteLoading: false 
      })
      throw error
    }
  },

  reset: () => set({ 
    group: null, 
    loading: false, 
    error: null, 
    inviteLoading: false, 
    inviteError: null 
  }),
}))