import { create } from 'zustand'
import { apiEndpoints } from '@/lib/api'
import type { UserProfile } from '@/types'

interface UserStore {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  fetchProfile: () => Promise<void>
  updateProfile: (data: { name: string }) => Promise<void>
  reset: () => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null })
    
    try {
      const result = await apiEndpoints.getProfile()
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ profile: result.data, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        loading: false
      })
    }
  },

  updateProfile: async (data: { name: string }) => {
    set({ loading: true, error: null })
    
    try {
      const result = await apiEndpoints.updateProfile(data)

      if (!result.success) {
        throw new Error(result.error)
      }

      const currentProfile = get().profile
      
      if (currentProfile) {
        set({ 
          profile: { ...currentProfile, ...result.data },
          loading: false 
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile',
        loading: false
      })
      throw error
    }
  },

  reset: () => set({
    profile: null,
    loading: false,
    error: null
  })
}))