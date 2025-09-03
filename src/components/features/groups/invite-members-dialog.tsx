'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
} from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Mail, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { useGroupDetailStore } from '@/stores/group-detail.store'

interface InviteMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
}

export function InviteMembersDialog({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName 
}: InviteMembersDialogProps) {
  const [emails, setEmails] = useState([''])
  const [errors, setErrors] = useState<string[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const { inviteMembers, inviteLoading, inviteError } = useGroupDetailStore()

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

    setSuccessCount(0)

    try {
      const result = await inviteMembers(groupId, validEmails)
      setSuccessCount(result.successful)

      // Update errors with any failures
      const newErrors = [...errors]
      result.errors.forEach(({ email, error }) => {
        const originalIndex = emails.findIndex(e => e.trim().toLowerCase() === email.toLowerCase())
        if (originalIndex !== -1) {
          newErrors[originalIndex] = error
        }
      })
      setErrors(newErrors)

      if (result.successful > 0) {
        // Close dialog after successful invitations
        setTimeout(() => {
          handleClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error sending invitations:', error)
    }
  }

  const handleClose = () => {
    setEmails([''])
    setErrors([])
    setSuccessCount(0)
    onOpenChange(false)
  }

  const hasValidEmails = emails.some(email => email.trim())
  const hasErrors = errors.some(error => error)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>
            Invite Members to &quot;{groupName}&quot;
          </DialogTitle>
          <DialogDescription>
            Send email invitations to add new members to your group.
            Invitations will expire in 7 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {successCount > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully sent {successCount} invitation{successCount !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Email Addresses</Label>
            <div className="space-y-3">
              {emails.map((email, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      placeholder="Enter email address"
                      disabled={inviteLoading}
                      className={errors[index] ? 'border-destructive' : ''}
                    />
                    {errors[index] && (
                      <p className="mt-1 text-xs text-destructive">{errors[index]}</p>
                    )}
                  </div>
                  
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmailField(index)}
                      disabled={inviteLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              disabled={inviteLoading || emails.length >= 10}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Email
            </Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={inviteLoading || !hasValidEmails || hasErrors}
            >
              {inviteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${emails.filter(e => e.trim()).length} Invitation${emails.filter(e => e.trim()).length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}