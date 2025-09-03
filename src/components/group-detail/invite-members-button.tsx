'use client'

import { useState } from 'react'
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components'
import { Mail, Plus } from 'lucide-react'
import { InviteMembersForm } from '@/components/invite-members-form'

interface InviteMembersButtonProps {
  groupId: string
  groupName: string
}

export function InviteMembersButton({ groupId, groupName }: InviteMembersButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Invite Members
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle>Invite Members to &quot;{groupName}&quot;</DialogTitle>
                <DialogDescription>
                  Send email invitations to add new members to your group. Invitations will expire in 7 days.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <InviteMembersForm 
            groupId={groupId}
            onSuccess={handleSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}