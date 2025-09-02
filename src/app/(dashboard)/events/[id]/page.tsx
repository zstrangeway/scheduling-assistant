import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { EventResponseButton } from './event-response-button'

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  const event = await db.event.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        }
      },
      responses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  // Verify user has access to this event (must be group member or owner)
  const userId = (session.user as any).id
  const membership = await db.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: event.groupId,
        userId: userId
      }
    }
  })

  if (!membership && event.group.ownerId !== userId) {
    notFound()
  }

  const isCreator = event.creatorId === userId
  const isGroupOwner = event.group.ownerId === userId
  const canEdit = isCreator || isGroupOwner

  const formatDateTime = (dateTime: Date) => {
    return {
      date: dateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: dateTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const getEventStatus = () => {
    const now = new Date()
    if (now > event.endTime) return 'past'
    if (now >= event.startTime && now <= event.endTime) return 'ongoing'
    return 'upcoming'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'past': return 'text-gray-700 bg-gray-100'
      case 'ongoing': return 'text-green-700 bg-green-100'
      case 'upcoming': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'past': return 'Past Event'
      case 'ongoing': return 'Happening Now'
      case 'upcoming': return 'Upcoming Event'
      default: return 'Unknown'
    }
  }

  const startFormatted = formatDateTime(event.startTime)
  const endFormatted = formatDateTime(event.endTime)
  const isSameDay = startFormatted.date === endFormatted.date
  const status = getEventStatus()

  const responsesByStatus = {
    available: event.responses.filter(r => r.status === 'AVAILABLE'),
    unavailable: event.responses.filter(r => r.status === 'UNAVAILABLE'),
    maybe: event.responses.filter(r => r.status === 'MAYBE')
  }

  const userResponse = event.responses.find(r => r.userId === userId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center mb-2">
            <Link 
              href={`/groups/${event.groupId}`}
              className="text-gray-500 hover:text-gray-700 mr-3"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <Link 
                href={`/groups/${event.groupId}`}
                className="hover:text-blue-600"
              >
                {event.group.name}
              </Link>
            </div>
            
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Created by {event.creator.name || event.creator.email}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {startFormatted.date} at {startFormatted.time}
                  {!isSameDay && ` - ${endFormatted.date}`} - {endFormatted.time}
                  {isSameDay && ` - ${endFormatted.time}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
            <Link
              href={`/events/${event.id}/edit`}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Event
            </Link>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3">
              Description
            </h3>
            <div className="prose text-gray-700">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Response Summary */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Response Summary
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{responsesByStatus.available.length}</div>
              <div className="text-sm text-green-600">Available</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{responsesByStatus.unavailable.length}</div>
              <div className="text-sm text-red-600">Unavailable</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{responsesByStatus.maybe.length}</div>
              <div className="text-sm text-yellow-600">Maybe</div>
            </div>
          </div>

          <div className="text-sm text-gray-500 text-center">
            {event.responses.length} of {event.group.name} members have responded
          </div>
        </div>
      </div>

      {/* User Response Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Your Response
          </h3>
          
          {userResponse ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  userResponse.status === 'AVAILABLE' ? 'bg-green-500' :
                  userResponse.status === 'UNAVAILABLE' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <span className="font-medium">
                    {userResponse.status === 'AVAILABLE' ? 'Available' :
                     userResponse.status === 'UNAVAILABLE' ? 'Unavailable' : 'Maybe'}
                  </span>
                  {userResponse.comment && (
                    <p className="text-sm text-gray-600 mt-1">{userResponse.comment}</p>
                  )}
                </div>
              </div>
              <EventResponseButton 
                eventId={event.id} 
                currentResponse={{
                  status: userResponse.status,
                  comment: userResponse.comment
                }}
              />
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You haven&apos;t responded to this event yet.</p>
              <EventResponseButton eventId={event.id} />
            </div>
          )}
        </div>
      </div>

      {/* All Responses */}
      {event.responses.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              All Responses ({event.responses.length})
            </h3>
            
            <div className="space-y-4">
              {['AVAILABLE', 'MAYBE', 'UNAVAILABLE'].map((status) => {
                const responses = responsesByStatus[status.toLowerCase() as keyof typeof responsesByStatus]
                if (responses.length === 0) return null
                
                return (
                  <div key={status}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        status === 'AVAILABLE' ? 'bg-green-500' :
                        status === 'UNAVAILABLE' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      {status === 'AVAILABLE' ? 'Available' : status === 'UNAVAILABLE' ? 'Unavailable' : 'Maybe'} ({responses.length})
                    </h4>
                    <div className="space-y-2">
                      {responses.map((response) => (
                        <div key={response.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center flex-1">
                            {response.user.image && (
                              <img
                                className="h-8 w-8 rounded-full mr-3"
                                src={response.user.image}
                                alt={response.user.name || ''}
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {response.user.name || response.user.email}
                              </p>
                              {response.comment && (
                                <p className="text-sm text-gray-600 mt-1">{response.comment}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}