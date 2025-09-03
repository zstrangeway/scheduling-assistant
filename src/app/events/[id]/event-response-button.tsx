'use client'

import { useState } from 'react'
import { EventResponseForm } from '@/components/features/events'

interface EventResponseButtonProps {
  eventId: string
  currentResponse?: {
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE'
    comment?: string | null
  } | null
}

export function EventResponseButton({ eventId, currentResponse }: EventResponseButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = () => {
    setShowModal(false)
    // Refresh the page to show updated response
    window.location.reload()
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {currentResponse ? 'Update Response' : 'Respond to Event'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentResponse ? 'Update Your Response' : 'Respond to Event'}
              </h3>
              <p className="text-sm text-gray-500">
                Let others know about your availability for this event.
              </p>
            </div>
            <EventResponseForm 
              eventId={eventId}
              currentResponse={currentResponse}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </>
  )
}