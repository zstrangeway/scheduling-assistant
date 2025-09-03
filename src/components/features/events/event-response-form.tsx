'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Button,
  Label,
  Textarea,
  FormField,
} from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Loader2 } from 'lucide-react'
import { useEventsStore } from '@/stores/events.store'
import { eventResponseSchema, type EventResponseInput } from '@/lib/validations'

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
  const { respondToEvent, responseLoading, responseError } = useEventsStore()
  const router = useRouter()

  const form = useForm({
    resolver: zodResolver(eventResponseSchema),
    defaultValues: {
      status: currentResponse?.status || 'AVAILABLE' as const,
      comment: currentResponse?.comment || undefined,
    }
  })

  // Reset form when currentResponse changes
  useEffect(() => {
    form.reset({
      status: currentResponse?.status || 'AVAILABLE' as const,
      comment: currentResponse?.comment || undefined,
    })
  }, [currentResponse, form])

  const handleSubmit = async (data: EventResponseInput) => {
    try {
      await respondToEvent(eventId, {
        status: data.status,
        comment: data.comment?.trim() || undefined,
      })
      router.refresh()
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving response:', error)
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {responseError && (
        <Alert variant="destructive">
          <AlertDescription>{responseError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label className="text-base font-medium">Your availability</Label>
        <p className="text-sm text-muted-foreground">
          Let others know whether you can attend this event.
        </p>
        <div className="space-y-3 mt-4">
          {statusOptions.map((option) => (
            <div key={option.value} className="relative">
              <input
                id={option.value}
                type="radio"
                {...form.register('status')}
                value={option.value}
                checked={form.watch('status') === option.value}
                disabled={responseLoading}
                className="sr-only"
              />
              <Label
                htmlFor={option.value}
                className={`relative flex cursor-pointer rounded-lg border px-6 py-4 shadow-sm focus:outline-none ${
                  form.watch('status') === option.value
                    ? `ring-2 ring-offset-2 ${option.activeColor}`
                    : `border-border hover:shadow-md`
                } ${responseLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      form.watch('status') === option.value ? 'border-transparent bg-primary' : 'border-border'
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <FormField
        label="Comment (optional)"
        htmlFor="comment"
        error={form.formState.errors.comment}
      >
        <Textarea
          id="comment"
          {...form.register('comment')}
          rows={3}
          disabled={responseLoading}
          placeholder="Add any additional notes about your availability..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          You can add context or conditions about your availability.
        </p>
      </FormField>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={responseLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={responseLoading || !form.formState.isValid}
        >
          {responseLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {currentResponse ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            currentResponse ? 'Update Response' : 'Save Response'
          )}
        </Button>
      </div>
    </form>
  )
}