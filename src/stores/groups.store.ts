import { create } from 'zustand'
import { apiEndpoints } from '@/lib/api'
import type { GroupWithCounts } from '@/types'

interface GroupsStore {
  groups: GroupWithCounts[]
  loading: boolean
  error: string | null
  createLoading: boolean
  createError: string | null
  fetchGroups: () => Promise<void>
  createGroup: (data: { name: string; description?: string }) => Promise<GroupWithCounts | null>
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
      const result = await apiEndpoints.getGroups()
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ groups: result.data, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching groups:', error)
    }
  },

  createGroup: async (data: { name: string; description?: string }) => {
    set({ createLoading: true, createError: null })
    
    try {
      const result = await apiEndpoints.createGroup({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      // Add the new group to the beginning of the list
      set((state) => ({
        groups: [result.data, ...state.groups],
        createLoading: false
      }))

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ createError: errorMessage, createLoading: false })
      console.error('Error creating group:', error)
      return null
    }
  },

  reset: () => set({ groups: [], loading: false, error: null, createLoading: false, createError: null })
}))