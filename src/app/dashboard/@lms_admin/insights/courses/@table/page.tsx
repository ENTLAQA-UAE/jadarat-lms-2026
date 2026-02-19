import { fetchAllCourses } from '@/action/lms-admin/insights/courses/coursesAction';
import CourseTable from '../CoruseTable';

interface SearchParams {
  page?: string;
  category?: string;
  name?: string;
}

export default async function CoursesDataInsightsTablePage({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page ?? '1', 10);
  const pageSize = 10;

  const filters = {
    category: searchParams.category ?? null,
    name: searchParams.name ?? null,
  };

  const result = await fetchAllCourses(page, pageSize, filters);
  if (result) {
    const { data, count } = result;
    return (
      <CourseTable
        courses={data}
        count={count ?? 0}
        currentPage={page}
        pageSize={pageSize}
      />
    );
  }
  return null;
}