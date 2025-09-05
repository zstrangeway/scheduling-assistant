'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Button,
  Input,
  Textarea,
  FormField,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react'
import { useGroupDetailStore } from '@/stores/group-detail.store'
import { editEventSchema, type EditEventInput } from '@/lib/validations'

interface EditEventFormProps {
  eventId: string
  initialData: {
    title: string
    description?: string | null
    startTime: string
    endTime: string
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function EditEventForm({ eventId, initialData, onSuccess, onCancel }: EditEventFormProps) {
  const { updateEvent, eventLoading, eventError } = useGroupDetailStore()

  const form = useForm({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description || undefined,
      startTime: initialData.startTime,
      endTime: initialData.endTime,
    }
  })

  // Reset form when initialData changes
  useEffect(() => {
    form.reset({
      title: initialData.title,
      description: initialData.description || undefined,
      startTime: initialData.startTime,
      endTime: initialData.endTime,
    })
  }, [initialData, form])

  const handleSubmit = async (data: EditEventInput) => {
    try {
      await updateEvent(eventId, data)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {eventError && (
        <Alert variant="destructive">
          <AlertDescription>{eventError}</AlertDescription>
        </Alert>
      )}

      <FormField
        label="Event Title"
        required
        htmlFor="title"
        error={form.formState.errors.title}
      >
        <Input
          id="title"
          {...form.register('title')}
          placeholder="Enter event title"
          disabled={eventLoading}
        />
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
          placeholder="Enter event description (optional)"
          disabled={eventLoading}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Start Date & Time"
          required
          error={form.formState.errors.startTime}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={eventLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('startTime') ? format(new Date(form.watch('startTime')), 'PPP p') : 'Select start date & time'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch('startTime') ? new Date(form.watch('startTime')) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const existingDateTime = form.getValues('startTime') ? new Date(form.getValues('startTime')) : new Date()
                    date.setHours(existingDateTime.getHours(), existingDateTime.getMinutes())
                    form.setValue('startTime', date.toISOString())
                  }
                }}
                autoFocus
              />
              {form.watch('startTime') && (
                <div className="p-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={new Date(form.watch('startTime')).toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const currentDate = new Date(form.watch('startTime'))
                        currentDate.setHours(parseInt(hours), parseInt(minutes))
                        form.setValue('startTime', currentDate.toISOString())
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </FormField>

        <FormField
          label="End Date & Time"
          required
          error={form.formState.errors.endTime}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={eventLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('endTime') ? format(new Date(form.watch('endTime')), 'PPP p') : 'Select end date & time'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch('endTime') ? new Date(form.watch('endTime')) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const startTime = form.getValues('startTime') ? new Date(form.getValues('startTime')) : new Date()
                    const existingEndTime = form.getValues('endTime') ? new Date(form.getValues('endTime')) : new Date(startTime.getTime() + 60 * 60 * 1000)
                    date.setHours(existingEndTime.getHours(), existingEndTime.getMinutes())
                    form.setValue('endTime', date.toISOString())
                  }
                }}
                disabled={(date) => {
                  const startDate = form.getValues('startTime') ? new Date(form.getValues('startTime')) : new Date()
                  return date < startDate
                }}
                autoFocus
              />
              {form.watch('endTime') && (
                <div className="p-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={new Date(form.watch('endTime')).toTimeString().slice(0, 5)}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':')
                        const currentDate = new Date(form.watch('endTime'))
                        currentDate.setHours(parseInt(hours), parseInt(minutes))
                        form.setValue('endTime', currentDate.toISOString())
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </FormField>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={eventLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={eventLoading}
        >
          {eventLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Event'
          )}
        </Button>
      </div>
    </form>
  )
}