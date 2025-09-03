'use client'

import Link from 'next/link'
import { useState } from 'react'

interface EventListProps {
  groupId: string
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
  }>
  canCreateEvents?: boolean
  onEventDeleted?: () => void
}

export function EventList({ groupId, events, canCreateEvents = false, onEventDeleted }: EventListProps) {
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now > end) return 'past'
    if (now >= start && now <= end) return 'ongoing'
    return 'upcoming'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past': return 'text-gray-500 bg-gray-100'
      case 'ongoing': return 'text-green-700 bg-green-100'
      case 'upcoming': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-500 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'past': return 'Past'
      case 'ongoing': return 'Ongoing'
      case 'upcoming': return 'Upcoming'
      default: return 'Unknown'
    }
  }

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return
    }

    setDeletingEventId(eventId)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      if (onEventDeleted) {
        onEventDeleted()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeletingEventId(null)
    }
  }

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
          {canCreateEvents ? 'Create your first event to start coordinating schedules.' : 'No events have been created for this group yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const startFormatted = formatDateTime(event.startTime)
        const endFormatted = formatDateTime(event.endTime)
        const status = getEventStatus(event.startTime, event.endTime)
        const isSameDay = startFormatted.date === endFormatted.date
        
        return (
          <div key={event.id} className="bg-white shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link 
                      href={`/events/${event.id}`}
                      className="text-lg font-medium text-gray-900 hover:text-blue-600 truncate"
                    >
                      {event.title}
                    </Link>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {startFormatted.date} at {startFormatted.time}
                        {!isSameDay && ` - ${endFormatted.date}`} - {endFormatted.time}
                        {isSameDay && ` - ${endFormatted.time}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Created by {event.creator.name || event.creator.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{event.responseCount.available} Available</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>{event.responseCount.unavailable} Unavailable</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>{event.responseCount.maybe} Maybe</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{event.responseCount.total} total responses</span>
                  </div>
                </div>
                
                {canCreateEvents && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      disabled={deletingEventId === event.id}
                      className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingEventId === event.id ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}