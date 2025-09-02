import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { EditEventForm } from '@/components/edit-event-form'

interface EditEventPageProps {
  params: {
    id: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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
        }
      },
      group: {
        select: {
          id: true,
          name: true,
          ownerId: true,
        }
      }
    }
  })

  if (!event) {
    notFound()
  }

  // Verify user has access to this event (must be group member or owner)
  const membership = await db.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: event.groupId,
        userId: session.user.id
      }
    }
  })

  if (!membership && event.group.ownerId !== session.user.id) {
    notFound()
  }

  const isCreator = event.creatorId === session.user.id
  const isGroupOwner = event.group.ownerId === session.user.id

  // Only event creator or group owner can edit the event
  if (!isCreator && !isGroupOwner) {
    redirect(`/events/${event.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center mb-2">
            <Link 
              href={`/events/${event.id}`}
              className="text-gray-500 hover:text-gray-700 mr-3"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Event
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
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Make changes to your event. Group members who have already responded will be notified of any changes.
            </p>
          </div>
          
          <EditEventForm
            eventId={event.id}
            initialData={{
              title: event.title,
              description: event.description,
              startTime: event.startTime.toISOString(),
              endTime: event.endTime.toISOString(),
            }}
          />
        </div>
      </div>
    </div>
  )
}