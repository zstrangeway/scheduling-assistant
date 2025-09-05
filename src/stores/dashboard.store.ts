import { create } from 'zustand'
import { apiEndpoints } from '@/lib/api'
import type { DashboardData } from '@/types'

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
      const result = await apiEndpoints.getDashboard() as Awaited<ReturnType<typeof apiEndpoints.getDashboard>> & { data: DashboardData }
      if (!result.success) {
        throw new Error(result.error)
      }
      set({ data: result.data, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching dashboard data:', error)
    }
  },

  reset: () => set({ data: null, loading: false, error: null })
}))
