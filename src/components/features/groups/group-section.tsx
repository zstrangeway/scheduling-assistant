import { GroupCard } from './group-card'

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

interface GroupSectionProps {
  title: string
  groups: Group[]
  currentUserId: string
}

export function GroupSection({
  title,
  groups,
  currentUserId,
}: GroupSectionProps) {
  if (groups.length === 0) return null

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">
        {title} ({groups.length})
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isOwner={group.owner.id === currentUserId}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  )
}