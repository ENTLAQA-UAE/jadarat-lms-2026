import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ReactNode } from 'react'

interface CardStatusProps {
  title: string
  icon: ReactNode
  number: number
  percent: string | number | null
  loading?: boolean
}

function CardStatus({ title, icon, number, percent, loading }: CardStatusProps) {
  const formattedNumber = number ?? 0
  const formattedPercent = typeof percent === 'number' ? percent : 'N/A'
  const isPositive = typeof formattedPercent === 'number' && formattedPercent >= 0

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div aria-label={`${title} icon`} role="img">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {title === 'Average Completion Rate' ? `${formattedNumber}%` : formattedNumber}
        </div>
        {percent !== null && (
          <p className="text-xs text-muted-foreground">
            {formattedPercent !== 'N/A'
              ? `${isPositive ? '+' : ''}${formattedPercent} from last month`
              : 'No data available from last month'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-5" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatus