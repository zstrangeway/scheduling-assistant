'use client'

import { useUser } from '@/contexts/user-context'
import { EventCard } from './event-card'

interface EventListProps {
  groupId: string
  groupOwnerId: string
  events: Array<{
    id: string
    title: string
    description?: string | null
    startTime: string
    endTime: string
    creator: {
      id: string
      name?: string | null
      email: string
      image?: string | null
    }
    responseCount: {
      available: number
      unavailable: number
      maybe: number
      total: number
    }
    userResponse?: {
      id: string
      status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
      comment: string | null
    } | null
  }>
  onEventDeleted?: () => void
  onEventUpdated?: () => void
}

export function EventList({ events, groupOwnerId, onEventDeleted, onEventUpdated }: EventListProps) {
  const { profile } = useUser()
  const currentUserId = profile?.id
  const isGroupOwner = currentUserId === groupOwnerId

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isGroupOwner ? 'Create your first event to start coordinating schedules.' : 'No events have been created for this group yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard 
          key={event.id}
          event={event}
          groupOwnerId={groupOwnerId}
          onEventDeleted={onEventDeleted}
          onEventUpdated={onEventUpdated}
        />
      ))}
    </div>
  )
}