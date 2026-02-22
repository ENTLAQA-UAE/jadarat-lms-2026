'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Course } from '../type';
import Image from 'next/image';
import PlaceholderImage from '@/../public/placeholder.png';
import { ActionsCell } from './ActionsCell';
import { CourseStatusBadge } from '@/components/shared/StatusBadge';

export const getColumns = (userRole: string): ColumnDef<Course>[] => {

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'course_id',
      header: 'ID',
      cell: ({ row }) => <div className='flex items-center gap-2'>{row.original.course_id}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Course Name',
      cell: ({ row }) => <div className="text-sm truncate lg:text-base exclude-weglot ">{row.original.name}</div>,
    },
    {
      accessorKey: 'thumbnail',
      header: 'Course Image',
      cell: ({ row }) => (
        <Image
          src={row.original.thumbnail || PlaceholderImage}
          loading='lazy'
          alt={row.original.name}
          width={60}
          height={30}
        />
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      filterFn: (row, columnId, filterValue) => {
        const category = row.original.category;
        return category === filterValue || filterValue === null;
      },
      cell: ({ row }) => {
        const category = row.original.category;
        return (
          <div className="flex items-center">
            <Image
              src={row.original.category_image || PlaceholderImage}
              loading='lazy'
              alt={category}
              width={32}
              height={32}
              className="size-8 me-2"
            />
            <span className='exclude-weglot'>{category}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: (row, columnId, filterValue) => {
        const status = row.original.status ?? 'draft';
        return status === filterValue || filterValue === null;
      },
      cell: ({ row }) => (
        <CourseStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleDateString()}</div>,
    },
    {
      accessorKey: 'created_by_name',
      header: 'Created By',
      cell: ({ row }) => <div className="text-sm truncate lg:text-base exclude-weglot">{row.original.created_by_name}</div>,
    },
  ];

  // Conditionally add the "Actions" column if the user is not a 'learnerManager'
  if (userRole === 'LMSAdmin') {
    columns.push({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <ActionsCell course={row.original} />,
    });
  }

  return columns;
};
