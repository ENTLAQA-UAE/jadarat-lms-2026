export const dynamic = 'force-dynamic'
import NavLMS from '@/hoc/nav-lms.hoc';
import EnrollmentsTable from './@table/page';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import { Suspense } from 'react';



export default async function EnrollmentsPage({ searchParams }: { searchParams: { page?: string } }) {
  
  return (
    <div className='flex flex-col '>
      <NavLMS data={[]}>
        <Suspense fallback={<TableSkeleton />}>
          <EnrollmentsTable searchParams={searchParams} />
        </Suspense>
      </NavLMS>
    </div>
  );
}