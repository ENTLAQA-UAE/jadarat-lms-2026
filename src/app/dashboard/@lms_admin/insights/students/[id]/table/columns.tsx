
'use client'
import { ColumnDef } from '@tanstack/react-table';
import { CourseProfile } from './type';
import Image from 'next/image';
import CertificateButton from '@/components/shared/CertificateButton';

export const columns: ColumnDef<CourseProfile>[] = [
  {
    accessorKey: 'name',
    header: 'Image',
    cell: ({ row }) => <Image src={row.original.image || ''} alt={row.original.name} width={40} height={40} />,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='exclude-weglot'>{row.original.name ?? 'N/A'}</div>,
  },
  // {
  //   accessorKey: 'email',
  //   header: 'Email',
  //   cell: ({ row }) => (
  //     <Button
  //       variant="link"
  //       className="p-0 h-fit"
  //       onClick={() => {
  //       }}
  //     >
  //       {row.original.email}
  //     </Button>
  //   ),
  // },


  {
    accessorKey: 'enrollmentDate',
    header: 'Enrollment Date',
    cell: ({ row }) => <div>{new Date(row.original.enrollmentDate).toLocaleDateString()}</div>,
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
    accessorKey: 'progressPercentage',
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

      const { progress, id, name, learnerName, learnerId } = row.original;
      if (progress == 100) {
        return (
          <CertificateButton
            selectedCourse={{ id: id, learnerId: learnerId.toString(), courseName: name, learnerName: learnerName }}
            variant="download"
            disabled={progress < 100}
          />
        );
      }

      return null;
    },
  }


];
