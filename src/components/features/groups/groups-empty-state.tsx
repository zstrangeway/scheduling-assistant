import { Users, Plus } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'

interface GroupsEmptyStateProps {
  onCreateGroup: () => void
}

export function GroupsEmptyState({ onCreateGroup }: GroupsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">No groups yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first group.
        </p>
        <div className="mt-6">
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}