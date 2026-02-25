export const dynamic = 'force-dynamic'
import EnrollmentsTable from './@table/page';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { Suspense } from 'react';

import { CSVButton } from './CSVButton';
import DataPageLayout from '@/components/shared/DataPageLayout';


export default async function EnrollmentsPage({ searchParams }: { searchParams: { page?: string } }) {

  return (
    <DataPageLayout title="Enrollments" actions={<CSVButton />}>
      <Suspense fallback={<TableSkeleton />}>
        <EnrollmentsTable searchParams={searchParams} />
      </Suspense>
    </DataPageLayout>
  );
}