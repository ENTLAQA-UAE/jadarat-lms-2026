'use client'

import React, { useState, useEffect } from 'react';
import { Table } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Calendar as CalendarIcon, Filter, Search } from 'lucide-react';
import { EnrollmentData } from './type'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface CourseDetailsFiltersProps {
    table: Table<EnrollmentData>;
}
function CourseDetailsFilters({ table }: CourseDetailsFiltersProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const applyDateRangeFilter = () => {
        const enrollmentDateColumn = table.getColumn('enrollment_date');
        if (enrollmentDateColumn) {
            enrollmentDateColumn.setFilterValue([startDate, endDate]);
        }
    };

    const applyFilters = () => {
        applyDateRangeFilter();
        // Apply other filters if needed
    };

    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <div className='relative flex gap-2'>
                <Input
                    placeholder="Filter results..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="  min-w-[300px] w-full"


                />
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-fit justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={(date) => setStartDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-fit justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : <span>End Date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={(date) => setEndDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button onClick={applyFilters}>
                        Apply Filters
                    </Button>
                </div>
            </div>

        </div>
    );
}

export default CourseDetailsFilters;
