import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ProfileForm from './profile-form'
import { db } from '@/lib/db'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ownedGroups: true,
          memberships: true,
          createdEvents: true,
          responses: true,
        }
      }
    }
  })

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Profile Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              {user.image && (
                <Image
                  className="h-16 w-16 rounded-full"
                  src={user.image}
                  alt={user.name || 'User'}
                  width={64}
                  height={64}
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Groups owned:</span>
                <span className="font-medium text-gray-900">{user._count.ownedGroups}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Group memberships:</span>
                <span className="font-medium text-gray-900">{user._count.memberships}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Events created:</span>
                <span className="font-medium text-gray-900">{user._count.createdEvents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Event responses:</span>
                <span className="font-medium text-gray-900">{user._count.responses}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Personal Information
              </h3>
              <ProfileForm user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}