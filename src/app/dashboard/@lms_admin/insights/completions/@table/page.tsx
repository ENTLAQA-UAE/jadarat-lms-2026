import { getCompletions } from '@/action/lms-admin/insights/completions/completionsActions';
import CompletionsDataTable from '../CompletionsDataTable';

interface SearchParams {
  page?: string;
  course?: string;
  department?: string;
  group_name?: string;
  name?: string;
  learner_department?: string;
  learner_group_name?: string;
  start_date?: string;
  end_date?: string;
}

export default async function CompletionsDataTablePage({ searchParams }: { searchParams: SearchParams }) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = 10;

  const filters = {
    course_filter: searchParams.course ?? null,
    department_filter: searchParams.department ?? null,
    group_name_filter: searchParams.group_name ?? null,
    name_filter: searchParams.name ?? null,
    start_date: searchParams.start_date ?? null,
    end_date: searchParams.end_date ?? null,
  };

  const completionsResponse = await getCompletions(page, pageSize, filters);

  if ('data' in completionsResponse && Array.isArray(completionsResponse.data)) {
    const { data, count } = completionsResponse;
    return (
      <CompletionsDataTable
        completionsData={data}
        count={count}
        currentPage={page}
        pageSize={pageSize}
      />
    );
  } else {
    console.error('Unexpected response format:', completionsResponse);
    return (
      <div>
        <p>An error occurred while fetching data. Please try again later.</p>
      </div>
    );
  }
}