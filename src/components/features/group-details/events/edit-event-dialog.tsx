'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { EditEventForm } from './edit-event-form'

interface EditEventDialogProps {
  eventId: string
  eventData: {
    title: string
    description?: string | null
    startTime: string
    endTime: string
  }
  children: React.ReactNode
  onEventUpdated?: () => void
}

export function EditEventDialog({ eventId, eventData, children, onEventUpdated }: EditEventDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onEventUpdated) {
      onEventUpdated()
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <EditEventForm
          eventId={eventId}
          initialData={eventData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}