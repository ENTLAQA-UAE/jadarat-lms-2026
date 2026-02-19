import { DataTableComponent } from '@/components/DataTable'
import { columns } from "./columns"
import LearnerFilterCourse from './LearnerFilterCourse'
import EnrollmentButton from './EnrollmentButton'


function ProfileDataTable({ courses }: { courses: any }) {
  return (
    <DataTableComponent
      columns={columns}
      data={courses}
      renderToolbar={(table) => (
        <LearnerFilterCourse table={table} />
      )}
      actionTable={() => (
        <EnrollmentButton/>
      )}
    />
  )
}

export default ProfileDataTable