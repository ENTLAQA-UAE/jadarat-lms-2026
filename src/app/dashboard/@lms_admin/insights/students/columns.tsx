// columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { Student } from './type';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'learner_name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="exclude-weglot">{row.original.learner_name ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'learner_email',
    header: 'Email',
    cell: ({ row }) => (
      <Button
        variant="link"
        className="p-0 h-fit"
        onClick={() => {
          // Add your open logic here
        }}
      >
        {row.original.learner_email}
      </Button>
    ),
  },
  {
    accessorKey: 'learner_department',
    header: 'Department',
    cell: ({ row }) => (
      <div className="exclude-weglot">{row.original.learner_department}</div>
    ),
  },
  {
    accessorKey: 'learner_group_name',
    header: 'Group',
    cell: ({ row }) => (
      <div className="exclude-weglot">{row.original.learner_group_name}</div>
    ),
  },
  {
    accessorKey: 'enrollment_course_count',
    header: 'Enrolled Course',
    cell: ({ row }) => (
      <div className="exclude-weglot  w-[100px] text-end">
        {row.original.enrollment_course_count}
      </div>
    ),
  },
  {
    accessorKey: 'completed_course_count',
    header: 'Completed Course',
    cell: ({ row }) => (
      <div className="exclude-weglot  w-[120px] text-end ">
        {row.original.completed_course_count}
      </div>
    ),
  },
  {
    accessorKey: 'learner_id',
    header: 'Profile',
    cell: ({ row }) => (
      <Link href={`/dashboard/insights/students/${row.original.learner_id}`}>
        <Button size={'sm'} variant={'outline'} className="w-full">
          View
        </Button>
      </Link>
    ),
  },
];