'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface InviteMembersFormProps {
  groupId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function InviteMembersForm({ groupId, onSuccess, onCancel }: InviteMembersFormProps) {
  const [emails, setEmails] = useState([''])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const router = useRouter()

  const addEmailField = () => {
    setEmails([...emails, ''])
  }

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index))
      setErrors(errors.filter((_, i) => i !== index))
    }
  }

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
    
    // Clear error for this field when user starts typing
    if (errors[index]) {
      const newErrors = [...errors]
      newErrors[index] = ''
      setErrors(newErrors)
    }
  }

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const newErrors: string[] = []
    const validEmails: string[] = []

    emails.forEach((email, index) => {
      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        newErrors[index] = 'Email is required'
      } else if (!emailRegex.test(trimmedEmail)) {
        newErrors[index] = 'Please enter a valid email address'
      } else {
        newErrors[index] = ''
        if (!validEmails.includes(trimmedEmail.toLowerCase())) {
          validEmails.push(trimmedEmail.toLowerCase())
        }
      }
    })

    // Check for duplicates
    const emailCounts = new Map()
    emails.forEach((email, index) => {
      const trimmedEmail = email.trim().toLowerCase()
      if (trimmedEmail && emailRegex.test(trimmedEmail)) {
        if (emailCounts.has(trimmedEmail)) {
          newErrors[index] = 'Duplicate email address'
          newErrors[emailCounts.get(trimmedEmail)] = 'Duplicate email address'
        }
        emailCounts.set(trimmedEmail, index)
      }
    })

    setErrors(newErrors)
    return validEmails
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validEmails = validateEmails()
    
    if (validEmails.length === 0) {
      return
    }

    setIsLoading(true)
    setSuccessCount(0)

    try {
      const results = await Promise.allSettled(
        validEmails.map(email =>
          fetch(`/api/groups/${groupId}/invites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          }).then(async response => {
            const data = await response.json()
            if (!response.ok) {
              throw new Error(data.error || 'Failed to send invitation')
            }
            return { email, success: true }
          }).catch(error => ({
            email,
            success: false,
            error: error.message
          }))
        )
      )

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length

      setSuccessCount(successful)

      // Update errors with any failures
      const newErrors = [...errors]
      validEmails.forEach((email, emailIndex) => {
        const result = results[emailIndex]
        if (result.status === 'fulfilled' && !result.value.success) {
          // Find the original index of this email
          const originalIndex = emails.findIndex(e => e.trim().toLowerCase() === email)
          if (originalIndex !== -1) {
            newErrors[originalIndex] = result.value.error
          }
        }
      })
      setErrors(newErrors)

      if (successful > 0) {
        router.refresh() // Refresh to show updated invitation list
        
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hasValidEmails = emails.some(email => email.trim())
  const hasErrors = errors.some(error => error)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successCount > 0 && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Successfully sent {successCount} invitation{successCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Email Addresses
        </label>
        <div className="space-y-3">
          {emails.map((email, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="Enter email address"
                  disabled={isLoading}
                  className={`block w-full rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors[index] 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors[index] && (
                  <p className="mt-1 text-xs text-red-600">{errors[index]}</p>
                )}
              </div>
              
              {emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmailField(index)}
                  disabled={isLoading}
                  className="inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={addEmailField}
          disabled={isLoading || emails.length >= 10}
          className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Another Email
        </button>
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
          disabled={isLoading || !hasValidEmails || hasErrors}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending Invitations...
            </>
          ) : (
            `Send ${emails.filter(e => e.trim()).length} Invitation${emails.filter(e => e.trim()).length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </form>
  )
}