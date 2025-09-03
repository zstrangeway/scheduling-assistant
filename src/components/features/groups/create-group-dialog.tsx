'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from '@/components/ui'
import { Alert, AlertDescription } from '@/components/ui'
import { Users, Loader2 } from 'lucide-react'
import { useGroupsStore } from '@/stores/groups.store'
import { createGroupSchema, type CreateGroupInput } from '@/lib/validations'

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { createGroup, createLoading, createError } = useGroupsStore()

  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: undefined,
    }
  })

  const handleSubmit = async (data: CreateGroupInput) => {
    const result = await createGroup({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    })

    if (result) {
      handleClose()
    }
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a new group to coordinate schedules with friends, family, or colleagues.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {createError && (
            <Alert variant="destructive">
              <AlertDescription>{createError}</AlertDescription>
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
              maxLength={100}
              disabled={createLoading}
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
              placeholder="Optional description for your group"
              maxLength={500}
              rows={3}
              disabled={createLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.watch('description')?.length || 0}/500 characters
            </p>
          </FormField>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLoading || !form.formState.isValid}
            >
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}