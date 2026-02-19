
'use client'
import { ColumnDef } from '@tanstack/react-table';
import { EnrollmentData } from './type';
import CertificateButton from '@/components/shared/CertificateButton';


export const columns: ColumnDef<EnrollmentData>[] = [
  {
    accessorKey: 'name',
    header: 'Full Name',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.name}</div>
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.email}</div>
  },

  {
    accessorKey: 'enrollment_date',
    header: 'Enrollment Date',
    cell: ({ row }) => <div>{new Date(row.original.enrollment_date).toLocaleDateString()}</div>,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length !== 2) return true;
      const [start, end] = filterValue;
      const cellDate = new Date(row.getValue(columnId));
      const startDate = start ? new Date(start) : null;
      const endDate = end ? new Date(end) : null;


      if (startDate && endDate) {
        return cellDate >= startDate && cellDate <= endDate;
      } else if (startDate) {
        return cellDate >= startDate;
      } else if (endDate) {
        return cellDate <= endDate;
      }
      return true;
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${row.original.progress}%` }}
          />
        </div>
        <span>{row.original.progress}%</span>
      </div>
    ),
  },

  {
    accessorKey: 'id',
    header: 'Download',
    cell: ({ row }) => {
      const { progress, course_id, course_title ,name , user_id } = row.original;
      // console.log("row.original => ", row.original);

      if (progress == 100) {
        return (
          <CertificateButton selectedCourse={{ id: course_id, learnerId: user_id.toString(), courseName: course_title, learnerName: name }} variant="download" disabled={progress < 100} />
        );
      }

      return null;
    },
  }


];
