'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import useSWR from 'swr'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import {
  Book,
  BookOpen,
  ClipboardCheck,
  FileIcon,

  Home,
  Users,
  Clipboard,
  Activity,
  Percent,
} from 'lucide-react'
import SideNavMobile from '@/components/ui/SideNavMobile'

import { cn } from '@/lib/utils'
import CardSkeletonStatus from '@/components/app/home/skeletonAdmin/CardSkeletonStatus'
import { get_organization_statistics } from '@/action/organization/organizationAction'

const CardStatus = dynamic(() => import('@/app/dashboard/@lms_admin/insights/CardStatus'), {
  loading: () => <CardSkeletonStatus />,
})

type Data = Record<string, any>

interface Card {
  title: string
  icon?: React.ReactNode
  number: number
  percent: number
  trend?: 'up' | 'down'
}

interface NavLMSProps<T extends Data> {
  children: React.ReactNode
  data: T[]
  cardsData?: Card[]
}

const fetcher = (action: () => Promise<any>) => action()

const navigationItems = [
  { name: 'General', href: '/dashboard/insights/general', icon: Home },
  { name: 'Students', href: '/dashboard/insights/students', icon: Users },
  { name: 'Enrollments', href: '/dashboard/insights/enrollments', icon: Book },
  { name: 'Completions', href: '/dashboard/insights/completions', icon: FileIcon },
  { name: 'Courses', href: '/dashboard/insights/courses', icon: BookOpen },
  { name: 'Quiz Results', href: '/dashboard/insights/quiz-results', icon: ClipboardCheck },
]

export default function NavLMS<T extends Data>({ children, data }: NavLMSProps<T>) {
  const pathname = usePathname()

  const { data: statisticsData, isLoading } = useSWR(
    'get_organization_statistics',
    () => fetcher(get_organization_statistics),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  const navigation = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        icon: <item.icon className="mr-2 h-4 w-4" />,
      })),
    []
  )

  const renderCardStatus = useCallback(
    (title: string, icon: React.ReactNode, number: number, percent: number | null) => (
      <CardStatus
        title={title}
        icon={icon}
        number={number}
        percent={percent}
        loading={isLoading}
      />
    ),
    [isLoading]
  )

  return (
    <div className="flex min-h-0 w-full flex-col bg-background">
      {/* Sub-navigation tabs for Insights */}
      <header className="w-full flex flex-wrap items-center gap-2 border-b bg-card px-4 py-2 sm:py-3">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link key={item.name} href={item.href} prefetch={false}>
              <Button
                className="flex items-center gap-1"
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
              >
                {item.icon}
                {item.name}
              </Button>
            </Link>
          )
        })}
      </header>
      <main className="flex-grow p-4 sm:p-6 overflow-x-hidden">
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6',
            'xl:grid-cols-5'
          )}
        >
          {!isLoading ? (
            <>
              {pathname === '/dashboard/insights/courses' ? (
                <>
                  {renderCardStatus('Total Courses', <BookOpen />, statisticsData.total_courses, statisticsData.total_courses)}
                  {renderCardStatus('Total Categories', <Clipboard />, statisticsData.total_categories, statisticsData.total_categories)}
                </>
              ) : (
                <>
                  {renderCardStatus('User', <Users />, statisticsData.total_users, statisticsData.users_last_month)}
                  {renderCardStatus('Active This Month', <Activity />, statisticsData.active_count, statisticsData.active_count_last_month)}
                </>
              )}
              {renderCardStatus('Total Enrollments', <Book />, statisticsData.enrollments, statisticsData.enrollments_last_month)}
              {renderCardStatus('Total Completions', <Clipboard />, statisticsData.completed_courses, statisticsData.completed_courses_last_month)}
              {renderCardStatus('Average Completion Rate', <Percent />, statisticsData.completion_rate, null)}
            </>
          )
            : (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <CardSkeletonStatus key={i} />
                ))}
              </>
            )}
        </div>
        <div className="w-full overflow-x-auto">{children}</div>
      </main>
    </div>
  )
}