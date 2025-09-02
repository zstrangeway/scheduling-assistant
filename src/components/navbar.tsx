'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function Navbar() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Availability Helper
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Availability Helper
            </Link>
            
            {session && (
              <div className="ml-10 flex space-x-8">
                <Link 
                  href="/dashboard" 
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/groups" 
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Groups
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <div className="flex items-center space-x-3">
                  {session.user?.image && (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {session.user?.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/signin"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}