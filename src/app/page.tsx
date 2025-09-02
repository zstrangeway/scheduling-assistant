import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div>
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Coordinate schedules with your{' '}
            <span className="text-blue-600">groups</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Availability Helper makes it easy to schedule events and coordinate availability 
            within your groups. Create groups, invite members, and find the perfect time for everyone.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signin"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started
            </Link>
            <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div id="features" className="py-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Create Groups
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Organize your friends, family, or colleagues into groups for easy coordination.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Send Invitations
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Invite members to your groups via email with secure invitation links.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Schedule Events
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Create events and collect availability responses from all group members.
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}