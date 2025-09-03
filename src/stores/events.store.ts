import { create } from 'zustand'

interface Event {
  id: string
  title: string
  description?: string | null
  startTime: string
  endTime: string
  createdAt: Date | string
  groupId: string
  creator: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
  responses: Array<{
    id: string
    status: string
    user: {
      id: string
      name?: string | null
      email: string
      image?: string | null
    }
  }>
  responseCount: {
    available: number
    unavailable: number
    maybe: number
    total: number
  }
}

interface EventsStore {
  events: Event[]
  loading: boolean
  error: string | null
  createLoading: boolean
  createError: string | null
  fetchEvents: (groupId: string) => Promise<void>
  createEvent: (groupId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => Promise<Event | null>
  reset: () => void
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,

  fetchEvents: async (groupId: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/groups/${groupId}/events`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const events = await response.json()
      set({ events, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch events', 
        loading: false 
      })
    }
  },

  createEvent: async (groupId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => {
    set({ createLoading: true, createError: null })
    
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

      set({ createLoading: false })
      
      // Add the new event to the local state
      const currentEvents = get().events
      set({ events: [result, ...currentEvents] })
      
      return result
    } catch (error) {
      set({ 
        createError: error instanceof Error ? error.message : 'Failed to create event',
        createLoading: false 
      })
      throw error
    }
  },

  reset: () => set({ 
    events: [], 
    loading: false, 
    error: null, 
    createLoading: false, 
    createError: null 
  }),
}))