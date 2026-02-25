'use client';
import { DataTableComponent } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import React from 'react';
import { columns } from './columns';
import EnrollmentFilter from './EnrollmentsFilter';
import ActionEnrollmentTable from './ActionEnrollmentTable';
import { EnrollmentsType } from './type';

// Function to convert data to CSV format and trigger a download
const exportToCSV = (data: EnrollmentsType[], filename: string = 'enrollments.csv') => {
    const csvRows = [];

    // Get the headers from the columns definition
    const headers = columns.map((column) => column.header).join(',');
    csvRows.push(headers);

    // Map each row of data to a CSV row
    data.forEach((row) => {
        const values = columns.map((column) => {
            const key = (column as any).accessorKey as keyof EnrollmentsType;
            return JSON.stringify(row[key] || ''); // Handle null or undefined values
        });
        csvRows.push(values.join(','));
    });

    // Create a CSV Blob and download it
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    window.URL.revokeObjectURL(url);
};

export default function EnrollmentsTable({
    data,
}: {
    data: EnrollmentsType[];
}) {
    return (
        <div className='flex flex-col p-6'>
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold tracking-tight">Enrollments</h1>
            </div>
            <DataTableComponent
                data={data}
                columns={columns}
                renderToolbar={(table) => <EnrollmentFilter table={table} />}
                actionTable={() => <ActionEnrollmentTable />}
            />
        </div>
    );
}
