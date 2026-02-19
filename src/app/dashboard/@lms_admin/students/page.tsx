// LearnersPage.tsx
export const dynamic = 'force-dynamic'
import ExportCSVButton from '../../../../components/shared/ExportCSVButton';
import { getAllLearners } from '@/action/lms-admin/insights/students/studentsActions';
import TableComponent from './@table/page';
import { CSVButton } from './CSVButton';

export default async function LearnersPage({ searchParams }: { searchParams: { page?: string , learner_name?: string , learner_department?: string , learner_group_name?: string } }) {

  return (
    <div className='flex flex-col p-6'>
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold">Learners</h1>
        <CSVButton />
      </div>
      <TableComponent searchParams={searchParams}/>
    </div>
  );
}
