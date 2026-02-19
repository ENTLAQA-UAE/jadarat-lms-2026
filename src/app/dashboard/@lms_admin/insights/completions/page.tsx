import NavLMS from '@/hoc/nav-lms.hoc';
import CompletionsDataTablePage from './@table/page';
import { Suspense } from 'react';
import TableSkeleton from '@/components/skeleton/TableSkeleton';



export default async function InsightPage({ searchParams }: { searchParams: { page?: string } }) {
  return (
    <div className='flex flex-col'>
      <NavLMS data={[]}>
        <Suspense fallback={<TableSkeleton />}>
          <CompletionsDataTablePage searchParams={searchParams} />
        </Suspense>
      </NavLMS>
    </div>
  );
}