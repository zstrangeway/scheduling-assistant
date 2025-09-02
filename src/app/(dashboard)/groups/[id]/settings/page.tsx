import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { GroupSettingsForm } from './group-settings-form'

interface GroupSettingsPageProps {
  params: {
    id: string
  }
}

export default async function GroupSettingsPage({ params }: GroupSettingsPageProps) {
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
            some: { 
              userId: session.user.id,
              role: { in: ['OWNER', 'ADMIN'] }
            } 
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
        }
      },
      _count: {
        select: {
          members: true,
          events: true,
        }
      }
    }
  })

  if (!group) {
    notFound()
  }

  const isOwner = group.owner.id === session.user.id

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center">
          <Link 
            href={`/groups/${group.id}`} 
            className="text-gray-500 hover:text-gray-700 mr-3"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Group Settings
          </h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Configure settings for &quot;{group.name}&quot;
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Basic Information
          </h3>
          <GroupSettingsForm group={group} isOwner={isOwner} />
        </div>
      </div>

      {/* Danger Zone - Only show to owners */}
      {isOwner && (
        <div className="bg-white shadow rounded-lg border-red-200 border">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-red-900 mb-4">
              Danger Zone
            </h3>
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Delete Group
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Once you delete a group, there is no going back. Please be certain. All events, members, and data will be permanently deleted.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/groups/${group.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Go back to group to delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}