import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { CreateGroupButton } from './create-group-button'

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  const groups = await db.group.findMany({
    where: {
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
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  const ownedGroups = groups.filter(group => group.owner.id === session.user.id)
  const memberGroups = groups.filter(group => group.owner.id !== session.user.id)

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Groups
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your groups and coordinate schedules
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <CreateGroupButton />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first group.
          </p>
          <div className="mt-6">
            <CreateGroupButton />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {ownedGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Groups You Own ({ownedGroups.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ownedGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    isOwner={true}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}

          {memberGroups.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Groups You're In ({memberGroups.length})
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {memberGroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    isOwner={false}
                    currentUserId={session.user.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface GroupCardProps {
  group: any
  isOwner: boolean
  currentUserId: string
}

function GroupCard({ group, isOwner, currentUserId }: GroupCardProps) {
  const totalMembers = group._count.members + (isOwner ? 1 : 0) // Owner + members

  return (
    <Link 
      href={`/groups/${group.id}`}
      className="block bg-white overflow-hidden shadow-sm rounded-lg border hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900 truncate">
            {group.name}
          </h4>
          {isOwner && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Owner
            </span>
          )}
        </div>
        
        {group.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
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
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Created by {group.owner.name || group.owner.email}
        </div>
      </div>
    </Link>
  )
}