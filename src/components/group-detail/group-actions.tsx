'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components'
import { AlertTriangle } from 'lucide-react'
import { useGroupDetailStore } from '@/stores/group-detail.store'

interface GroupActionsProps {
  group: {
    id: string
    name: string
    ownerId: string
  }
  isOwner: boolean
  isMember: boolean
  currentUserId: string
}

export function GroupActions({ group, isOwner, isMember }: GroupActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { deleteGroup, leaveGroup } = useGroupDetailStore()

  const handleLeaveGroup = async () => {
    if (!isMember) return

    setIsLoading(true)
    try {
      await leaveGroup(group.id)
      router.push('/groups')
    } catch (error) {
      console.error('Error leaving group:', error)
      // In a real app, you'd show a toast notification here
      alert(error instanceof Error ? error.message : 'Failed to leave group')
    } finally {
      setIsLoading(false)
      setShowLeaveConfirm(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!isOwner) return

    setIsLoading(true)
    try {
      await deleteGroup(group.id)
      router.push('/groups')
    } catch (error) {
      console.error('Error deleting group:', error)
      // In a real app, you'd show a toast notification here
      alert(error instanceof Error ? error.message : 'Failed to delete group')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      {isOwner && (
        <Button variant="outline" asChild>
          <Link href={`/groups/${group.id}/settings`}>
            Edit Group
          </Link>
        </Button>
      )}
      
      {isMember && !isOwner && (
        <Button
          variant="outline"
          onClick={() => setShowLeaveConfirm(true)}
          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Leave Group
        </Button>
      )}

      {isOwner && (
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete Group
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Delete Group</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete &quot;{group.name}&quot;? This action cannot be undone. All events and member data will be permanently removed.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Confirmation Dialog */}
      <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <DialogTitle>Leave Group</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to leave &quot;{group.name}&quot;? You will need to be re-invited to rejoin this group.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveConfirm(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveGroup}
              disabled={isLoading}
            >
              {isLoading ? 'Leaving...' : 'Leave Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}