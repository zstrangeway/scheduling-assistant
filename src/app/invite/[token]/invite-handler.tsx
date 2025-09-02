'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InviteHandlerProps {
  token: string
  invite: {
    id: string
    email: string
    group: {
      id: string
      name: string
      description?: string
    }
    sender: {
      name?: string
      email: string
    }
  }
}

export function InviteHandler({ token, invite }: InviteHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{
    type: 'success' | 'error'
    message: string
    groupId?: string
    alreadyMember?: boolean
  } | null>(null)
  const router = useRouter()

  const handleInvitation = async (action: 'accept' | 'decline') => {
    setIsProcessing(true)
    setResult(null)

    try {
      const response = await fetch(`/api/invites/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process invitation')
      }

      if (action === 'accept') {
        setResult({
          type: 'success',
          message: data.alreadyMember 
            ? 'You are already a member of this group!' 
            : 'Welcome to the group!',
          groupId: data.groupId,
          alreadyMember: data.alreadyMember
        })

        // Redirect to the group page after a short delay
        setTimeout(() => {
          router.push(`/groups/${data.groupId}`)
        }, 2000)
      } else {
        setResult({
          type: 'success',
          message: 'Invitation declined.'
        })

        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Error processing invitation:', error)
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to process invitation'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (result) {
    return (
      <div className="mt-6">
        <div className={`rounded-md p-4 ${
          result.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                result.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.type === 'success' && result.groupId && !result.alreadyMember && (
                <p className="mt-1 text-xs text-green-700">
                  Redirecting you to the group...
                </p>
              )}
              {result.type === 'success' && result.message.includes('declined') && (
                <p className="mt-1 text-xs text-green-700">
                  Redirecting you to home...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleInvitation('accept')}
            disabled={isProcessing}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Accept Invitation
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleInvitation('decline')}
            disabled={isProcessing}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Decline Invitation'}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        This invitation was sent to {invite.email}. Make sure you&apos;re signed in with the correct account.
      </p>
    </div>
  )
}