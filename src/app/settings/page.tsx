import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Account Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Information Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Profile Information</h4>
                  <p className="text-sm text-gray-500">Update your name and profile details</p>
                </div>
                <a
                  href="/profile"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Notification Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-invites"
                    name="email-invites"
                    type="checkbox"
                    defaultChecked
                    disabled
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-invites" className="font-medium text-gray-700">
                    Group Invitations
                  </label>
                  <p className="text-gray-500">Receive email notifications for group invitations</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-events"
                    name="email-events"
                    type="checkbox"
                    defaultChecked
                    disabled
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-events" className="font-medium text-gray-700">
                    Event Notifications
                  </label>
                  <p className="text-gray-500">Receive email notifications for new events</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="email-reminders"
                    name="email-reminders"
                    type="checkbox"
                    defaultChecked
                    disabled
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="email-reminders" className="font-medium text-gray-700">
                    Event Reminders
                  </label>
                  <p className="text-gray-500">Receive email reminders for upcoming events</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                ℹ️ Notification preferences will be implemented in a future update.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Account Data</h4>
                  <p className="text-sm text-gray-500">Your account is secured with Google OAuth</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Secure
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Data Export</h4>
                  <p className="text-sm text-gray-500">Export your personal data and activity</p>
                </div>
                <button
                  disabled
                  className="bg-gray-100 text-gray-400 cursor-not-allowed px-3 py-2 rounded-md text-sm font-medium"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}