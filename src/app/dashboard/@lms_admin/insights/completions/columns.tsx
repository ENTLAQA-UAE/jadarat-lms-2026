
'use client'
import { ColumnDef } from '@tanstack/react-table';
import { Student } from './type';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.name ?? 'N/A'}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <Button
        variant="link"
        className="p-0 h-fit"
        onClick={() => {
          // Add your open logic here
        }}
      >
        {row.original.email}
      </Button>
    ),
  },
  {
    accessorKey: 'course',
    header: 'Course',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.course}</div>,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.department}</div>,
  },
  {
    accessorKey: 'group_name',
    header: 'Group',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.group_name}</div>,
  },
  {
    accessorKey: 'completion_date',
    header: 'Completion Date',
    cell: ({ row }) => <div>{new Date(row.original.completion_date).toLocaleDateString()}</div>,
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
    accessorKey: 'progress_percentage',
    header: 'Progress',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${row.original.progress_percentage}%` }}
          />
        </div>
        <span>{row.original.progress_percentage}%</span>
      </div>
    ),
  },
  {
    accessorKey: 'user_id',
    header: 'Profile',
    cell: ({ row }) => (
      <Link href={`/dashboard/insights/completions/${row.original.course_id}?user_id=${row.original.user_id}`}>
        <Button size={'sm'} variant={"outline"} className="w-full">
          Show Details
        </Button>
      </Link>
    ),
  },
];
