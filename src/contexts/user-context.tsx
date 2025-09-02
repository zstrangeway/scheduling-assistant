'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

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

interface UserContextType {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateProfile: (data: { name: string }) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const profileData = await response.json()
      setProfile(profileData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: { name: string }) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

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
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session && !profile) {
      fetchProfile()
    }
  }, [session, status, profile])

  return (
    <UserContext.Provider
      value={{
        profile,
        isLoading: isLoading || status === 'loading',
        error,
        refreshProfile: fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}