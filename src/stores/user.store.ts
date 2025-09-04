import { create } from 'zustand'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    ownedGroups: number
    memberships: number
    createdEvents: number
    responses: number
  }
}

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
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const profileData = await response.json()
      set({ profile: profileData, loading: false })
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
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      const currentProfile = get().profile
      
      if (currentProfile) {
        set({ 
          profile: { ...currentProfile, ...updatedProfile },
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