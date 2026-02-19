import { getLearners } from '@/action/lms-admin/insights/students/studentsActions'
import UserDataTable from '../UserDataTable'

export default async function TableComponent({ searchParams }: { searchParams: { page?: string, learner_name?: string, learner_department?: string, learner_group_name?: string } }) {

  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1
  const pageSize = 10
  
  let _learner_name = searchParams.learner_name ? searchParams.learner_name : null
  let _learner_department = searchParams.learner_department ? searchParams.learner_department : null
  let _learner_group_name = searchParams.learner_group_name ? searchParams.learner_group_name : null

  const learnersResponse = await getLearners(page, pageSize, { _learner_name, _learner_department, _learner_group_name });  

  if ('data' in learnersResponse) {
    const { data, count, loading } = learnersResponse;
    return (
      <UserDataTable
        students={data}
        currentPage={page}
        pageSize={pageSize}
        count={count ?? 0}
        loading={loading}
      />
    )
  } else {
    console.error('Unexpected response format');
    return (
      <div>
        <p>Unexpected response format</p>
      </div>
    )
  }
}