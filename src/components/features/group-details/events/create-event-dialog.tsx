'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { createEventSchema, type CreateEventInput } from '@/lib/validations'

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  onEventCreated?: () => void
}

export function CreateEventDialog({ 
  open, 
  onOpenChange, 
  groupId,
  onEventCreated
}: CreateEventDialogProps) {
  const { createEvent, eventLoading, eventError } = useGroupDetailStore()
  
  const form = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      description: undefined,
      startTime: '',
      endTime: '',
    }
  })

  const handleSubmit = async (data: CreateEventInput) => {
    try {
      await createEvent(groupId, data)
      handleSuccess()
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  const handleSuccess = () => {
    if (onEventCreated) {
      onEventCreated()
    }
    handleClose()
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Schedule a new event for your group members to respond to.
          </DialogDescription>
        </DialogHeader>

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
                        // Set to current time if no time selected yet, or preserve existing time
                        const existingDateTime = form.getValues('startTime') ? new Date(form.getValues('startTime')) : new Date()
                        date.setHours(existingDateTime.getHours(), existingDateTime.getMinutes())
                        form.setValue('startTime', date.toISOString())
                      }
                    }}
                    disabled={(date) => date < new Date()}
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
                        // Set to 1 hour after start time, or preserve existing time
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
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={eventLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={eventLoading}
            >
              {eventLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}