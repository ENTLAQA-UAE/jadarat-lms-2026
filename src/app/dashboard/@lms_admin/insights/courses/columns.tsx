'use client'
import { ColumnDef } from '@tanstack/react-table';
import { InsightsCourseColumnsProps } from './type';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<InsightsCourseColumnsProps>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='flex items-center gap-2'>
      <Image src={row.original.thumbnail} alt={row.original.thumbnail} width={50} height={50} />
      <span className='exclude-weglot'>{row.original.name}</span>
    </div>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <div
        className='exclude-weglot'
      >
        {row.original.category}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => <div className="text-sm truncate  lg:text-base ">{new Date(row.original.created_at).toLocaleDateString()}</div>,
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ row }) => <div className="text-sm truncate exclude-weglot lg:text-base ">{row.original.created_by_name}</div>,
  },
  {
    accessorKey: 'enrollments',
    header: 'Enrollments',
    cell: ({ row }) => <div className="text-sm truncate  lg:text-base ">{row.original.enrollments}</div>,
  },
  {
    accessorKey: 'completions',
    header: 'Completions',
    cell: ({ row }) => <div className="text-sm truncate  lg:text-base ">{row.original.completions}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge className='p-2 ' variant={row.original.status === "Published" ? "default" : "outline"}>{row.original.status === "Published" ? "Published" : "Published"}</Badge>,
  },

  {
    accessorKey: 'course_id',
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={`/dashboard/insights/courses/${row.original.course_id}`} >
        <Button size={'sm'} variant={"outline"} className="w-full">
          View Details
        </Button>
      </Link>
    ),
  },

];
