import { create } from 'zustand'

interface GroupOwner {
  id: string
  name?: string | null
  email: string
  image?: string | null
}

interface GroupMember {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
}

interface Group {
  id: string
  name: string
  description?: string | null
  owner: GroupOwner
  members: GroupMember[]
  _count: {
    members: number
    events: number
  }
  createdAt: Date | string
  updatedAt: Date | string
}

interface GroupsStore {
  groups: Group[]
  loading: boolean
  error: string | null
  createLoading: boolean
  createError: string | null
  fetchGroups: () => Promise<void>
  createGroup: (data: { name: string; description?: string }) => Promise<Group | null>
  reset: () => void
}

export const useGroupsStore = create<GroupsStore>((set) => ({
  groups: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,

  fetchGroups: async () => {
    set({ loading: true, error: null })
    
    try {
      const response = await fetch('/api/groups')
      if (!response.ok) {
        throw new Error('Failed to fetch groups')
      }
      const data = await response.json()
      set({ groups: data, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching groups:', error)
    }
  },

  createGroup: async (data: { name: string; description?: string }) => {
    set({ createLoading: true, createError: null })
    
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          description: data.description?.trim() || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create group')
      }

      // Add the new group to the beginning of the list
      set((state) => ({
        groups: [result, ...state.groups],
        createLoading: false
      }))

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ createError: errorMessage, createLoading: false })
      console.error('Error creating group:', error)
      return null
    }
  },

  reset: () => set({ groups: [], loading: false, error: null, createLoading: false, createError: null })
}))