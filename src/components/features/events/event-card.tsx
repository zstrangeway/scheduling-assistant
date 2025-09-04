'use client'

import { useState } from 'react'
import { Edit, MoreVertical, Trash2, Calendar, User, Check, X, AlertCircle } from 'lucide-react'
import { useUserStore } from '@/stores/user.store'
import { useGroupDetailStore } from '@/stores/group-detail.store'
import { EditEventDialog } from './edit-event-dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

interface EventCardProps {
  event: {
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
  }
  groupOwnerId: string
  onEventDeleted?: () => void
  onEventUpdated?: () => void
}

export function EventCard({ event, groupOwnerId, onEventDeleted, onEventUpdated }: EventCardProps) {
  const { profile } = useUserStore()
  const { respondToEvent, deleteEvent } = useGroupDetailStore()
  const [deletingEvent, setDeletingEvent] = useState(false)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  
  const currentUserId = profile?.id
  const isGroupOwner = currentUserId === groupOwnerId
  const canEditEvent = currentUserId && (event.creator.id === currentUserId || isGroupOwner)

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

  const getResponseStatusIcon = (status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE') => {
    switch (status) {
      case 'AVAILABLE': return <Check className="h-3 w-3" />
      case 'UNAVAILABLE': return <X className="h-3 w-3" />
      case 'MAYBE': return <AlertCircle className="h-3 w-3" />
    }
  }

  const getResponseColor = (status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE') => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
      case 'UNAVAILABLE': return 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' 
      case 'MAYBE': return 'text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingEvent(true)

    try {
      await deleteEvent(event.id)
      if (onEventDeleted) {
        onEventDeleted()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete event')
    } finally {
      setDeletingEvent(false)
    }
  }

  const handleEventResponse = async (status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE') => {
    if (!currentUserId) return
    
    setRespondingTo(status)
    try {
      await respondToEvent(event.id, { status })
      if (onEventUpdated) {
        onEventUpdated()
      }
    } catch (error) {
      console.error('Error responding to event:', error)
    } finally {
      setRespondingTo(null)
    }
  }

  const startFormatted = formatDateTime(event.startTime)
  const endFormatted = formatDateTime(event.endTime)
  const status = getEventStatus(event.startTime, event.endTime)
  const isSameDay = startFormatted.date === endFormatted.date

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <CardTitle className="truncate">
              {event.title}
            </CardTitle>
            <Badge 
              variant={status === 'ongoing' ? 'default' : status === 'past' ? 'secondary' : 'outline'}
              className={`${getStatusColor(status)} shrink-0`}
            >
              {getStatusText(status)}
            </Badge>
          </div>
          {canEditEvent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditEventDialog
                  eventId={event.id}
                  eventData={{
                    title: event.title,
                    description: event.description,
                    startTime: event.startTime,
                    endTime: event.endTime,
                  }}
                  onEventUpdated={onEventUpdated}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4" />
                    Edit event
                  </DropdownMenuItem>
                </EditEventDialog>
                <DropdownMenuItem 
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  disabled={deletingEvent}
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingEvent ? 'Deleting...' : 'Delete event'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {event.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        
        <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {startFormatted.date} at {startFormatted.time}
              {!isSameDay && ` - ${endFormatted.date}`} - {endFormatted.time}
              {isSameDay && ` - ${endFormatted.time}`}
            </span>
          </div>
          
          <div className="flex items-center">
            <Avatar className="h-4 w-4 mr-1">
              <AvatarImage src={event.creator.image || ''} alt={event.creator.name || ''} />
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span>Created by {event.creator.name || event.creator.email}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-4">
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
          <span className="text-muted-foreground/50">•</span>
          <span>{event.responseCount.total} total responses</span>
        </div>

        {/* Inline Response Section */}
        {currentUserId && (
          <div className="border-t pt-4">
            {event.userResponse ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${getResponseColor(event.userResponse.status)} text-xs`}
                  >
                    {getResponseStatusIcon(event.userResponse.status)}
                    <span className="ml-1">
                      {event.userResponse.status === 'AVAILABLE' ? 'Available' :
                       event.userResponse.status === 'UNAVAILABLE' ? 'Unavailable' : 'Maybe'}
                    </span>
                  </Badge>
                  {event.userResponse.comment && (
                    <span className="text-xs text-muted-foreground truncate max-w-32">
                      "{event.userResponse.comment}"
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  {(['AVAILABLE', 'MAYBE', 'UNAVAILABLE'] as const).map((responseStatus) => (
                    <Button
                      key={responseStatus}
                      variant={event.userResponse?.status === responseStatus ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleEventResponse(responseStatus)}
                      disabled={respondingTo !== null}
                      className={`h-6 px-2 text-xs`}
                    >
                      {respondingTo === responseStatus ? (
                        <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      ) : (
                        getResponseStatusIcon(responseStatus)
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Your response:</span>
                <div className="flex space-x-1">
                  {(['AVAILABLE', 'MAYBE', 'UNAVAILABLE'] as const).map((responseStatus) => (
                    <Button
                      key={responseStatus}
                      variant="outline"
                      size="sm"
                      onClick={() => handleEventResponse(responseStatus)}
                      disabled={respondingTo !== null}
                      className={`h-6 px-2 text-xs`}
                    >
                      {respondingTo === responseStatus ? (
                        <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
                      ) : (
                        getResponseStatusIcon(responseStatus)
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}