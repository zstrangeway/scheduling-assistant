import { create } from 'zustand'
import { apiEndpoints } from '@/lib/api'
import type { InviteDetail, InviteActionRequest, InviteActionResponse } from '@/types'

interface InviteStore {
  invite: InviteDetail | null
  loading: boolean
  error: string | null
  processing: boolean
  result: InviteActionResponse | null
  redirecting: boolean
  fetchInvite: (token: string) => Promise<void>
  processInvite: (token: string, action: 'accept' | 'decline', onRedirect?: (url: string) => void) => Promise<void>
  reset: () => void
}

export const useInviteStore = create<InviteStore>((set, get) => ({
  invite: null,
  loading: false,
  error: null,
  processing: false,
  result: null,
  redirecting: false,

  fetchInvite: async (token: string) => {
    set({ loading: true, error: null })
    
    try {
      const result = await apiEndpoints.getInvite(token)
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ invite: result.data.invite, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch invitation',
        loading: false
      })
    }
  },

  processInvite: async (token: string, action: 'accept' | 'decline', onRedirect?: (url: string) => void) => {
    set({ processing: true, error: null, result: null })
    
    try {
      const result = await apiEndpoints.processInvite(token, { action })
      
      if (!result.success) {
        throw new Error(result.error)
      }

      set({ processing: false, result: result.data })

      // Handle redirect logic
      if (onRedirect) {
        set({ redirecting: true })
        
        setTimeout(() => {
          if (action === 'accept' && result.data.groupId) {
            onRedirect(`/groups/${result.data.groupId}`)
          } else if (action === 'decline') {
            onRedirect('/')
          }
        }, 2000)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process invitation'
      set({
        error: errorMessage,
        processing: false
      })
    }
  },

  reset: () => set({
    invite: null,
    loading: false,
    error: null,
    processing: false,
    result: null,
    redirecting: false
  })
}))