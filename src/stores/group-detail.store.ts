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
  fetchGroup: (id: string) => Promise<void>
  updateGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  leaveGroup: (id: string) => Promise<void>
  reset: () => void
}

export const useGroupDetailStore = create<GroupDetailStore>((set, get) => ({
  group: null,
  loading: false,
  error: null,

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

  reset: () => set({ group: null, loading: false, error: null }),
}))