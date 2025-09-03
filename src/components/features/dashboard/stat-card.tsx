import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  bgColor: string
  iconColor: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  bgColor,
  iconColor,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center p-6">
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium">{value}</dd>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}