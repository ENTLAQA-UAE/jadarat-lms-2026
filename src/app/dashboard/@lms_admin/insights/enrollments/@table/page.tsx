import { enrollmentsActivity } from "@/action/lms-admin/enrollments/enrollmentsActions"
import EnrollmentsDataTable from "../EnrollmentsDataTable"

export default async function EnrollmentsTable({ searchParams }: { searchParams: { page?: string, name?: string, course?: string, department?: string, group_name?: string, start_date?: string, end_date?: string } }) {
 const page = searchParams.page ? parseInt(searchParams.page, 10) : 1
  const pageSize = 10
  
  const filters = {
    _name: searchParams.name ?? null,
    _course: searchParams.course ?? null,
    _department: searchParams.department ?? null,
    _group_name: searchParams.group_name ?? null,
    _start_date: searchParams.start_date ?? null,
    _end_date: searchParams.end_date ?? null,
  }

 const { data, errorMessage , count} = await enrollmentsActivity(page, pageSize, filters)

  return (
   <EnrollmentsDataTable
    Enrollments={data}
    currentPage={page}
    pageSize={pageSize}
    count={count ?? 0}
   />
  )
}