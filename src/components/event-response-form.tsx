'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventResponseFormProps {
  eventId: string
  currentResponse?: {
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
    comment?: string | null
  } | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function EventResponseForm({ eventId, currentResponse, onSuccess, onCancel }: EventResponseFormProps) {
  const [status, setStatus] = useState<'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'>(
    currentResponse?.status || 'AVAILABLE'
  )
  const [comment, setComment] = useState(currentResponse?.comment || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comment: comment.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save response')
      }

      router.refresh()
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving response:', error)
      setError(error instanceof Error ? error.message : 'Failed to save response')
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    {
      value: 'AVAILABLE' as const,
      label: 'Available',
      description: 'I can attend this event',
      color: 'text-green-700 bg-green-100 border-green-300 hover:bg-green-200',
      activeColor: 'ring-green-500 border-green-500 bg-green-50'
    },
    {
      value: 'MAYBE' as const,
      label: 'Maybe',
      description: 'I might be able to attend',
      color: 'text-yellow-700 bg-yellow-100 border-yellow-300 hover:bg-yellow-200',
      activeColor: 'ring-yellow-500 border-yellow-500 bg-yellow-50'
    },
    {
      value: 'UNAVAILABLE' as const,
      label: 'Unavailable',
      description: 'I cannot attend this event',
      color: 'text-red-700 bg-red-100 border-red-300 hover:bg-red-200',
      activeColor: 'ring-red-500 border-red-500 bg-red-50'
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="text-base font-medium text-gray-900">Your availability</label>
        <p className="text-sm leading-5 text-gray-500">
          Let others know whether you can attend this event.
        </p>
        <fieldset className="mt-4">
          <legend className="sr-only">Availability status</legend>
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <div key={option.value} className="relative">
                <input
                  id={option.value}
                  name="status"
                  type="radio"
                  value={option.value}
                  checked={status === option.value}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  disabled={isLoading}
                  className="sr-only"
                />
                <label
                  htmlFor={option.value}
                  className={`relative block cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none ${
                    status === option.value
                      ? `ring-2 ring-offset-2 ${option.activeColor}`
                      : `border-gray-300 ${option.color} hover:shadow-md`
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-gray-500">{option.description}</div>
                      </div>
                    </div>
                    <div
                      className={`h-4 w-4 rounded-full border ${
                        status === option.value ? 'border-transparent bg-current' : 'border-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment (optional)
        </label>
        <div className="mt-1">
          <textarea
            id="comment"
            name="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isLoading}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Add any additional notes about your availability..."
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          You can add context or conditions about your availability.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {currentResponse ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            currentResponse ? 'Update Response' : 'Save Response'
          )}
        </button>
      </div>
    </form>
  )
}