import { Suspense } from 'react'
import NavLMS from '@/hoc/nav-lms.hoc'
import TableComponent from './@table/page'
import TableSkeleton from '@/components/skeleton/TableSkeleton'

export default function StudentsPage({ searchParams }: { searchParams: { page?: string } }) {
  return (
    <div className="flex flex-col">
      <NavLMS data={[]}>
        <Suspense fallback={<TableSkeleton />}>
          <TableComponent searchParams={searchParams} />
        </Suspense>
      </NavLMS>
    </div>
  )
}