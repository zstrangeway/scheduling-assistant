import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { InviteHandler } from './invite-handler'

interface InvitePageProps {
  params: {
    token: string
  }
}

async function getInviteDetails(token: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/invites/${token}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      return { error: errorData.error, status: errorData.status }
    }
    
    const data = await response.json()
    return { invite: data.invite }
  } catch (error) {
    console.error('Error fetching invite:', error)
    return { error: 'Failed to load invitation' }
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await getServerSession(authOptions)
  
  const { invite, error, status } = await getInviteDetails(params.token)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {status === 'EXPIRED' ? 'Invitation Expired' : 'Invalid Invitation'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-blue-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in Required
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You need to sign in to accept this invitation to join &quot;{invite.group.name}&quot;.
            </p>
            <div className="mt-6 space-y-3">
              <p className="text-xs text-gray-500">
                Invitation sent to: {invite.email}
              </p>
              <Link
                href={`/signin?callbackUrl=${encodeURIComponent(`/invite/${params.token}`)}`}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-green-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Group Invitation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You&apos;ve been invited to join &quot;{invite.group.name}&quot;
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg px-6 py-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{invite.group.name}</h3>
              {invite.group.description && (
                <p className="mt-1 text-sm text-gray-600">{invite.group.description}</p>
              )}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="space-y-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Invited by</dt>
                  <dd className="text-sm text-gray-900">{invite.sender.name || invite.sender.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Invitation sent to</dt>
                  <dd className="text-sm text-gray-900">{invite.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Expires</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(invite.expiresAt).toLocaleDateString()} at {new Date(invite.expiresAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <InviteHandler token={params.token} invite={invite} />
        </div>
      </div>
    </div>
  )
}