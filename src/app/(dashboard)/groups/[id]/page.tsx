import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { GroupActions } from './group-actions'

interface GroupPageProps {
  params: {
    id: string
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  const group = await db.group.findFirst({
    where: {
      id: params.id,
      OR: [
        { ownerId: session.user.id },
        { 
          members: { 
            some: { userId: session.user.id } 
          } 
        }
      ]
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      members: {
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
          joinedAt: 'asc'
        }
      },
      events: {
        select: {
          id: true,
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          createdAt: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        take: 10
      },
      _count: {
        select: {
          members: true,
          events: true,
          invites: true,
        }
      }
    }
  })

  if (!group) {
    notFound()
  }

  const isOwner = group.owner.id === session.user.id
  const currentUserMembership = group.members.find(m => m.user.id === session.user.id)
  const isMember = !!currentUserMembership

  // Calculate total members (owner + explicit members)
  const totalMembers = group._count.members + 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <Link 
              href="/groups" 
              className="text-gray-500 hover:text-gray-700 mr-3"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              {group.name}
            </h2>
            {isOwner && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Owner
              </span>
            )}
          </div>
          {group.description && (
            <p className="mt-2 text-sm text-gray-600">
              {group.description}
            </p>
          )}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalMembers} member{totalMembers !== 1 ? 's' : ''}
            </div>
            <div className="ml-4 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {group._count.events} event{group._count.events !== 1 ? 's' : ''}
            </div>
            <div className="ml-4 text-xs text-gray-400">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <GroupActions 
            group={group}
            isOwner={isOwner}
            isMember={isMember}
            currentUserId={session.user.id}
          />
        </div>
      </div>

      {/* Members */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Members ({totalMembers})
            </h3>
            {isOwner && (
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Invite Members
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                {group.owner.image && (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={group.owner.image}
                    alt={group.owner.name || ''}
                  />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {group.owner.name || group.owner.email}
                  </p>
                  <p className="text-sm text-gray-500">{group.owner.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Owner
                </span>
              </div>
            </div>

            {/* Members */}
            {group.members.map((membership) => (
              <div key={membership.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center">
                  {membership.user.image && (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={membership.user.image}
                      alt={membership.user.name || ''}
                    />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {membership.user.name || membership.user.email}
                    </p>
                    <p className="text-sm text-gray-500">{membership.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {membership.role.toLowerCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    Joined {new Date(membership.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Events ({group._count.events})
            </h3>
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Event
            </button>
          </div>
          
          {group.events.length === 0 ? (
            <div className="text-center py-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first event.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {group.events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {event.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="ml-4">
                          Created by {event.creator.name || event.creator.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}