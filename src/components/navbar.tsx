'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {session.user?.image && (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                    />
                  )}
                  <span>{session.user?.name}</span>
                  <svg
                    className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
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