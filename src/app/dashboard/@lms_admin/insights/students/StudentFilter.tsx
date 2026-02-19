'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';
import { Student } from './type';
import { Input } from '@/components/ui/input';
import { debounce } from '@/utils/debounce'; // Your debounce function
import { getLearnersOptions } from '@/action/lms-admin/insights/students/studentsActions';

interface StudentsFilterProps {
    table: Table<Student>;
    setData?: (data: Student[]) => void;
}

interface LearnerOption {
    learner_departments: string[];
    learner_group_names: string[];
}

function StudentsFilter({ table, setData }: StudentsFilterProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [learnerOptions, setLearnerOptions] = useState<LearnerOption>();

    useEffect(() => {
        async function fetchLearnerOptions() {
            try {
                const { data } = await getLearnersOptions();
                setLearnerOptions(data[0]);
            } catch (error) {
                console.error('Failed to fetch learner options:', error);
            }
        }
        fetchLearnerOptions();
    }, []);

    // Debounced handle change
    const handleDebouncedFilterChange = debounce((columnId: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(columnId, value);
        } else {
            params.delete(columnId);
        }
        params.set('page', '1'); // Reset page to 1 on filter change
        router.push(`?${params.toString()}`);
    }, 300);

    const getUniqueValues = (columnId: string) => {
        const values = new Set<string | null>();
        table.getPreFilteredRowModel().rows.forEach(row => {
            const value = row.getValue(columnId);
            values.add(value as string | null);
        });
        return Array.from(values);
    };

    const departmentOptions = ['All Departments', ...(learnerOptions?.learner_departments ?? [])];
    const groupOptions = ['All Groups', ...(learnerOptions?.learner_group_names ?? [])];

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <div className='relative'>
                <Input
                    placeholder="Filter results..."
                    defaultValue={searchParams.get('learner_name') ?? ''}
                    onChange={(event) =>
                        handleDebouncedFilterChange('learner_name', event.target.value)
                    }
                    className="min-w-[300px] w-full"
                />
            </div>
            <Button variant={'outline'} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter />
            </Button>
            {isFilterOpen && <>
                <div className='flex gap-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Department <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {departmentOptions.map((option) => (
                                <DropdownMenuItem
                                    className='exclude-weglot'
                                    key={option}
                                    onClick={() => handleDebouncedFilterChange('learner_department', option === 'All Departments' ? null : option)}
                                >
                                    {option}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Group <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {groupOptions.map((option) => (
                                <DropdownMenuItem
                                    className='exclude-weglot'

                                    key={option}
                                    onClick={() => handleDebouncedFilterChange('learner_group_name', option === 'All Groups' ? null : option)}
                                >
                                    {option}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </>}
        </div>
    );
}

export default StudentsFilter;
