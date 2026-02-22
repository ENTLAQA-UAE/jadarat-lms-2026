// columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { EnrollmentsType } from './type';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gauge } from '@/components/ui/gauge';
import Image from 'next/image';
import { EyeIcon } from 'lucide-react';
import CertificateButton from '@/components/shared/CertificateButton';
import { EnrollmentStatusBadge } from '@/components/shared/StatusBadge';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

const filterDate = (
  row: any,
  columnId: string,
  filterValue: [string, string]
) => {
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
};

const renderCellWithImage = (row: EnrollmentsType) => (
  <div className="flex gap-6 items-center">
    {row.thumbnail ? (
      <Image
        src={row.thumbnail}
        width={50}
        height={50}
        alt={row.name}
        className="rounded"
      />
    ) : (
      <div className="w-12 h-12 bg-muted rounded" />
    )}
    <span className='exclude-weglot'>{row.course}</span>
  </div>
);

const renderCompletionGauge = (completionRate: number) => (
  <div className="flex justify-center items-center gap-2">
    <Gauge value={completionRate} size="medium" showValue={true} />
  </div>
);

const renderActions = (row: EnrollmentsType) =>  (

  <div className="flex flex-col gap-2">
    <Button size={'sm'} variant={'outline'} asChild className="w-[80%]">
      <Link
        href={`/dashboard/insights/enrollments/${row.enrollment_id}?user_id=${row.user_id}`}
      >
        <EyeIcon className="me-1 h-5 w-5 mb-1" />
        View Details
      </Link>
    </Button>
    {row.progress_percentage >= 100 && (
      <CertificateButton
        selectedCourse={{ id: row.enrollment_id, learnerId: row.user_id.toString() , courseName: row.course, learnerName: row.name }}
        className="!w-[80%]"
        variant={'download'}
        disabled={row.progress_percentage < 100}
      />
    )}
  </div>
);

export const columns: ColumnDef<EnrollmentsType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="exclude-weglot">{row.original.name ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'course',
    header: 'Course',
    cell: ({ row }) => renderCellWithImage(row.original),
  },
  {
    id: 'enrollment_status',
    header: 'Status',
    cell: ({ row }) => (
      <EnrollmentStatusBadge
        status={row.original.enrollment_status}
        progress={row.original.progress_percentage}
      />
    ),
  },
  {
    accessorKey: 'enrollment_date',
    header: 'Enrollment Date',
    cell: ({ row }) => <div>{formatDate(row.original.enrollment_date)}</div>,
    filterFn: filterDate,
  },
  {
    accessorKey: 'progress_percentage',
    header: 'Completion Rate',
    cell: ({ row }) => renderCompletionGauge(row.original.progress_percentage),
  },
  {
    accessorKey: 'completion_date',
    header: 'Completion Date',
    cell: ({ row }) => (
      <div className="exclude-weglot w-[120px] text-center">
        <div>{formatDate(row.original.completion_date ?? null)}</div>
      </div>
    ),
  },
  {
    accessorKey: 'user_id',
    header: 'Action',
    cell: ({ row }) => renderActions(row.original),
  },
];
