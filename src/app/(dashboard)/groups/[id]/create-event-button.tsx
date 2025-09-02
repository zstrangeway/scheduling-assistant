'use client'

import { useState } from 'react'
import { CreateEventForm } from '@/components/create-event-form'

interface CreateEventButtonProps {
  groupId: string
  onEventCreated?: () => void
}

export function CreateEventButton({ groupId, onEventCreated }: CreateEventButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const handleSuccess = () => {
    setShowModal(false)
    if (onEventCreated) {
      onEventCreated()
    }
    // Refresh the page to show the new event
    window.location.reload()
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Event
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Event</h3>
              <p className="text-sm text-gray-500">Schedule a new event for your group members to respond to.</p>
            </div>
            <CreateEventForm 
              groupId={groupId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </>
  )
}