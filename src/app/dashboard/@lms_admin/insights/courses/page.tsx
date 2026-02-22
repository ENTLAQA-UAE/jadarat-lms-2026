import dynamic from 'next/dynamic';
import InsightsCourse from './InsightsCourse';
import NavLMS from '@/hoc/nav-lms.hoc';
import { fetchCoursesByCategory, fetchCoursesPerMonth, fetchCourseStatusCounts } from '@/action/lms-admin/insights/courses/coursesAction';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
// import CoursesDataInsightsTablePage from './@table/page';
const CoursesDataInsightsTablePage = dynamic(() => import('./@table/page'), {
  loading: (loadingProps) => loadingProps.isLoading ? <TableSkeleton /> : null
})



export default async function InsightPage({ searchParams }: { searchParams: { page?: string , course?: string , department?: string } }) {
  // Fetch data for charts
  const [
    { loading: pieChartLoading, data: pieChartData, errorMessage: pieChartError },
    { loading: barChartLoading, data: barChartData, errorMessage: barChartError },
    courseStatusData,
  ] = await Promise.all([
    fetchCoursesByCategory(),
    fetchCoursesPerMonth(),
    fetchCourseStatusCounts(),
  ]);

  return (
    <div className="flex flex-col">
      <NavLMS data={[]}>
        <InsightsCourse
          barChartData={barChartData}
          pieChartData={pieChartData}
          barChartDataLoading={barChartLoading}
          pieChartDataLoading={pieChartLoading}
          pieChartError={pieChartError}
          barChartError={barChartError}
          courseStatusData={courseStatusData}
        />
        <CoursesDataInsightsTablePage searchParams={searchParams} />
      </NavLMS>
    </div>
  );
}
