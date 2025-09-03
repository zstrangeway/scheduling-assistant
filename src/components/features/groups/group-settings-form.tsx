'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useGroupDetailStore } from '@/stores/group-detail.store'
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Textarea,
  FormField,
} from '@/components/ui'
import { updateGroupSchema, type UpdateGroupInput } from '@/lib/validations'

interface GroupSettingsFormProps {
  groupId: string
}

interface FormMessage {
  type: 'success' | 'error'
  text: string
}

export function GroupSettingsForm({ groupId }: GroupSettingsFormProps) {
  const { group, updateGroup } = useGroupDetailStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<FormMessage | null>(null)

  const form = useForm({
    resolver: zodResolver(updateGroupSchema),
    defaultValues: {
      name: '',
      description: undefined,
    }
  })

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name || '',
        description: group.description || undefined,
      })
    }
  }, [group, form])

  if (!group) return null

  const handleSubmit = async (data: UpdateGroupInput) => {
    setIsLoading(true)
    setMessage(null)

    try {
      await updateGroup(groupId, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      })

      setMessage({ type: 'success', text: 'Group updated successfully!' })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update group',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const watchedValues = form.watch()
  const hasChanges =
    watchedValues.name?.trim() !== group.name ||
    (watchedValues.description?.trim() || '') !== (group.description || '')

  const isOwner = group.isOwner

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <FormField
        label="Group Name"
        required
        htmlFor="name"
        error={form.formState.errors.name}
      >
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Enter group name"
          disabled={isLoading || !isOwner}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {form.watch('name')?.length || 0}/100 characters
        </p>
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={form.formState.errors.description}
      >
        <Textarea
          id="description"
          {...form.register('description')}
          rows={3}
          placeholder="Optional description for your group"
          disabled={isLoading || !isOwner}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {form.watch('description')?.length || 0}/500 characters
        </p>
      </FormField>

      {!isOwner && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Only the group owner can modify these settings.
          </AlertDescription>
        </Alert>
      )}

      {isOwner && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !hasChanges || !form.formState.isValid}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  )
}