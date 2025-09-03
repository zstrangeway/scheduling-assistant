import { create } from 'zustand'

interface DashboardData {
  totalGroups: number
  upcomingEvents: number
  pendingInvites: number
  createdEvents: number
  responses: number
}

interface DashboardStore {
  data: DashboardData | null
  loading: boolean
  error: string | null
  fetchDashboardData: () => Promise<void>
  reset: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null })
    
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      set({ data, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching dashboard data:', error)
    }
  },

  reset: () => set({ data: null, loading: false, error: null })
}))