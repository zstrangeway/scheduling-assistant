'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  FormField,
} from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Mail, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react'
import { useGroupDetailStore } from '@/stores/group-detail.store'
import { inviteMembersSchema, type InviteMembersInput } from '@/lib/validations/groups'

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
  const [successCount, setSuccessCount] = useState(0)
  const { inviteMembers, inviteLoading, inviteError } = useGroupDetailStore()

  const form = useForm({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: {
      emails: [{ email: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'emails'
  })

  const addEmailField = () => {
    append({ email: '' })
  }

  const removeEmailField = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const handleSubmit = async (data: InviteMembersInput) => {
    setSuccessCount(0)

    try {
      const emailStrings = data.emails.map(item => item.email)
      const result = await inviteMembers(groupId, emailStrings)
      setSuccessCount(result.successful)

      // Update form errors with any failures
      result.errors.forEach(({ email, error }: { email: string, error: string }) => {
        const fieldIndex = data.emails.findIndex(item => item.email.toLowerCase() === email.toLowerCase())
        if (fieldIndex !== -1) {
          form.setError(`emails.${fieldIndex}.email`, {
            type: 'manual',
            message: error
          })
        }
      })

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
    form.reset({ emails: [{ email: '' }] })
    setSuccessCount(0)
    onOpenChange(false)
  }

  const watchedEmails = form.watch('emails')
  const validEmailCount = watchedEmails.filter(item => item.email?.trim()).length

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

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {successCount > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully sent {successCount} invitation{successCount !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>
          )}

          {inviteError && (
            <Alert variant="destructive">
              <AlertDescription>{inviteError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Email Addresses</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start space-x-2">
                  <FormField
                    htmlFor={`emails.${index}.email`}
                    error={form.formState.errors.emails?.[index]?.email}
                    className="flex-1"
                  >
                    <Input
                      id={`emails.${index}.email`}
                      type="email"
                      {...form.register(`emails.${index}.email` as const)}
                      placeholder="Enter email address"
                      disabled={inviteLoading}
                    />
                  </FormField>
                  
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmailField(index)}
                      disabled={inviteLoading}
                      className="text-destructive hover:text-destructive mt-0"
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
              disabled={inviteLoading || fields.length >= 10}
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
              disabled={inviteLoading || !form.formState.isValid || validEmailCount === 0}
            >
              {inviteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send ${validEmailCount} Invitation${validEmailCount !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}