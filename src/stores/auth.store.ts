import { create } from 'zustand'
import { signIn, signOut } from 'next-auth/react'
import type { User } from '@prisma/client'

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  
  // Actions
  signIn: (provider?: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (provider = 'google') => {
    try {
      set({ loading: true, error: null })
      await signIn(provider)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sign in failed',
        loading: false 
      })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null })
      await signOut()
      set({ user: null, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sign out failed',
        loading: false 
      })
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  reset: () => set({ 
    user: null, 
    loading: false, 
    error: null 
  })
}))
