import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PerformanceCard from '@/components/app/home/dashboard/PerformanceCard';
// import GraphSection from './dashboard/graphSection';
import CardStatusSkeleton from './skeletonAdmin/CardsStatusSkeleton';
import { getOrganizationData } from '@/action/lms-admin/insights/general/generalAction';
import { get_organization_statistics } from '@/action/organization/organizationAction';
import CardSkeletonStatus from './skeletonAdmin/CardSkeletonStatus';
import { Activity, Users } from 'lucide-react';

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
      progressBarFillClassName="bg-green-300"
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      <CardStatus
        title="User"
        icon={<Users />}
        number={data.total_users}
        percent={data.users_last_month}
      />
      <CardStatus
        title="Enrollments"
        icon={<Users />}
        number={data.enrollments}
        percent={data.enrollments_last_month}
      />
      <CardStatus
        title="Completion"
        icon={<Activity />}
        number={data.completed_courses}
        percent={data.completed_courses_last_month}
      />
      <CardStatus
        title="Active This Month"
        icon={<Activity />}
        number={data.active_count}
        percent={data.active_count_last_month}
      />
    </div>
  );
}

export default async function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 overflow-hidden">
        <Suspense fallback={<CardStatusSkeleton />}>
          <StatsSection />
        </Suspense>

        <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <Suspense>
            <GraphSection />
          </Suspense>
          <Suspense fallback={<div>Loading performance data...</div>}>
            <PerformanceDataSection />
          </Suspense>
        </div>
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
