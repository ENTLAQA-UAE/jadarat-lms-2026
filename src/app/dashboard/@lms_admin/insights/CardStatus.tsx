import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
  const isPositive = typeof formattedPercent === 'number' && formattedPercent > 0
  const isNegative = typeof formattedPercent === 'number' && formattedPercent < 0

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <Card className="group relative overflow-hidden card-hover">
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          aria-label={`${title} icon`}
          role="img"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-300"
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight">
          {title === 'Average Completion Rate' ? `${formattedNumber}%` : formattedNumber.toLocaleString()}
        </div>
        {percent !== null && (
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isPositive
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : isNegative
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {formattedPercent !== 'N/A' ? (
                <>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : isNegative ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {isPositive ? '+' : ''}{formattedPercent}% from last month
                </>
              ) : (
                'No data available'
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton shimmer className="h-5 w-1/2" />
        <Skeleton shimmer className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton shimmer className="h-8 w-20" />
          <Skeleton shimmer className="h-5 w-32 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default CardStatus
