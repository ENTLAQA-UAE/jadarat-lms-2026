// columns.tsx
import { ColumnDef } from '@tanstack/react-table';
import { Learner } from './type';
import { Button } from '@/components/ui/button';

import Link from 'next/link';
import { Gauge } from '@/components/ui/gauge';

export const columns: ColumnDef<Learner>[] = [
    {
        accessorKey: 'learner_name',
        header: 'Name',
        cell: ({ row }) => (
            <div className="exclude-weglot">{row.original.learner_name ?? 'N/A'}</div>
        ),
    },
    {
        accessorKey: 'learner_country',
        header: 'Country',
        cell: ({ row }) => (
            <div

            >
                {row.original.learner_country}
            </div>
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
        accessorKey: 'completed_course_count',
        header: 'Completed Courses',
        cell: ({ row }) => (
            <div className="exclude-weglot w-[120px] text-center">
                {row.original.completed_course_count}
            </div>
        ),
    },
    {
        accessorKey: 'pending_course_count',
        header: 'Pending Courses',
        cell: ({ row }) => (
            <div className="exclude-weglot w-[120px] text-center ">
                {row.original.pending_course_count}
            </div>
        ),
    },

    {
        accessorKey: 'average_progress',
        header: 'Completion Rate',
        cell: ({ row }) => (
            <div className="flex  justify-center items-center gap-2">
                {/* <div className="w-full bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${row.original.completionRate}%` }}
                    />
                </div>
                <span>{row.original.completionRate}%</span> */}
                <Gauge value={+row.original.average_progress.toFixed(2)} size="medium" showValue={true} />

            </div>
        ),
    },

    {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => (
            <div>{new Date(row.original.last_login).toLocaleDateString()}</div>

        ),
    },
    {
        accessorKey: 'learner_id',
        header: 'Action',
        cell: ({ row }) => (
            <Link href={`/dashboard/insights/students/${row.original.learner_id}`}>
                <Button size={'sm'} variant={'outline'} className="w-full">
                    View
                </Button>
            </Link>
        ),
    },
];
