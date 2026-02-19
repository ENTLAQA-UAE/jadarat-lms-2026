'use client';

import React from 'react';
import { Table } from '@tanstack/react-table';
import { Organization } from './type';
import { Input } from '@/components/ui/input';

interface FilterTableProps {
    table: Table<Organization>;
}

function FilterTable({ table }: FilterTableProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <div className='relative flex gap-2'>
                <Input
                    placeholder="Filter results..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="min-w-[300px] w-full"
                />
            </div>
        </div>
    );
}

export default FilterTable;
