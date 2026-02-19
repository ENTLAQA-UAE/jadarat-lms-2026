'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { debounce } from '@/utils/debounce';
import { getEnrollmentsOptions } from '@/action/lms-admin/enrollments/enrollmentsActions';
import { EnrollmentsType } from './type';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface EnrollmentsFilterProps {
    table: Table<EnrollmentsType>;
}

interface EnrollmentOption {
    courses: string[];
    departments: string[];
    group_names: string[];
}

function EnrollmentsFilter({ table }: EnrollmentsFilterProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [enrollmentOptions, setEnrollmentOptions] = useState<EnrollmentOption >();
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchEnrollmentOptions() {
            try {
                const { data } = await getEnrollmentsOptions();
                setEnrollmentOptions(data[0]);
            } catch (error) {
                console.error('Failed to fetch enrollment options:', error);
            }
        }
        fetchEnrollmentOptions();
    }, []);

    const courseOptions = ['All Courses', ...(enrollmentOptions?.courses ?? [])];
    const departmentOptions = ['All Departments', ...(enrollmentOptions?.departments ?? [])];
    const groupOptions = ['All Groups', ...(enrollmentOptions?.group_names ?? [])];
    
    const handleDebouncedFilterChange = debounce((columnId: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(columnId, value);
        } else {
            params.delete(columnId);
        }
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    }, 300);

    const applyDateRangeFilter = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Set the start and end dates in the query params
        if (startDate) {
            params.set('start_date', startDate.toISOString());
        } else {
            params.delete('start_date');
        }

        if (endDate) {
            params.set('end_date', endDate.toISOString());
        } else {
            params.delete('end_date');
        }

        // Reset to the first page on filter change
        params.set('page', '1');

        router.push(`?${params.toString()}`, { scroll: false });

        // Also, apply the filter to the table's 'enrollment_date' column, if present
        const enrollmentDateColumn = table.getColumn('enrollment_date');
        if (enrollmentDateColumn) {
            enrollmentDateColumn.setFilterValue([startDate, endDate]);
        }
    };


    const FilterDropdown = ({ title, options, columnId }: { title: string, options: string[], columnId: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {title} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {options.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        className='exclude-weglot'
                        onClick={() => handleDebouncedFilterChange(columnId, option === `All ${title}s` ? null : option)}
                    >
                        {option}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const DatePicker = ({ date, setDate, label }: { date: Date | undefined, setDate: (date: Date | undefined) => void, label: string }) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-center w-fit font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-center">
            <Input
                placeholder="Filter results..."
                defaultValue={searchParams.get('name') ?? ''}
                onChange={(event) => handleDebouncedFilterChange('name', event.target.value)}
                className="min-w-[300px] w-full"
            />
            <Button variant='outline' onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter />
            </Button>

            {isFilterOpen && (
                <>
                    <div className='flex gap-2'>
                        <FilterDropdown title="Course" options={courseOptions} columnId="course" />
                        <FilterDropdown title="Department" options={departmentOptions} columnId="department" />
                        <FilterDropdown title="Group" options={groupOptions} columnId="group_name" />
                    </div>

                    <div className="flex items-center gap-2">
                        <DatePicker date={startDate} setDate={setStartDate} label="Start Date" />
                        <DatePicker date={endDate} setDate={setEndDate} label="End Date" />
                        <Button onClick={applyDateRangeFilter}>
                            Apply Filters
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default EnrollmentsFilter;