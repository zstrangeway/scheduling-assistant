import { create } from 'zustand'
import { apiEndpoints } from '@/lib/api'
import type { GroupDetail } from '@/types'

interface GroupDetailStore {
  group: GroupDetail | null
  loading: boolean
  error: string | null
  inviteLoading: boolean
  inviteError: string | null
  eventLoading: boolean
  eventError: string | null
  fetchGroup: (id: string) => Promise<void>
  updateGroup: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  leaveGroup: (id: string) => Promise<void>
  inviteMembers: (groupId: string, emails: string[]) => Promise<{ successful: number; errors: { email: string; error: string }[] }>
  createEvent: (groupId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => Promise<void>
  updateEvent: (eventId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
  respondToEvent: (eventId: string, data: { status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'; comment?: string }) => Promise<void>
  reset: () => void
}

export const useGroupDetailStore = create<GroupDetailStore>((set, get) => ({
  group: null,
  loading: false,
  error: null,
  inviteLoading: false,
  inviteError: null,
  eventLoading: false,
  eventError: null,

  fetchGroup: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const result = await apiEndpoints.getGroup(id)
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ group: result.data, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch group', 
        loading: false 
      })
    }
  },

  updateGroup: async (id: string, data: { name?: string; description?: string }) => {
    try {
      const result = await apiEndpoints.updateGroup(id, data)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      const currentGroup = get().group
      
      if (currentGroup) {
        set({ 
          group: { 
            ...currentGroup, 
            name: result.data.name,
            description: result.data.description 
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
      const result = await apiEndpoints.deleteGroup(id)
      
      if (!result.success) {
        throw new Error(result.error)
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
      const result = await apiEndpoints.leaveGroup(id)
      
      if (!result.success) {
        throw new Error(result.error)
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

  createEvent: async (groupId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => {
    set({ eventLoading: true, eventError: null })
    
    try {
      const response = await fetch(`/api/groups/${groupId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          startTime: data.startTime,
          endTime: data.endTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event')
      }

      set({ eventLoading: false })
      
      // Refresh group data to show new event
      const currentGroup = get().group
      if (currentGroup) {
        get().fetchGroup(currentGroup.id)
      }
    } catch (error) {
      set({ 
        eventError: error instanceof Error ? error.message : 'Failed to create event',
        eventLoading: false 
      })
      throw error
    }
  },

  updateEvent: async (eventId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => {
    set({ eventLoading: true, eventError: null })
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          startTime: data.startTime,
          endTime: data.endTime,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event')
      }

      set({ eventLoading: false })
      
      // Refresh group data to show updated event
      const currentGroup = get().group
      if (currentGroup) {
        get().fetchGroup(currentGroup.id)
      }
    } catch (error) {
      set({ 
        eventError: error instanceof Error ? error.message : 'Failed to update event',
        eventLoading: false 
      })
      throw error
    }
  },

  deleteEvent: async (eventId: string) => {
    set({ eventLoading: true, eventError: null })
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      set({ eventLoading: false })
      
      // Refresh group data to remove deleted event
      const currentGroup = get().group
      if (currentGroup) {
        get().fetchGroup(currentGroup.id)
      }
    } catch (error) {
      set({ 
        eventError: error instanceof Error ? error.message : 'Failed to delete event',
        eventLoading: false 
      })
      throw error
    }
  },

  respondToEvent: async (eventId: string, data: { status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'; comment?: string }) => {
    set({ eventLoading: true, eventError: null })
    
    try {
      const response = await fetch(`/api/events/${eventId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: data.status,
          comment: data.comment || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save response')
      }

      set({ eventLoading: false })
      
      // Refresh group data to show updated response
      const currentGroup = get().group
      if (currentGroup) {
        get().fetchGroup(currentGroup.id)
      }
    } catch (error) {
      set({ 
        eventError: error instanceof Error ? error.message : 'Failed to save response',
        eventLoading: false 
      })
      throw error
    }
  },

  reset: () => set({ 
    group: null, 
    loading: false, 
    error: null, 
    inviteLoading: false, 
    inviteError: null,
    eventLoading: false,
    eventError: null
  }),
}))