"use client"
import { DataTableComponent } from '@/components/DataTable'
import { columns } from "./columns"
import CourseDetailsFilters from './CourseDetailsFilters'
import { EnrollmentData } from './type'

function CourseDetailsTable({ enrollments, loading, errorMessage }: { enrollments: any, loading: boolean, errorMessage: string }) {

  if (loading) return <div>Loading...</div>;
  if (errorMessage) return <div>Error: {errorMessage}</div>;

  return (
    <DataTableComponent
      columns={columns}
      data={enrollments}
      renderToolbar={(table) => (
        <CourseDetailsFilters table={table} />
      )}
    />
  )
}

export default CourseDetailsTable