import Link from 'next/link'
import { Users, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface Group {
  id: string
  name: string
  description?: string | null
  owner: {
    id: string
    name?: string | null
    email: string
  }
  _count: {
    members: number
    events: number
  }
  createdAt: Date | string
}

interface GroupCardProps {
  group: Group
  isOwner: boolean
  currentUserId: string
}

export function GroupCard({ group, isOwner }: GroupCardProps) {
  const totalMembers = group._count.members + (isOwner ? 1 : 0) // Owner + members

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium truncate">{group.name}</h4>
            {isOwner && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Owner
              </span>
            )}
          </div>

          {group.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {group.description}
            </p>
          )}

          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {totalMembers} member{totalMembers !== 1 ? "s" : ""}
            </div>

            <div className="ml-4 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {group._count.events} event{group._count.events !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Created by {group.owner.name || group.owner.email}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}