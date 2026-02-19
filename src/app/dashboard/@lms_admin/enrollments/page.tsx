export const dynamic = 'force-dynamic'
import EnrollmentsTable from './@table/page';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { Suspense } from 'react';

import { CSVButton } from './CSVButton';


export default async function EnrollmentsPage({ searchParams }: { searchParams: { page?: string } }) {

  return (
    <div className='flex flex-col p-6'>
      <div className='flex flex-col '>
        <div className='flex items-center justify-between'>
          <h1 className="text-2xl font-bold">Enrollments</h1>
          <CSVButton />
        </div>
        <Suspense fallback={<TableSkeleton />}>
          <EnrollmentsTable searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
    
  );
}