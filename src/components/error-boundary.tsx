'use client'

import { useEffect } from 'react'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error('Error boundary caught an error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">Something went wrong</h2>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          We encountered an unexpected error while loading this page. Please try again.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}