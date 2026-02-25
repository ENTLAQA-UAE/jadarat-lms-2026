import StatsCard from '@/components/shared/StatsCard'
import { ReactNode } from 'react'

interface CardStatusProps {
  title: string
  icon: ReactNode
  number: number
  percent: string | number | null
  loading?: boolean
}

/**
 * Color-code stats cards by title for visual variety.
 */
function getColorForTitle(title: string) {
  if (title.includes('User') || title.includes('Student')) return 'primary' as const
  if (title.includes('Active')) return 'sky' as const
  if (title.includes('Enrollment')) return 'accent' as const
  if (title.includes('Completion') || title.includes('Complete')) return 'golden' as const
  if (title.includes('Course')) return 'primary' as const
  if (title.includes('Categor')) return 'sky' as const
  if (title.includes('Rate') || title.includes('Average')) return 'success' as const
  return 'primary' as const
}

function CardStatus({ title, icon, number, percent, loading }: CardStatusProps) {
  const formattedValue = title === 'Average Completion Rate'
    ? `${(number ?? 0)}%`
    : (number ?? 0)

  const trend = percent !== null && percent !== undefined && typeof percent === 'number'
    ? { value: percent }
    : null

  return (
    <StatsCard
      title={title}
      value={formattedValue}
      icon={icon}
      trend={trend}
      color={getColorForTitle(title)}
      loading={loading}
    />
  )
}

export default CardStatus
