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
  Textarea,
} from '@/components/ui'
import { Users, AlertCircle, Loader2 } from 'lucide-react'
import { useGroupsStore } from '@/stores/groups.store'

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { createGroup, createLoading, createError } = useGroupsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createGroup({
      name: name.trim(),
      description: description.trim() || undefined,
    })

    if (result) {
      setName('')
      setDescription('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setDescription('')
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {createError && (
            <div className="rounded-md bg-destructive/15 p-3 border border-destructive/20">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                <p className="text-sm text-destructive">{createError}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              maxLength={100}
              required
              disabled={createLoading}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for your group"
              maxLength={500}
              rows={3}
              disabled={createLoading}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLoading || !name.trim()}
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