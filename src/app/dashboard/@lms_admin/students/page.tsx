// LearnersPage.tsx
export const dynamic = 'force-dynamic'
import ExportCSVButton from '../../../../components/shared/ExportCSVButton';
import { getAllLearners } from '@/action/lms-admin/insights/students/studentsActions';
import TableComponent from './@table/page';
import { CSVButton } from './CSVButton';
import DataPageLayout from '@/components/shared/DataPageLayout';

export default async function LearnersPage({ searchParams }: { searchParams: { page?: string , learner_name?: string , learner_department?: string , learner_group_name?: string } }) {

  return (
    <DataPageLayout title="Learners" actions={<CSVButton />}>
      <TableComponent searchParams={searchParams}/>
    </DataPageLayout>
  );
}
