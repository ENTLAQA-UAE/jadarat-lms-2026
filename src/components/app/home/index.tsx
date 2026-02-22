import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PerformanceCard from '@/components/app/home/dashboard/PerformanceCard';
// import GraphSection from './dashboard/graphSection';
import CardStatusSkeleton from './skeletonAdmin/CardsStatusSkeleton';
import { getOrganizationData } from '@/action/lms-admin/insights/general/generalAction';
import { get_organization_statistics } from '@/action/organization/organizationAction';
import CardSkeletonStatus from './skeletonAdmin/CardSkeletonStatus';
import { Activity, UserPlus, ShieldCheck, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const CardStatus = dynamic(() => import('@/app/dashboard/@lms_admin/insights/CardStatus'), {
  loading: () => <CardSkeletonStatus />,
});

const GraphSection = dynamic(() => import('./dashboard/graphSection'), {
  ssr: false
});

// Create separate components for each section
interface PerformanceSectionProps {
  data: {
    avgCompletionRate: number;
    activeEnrollments: number;
    avgCompletionDays: number;
  }
}

function PerformanceSection({ data }: PerformanceSectionProps) {
  return (
    <PerformanceCard
      progressBarContainerClassName="bg-background"
      completionRate={data.avgCompletionRate}
      enrollementsCount={data.activeEnrollments?.toLocaleString()}
      avgCompletionDays={data.avgCompletionDays}
      progressBarFillClassName="bg-success"
    />
  );
}

interface StatsCardsProps {
  data: {
    total_users: number;
    users_last_month: number;
    enrollments: number;
    enrollments_last_month: number;
    completed_courses: number;
    completed_courses_last_month: number;
    active_count: number;
    active_count_last_month: number;
  }
}

function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
      <CardStatus
        title="Users"
        icon={<Users className="h-4 w-4" />}
        number={data.total_users}
        percent={data.users_last_month}
      />
      <CardStatus
        title="Enrollments"
        icon={<UserPlus className="h-4 w-4" />}
        number={data.enrollments}
        percent={data.enrollments_last_month}
      />
      <CardStatus
        title="Completions"
        icon={<ShieldCheck className="h-4 w-4" />}
        number={data.completed_courses}
        percent={data.completed_courses_last_month}
      />
      <CardStatus
        title="Active This Month"
        icon={<Activity className="h-4 w-4" />}
        number={data.active_count}
        percent={data.active_count_last_month}
      />
    </div>
  );
}

function PerformanceLoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl max-h-[420px]">
      <CardHeader>
        <Skeleton shimmer className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-muted/30 p-4 flex items-center gap-4">
            <Skeleton shimmer className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton shimmer className="h-4 w-24" />
              <Skeleton shimmer className="h-7 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default async function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-4 md:gap-10 md:p-8 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your organization&apos;s learning activity.</p>
        </div>

        <section aria-label="Statistics overview">
          <Suspense fallback={<CardStatusSkeleton />}>
            <StatsSection />
          </Suspense>
        </section>

        <section aria-label="Charts and performance" className="grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <Suspense>
            <GraphSection />
          </Suspense>
          <Suspense fallback={<PerformanceLoadingSkeleton />}>
            <PerformanceDataSection />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

// Create separate async components for data fetching
async function StatsSection() {
  const statisticsData = await get_organization_statistics();
  return <StatsCards data={statisticsData} />;
}

async function PerformanceDataSection() {
  const organizationData = await getOrganizationData();
  return <PerformanceSection data={organizationData} />;
}
