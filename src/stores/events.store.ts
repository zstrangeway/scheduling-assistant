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
  editLoading: boolean
  editError: string | null
  responseLoading: boolean
  responseError: string | null
  fetchEvents: (groupId: string) => Promise<void>
  createEvent: (groupId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => Promise<Event | null>
  editEvent: (eventId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => Promise<Event | null>
  respondToEvent: (eventId: string, data: { status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'; comment?: string }) => Promise<void>
  reset: () => void
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  editLoading: false,
  editError: null,
  responseLoading: false,
  responseError: null,

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

  editEvent: async (eventId: string, data: { title: string; description?: string; startTime: string; endTime: string }) => {
    set({ editLoading: true, editError: null })
    
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

      set({ editLoading: false })
      
      // Update the event in the local state
      const currentEvents = get().events
      const updatedEvents = currentEvents.map(event => 
        event.id === eventId ? { ...event, ...result } : event
      )
      set({ events: updatedEvents })
      
      return result
    } catch (error) {
      set({ 
        editError: error instanceof Error ? error.message : 'Failed to update event',
        editLoading: false 
      })
      throw error
    }
  },

  respondToEvent: async (eventId: string, data: { status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'; comment?: string }) => {
    set({ responseLoading: true, responseError: null })
    
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

      set({ responseLoading: false })
      
      // Optionally update local state with new response
      // This would require more complex state management to update the event's responses array
      
    } catch (error) {
      set({ 
        responseError: error instanceof Error ? error.message : 'Failed to save response',
        responseLoading: false 
      })
      throw error
    }
  },

  reset: () => set({ 
    events: [], 
    loading: false, 
    error: null, 
    createLoading: false, 
    createError: null,
    editLoading: false,
    editError: null,
    responseLoading: false,
    responseError: null
  }),
}))