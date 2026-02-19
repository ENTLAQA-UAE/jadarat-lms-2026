'use client';

import React, { useState, useEffect } from 'react';
import { Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { Student } from './type';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface StudentsFilterProps {
  table: Table<Student>;
  setData: (data: Student[]) => void;
}

function StudentsFilter({ table, setData }: StudentsFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [originalData, setOriginalData] = useState<Student[]>([]);

  useEffect(() => {
    // Cache the original data when the component mounts or when `table` changes
    const fetchOriginalData = async () => {
      // Assuming you have a way to get the original data from the table
      const allRows = table.getPreFilteredRowModel().rows;
      setOriginalData(allRows.map((row) => row.original));
    };
    fetchOriginalData();
  }, [table]);

  const getUniqueValues = (columnId: string) => {
    const values = new Set<string | null>();
    table.getPreFilteredRowModel().rows.forEach((row) => {
      const value = row.getValue(columnId);
      values.add(value as string | null);
    });
    return Array.from(values);
  };

  const handleFilterChange = (columnId: string, value: string | null) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(value);
    }
  };

  const applyDateRangeFilter = () => {
    const filteredRows = originalData.filter((row) => {
      const enrollmentDateString = row.enrollment_date; // Adjusted to use the correct property name

      // Ensure the date string is not undefined
      if (!enrollmentDateString) return false;

      const date = new Date(enrollmentDateString);

      return (!startDate || date >= startDate) && (!endDate || date <= endDate);
    });

    // Debugging output
    console.log('Filtered Rows:', filteredRows);

    // Set filtered data to the table
    setData(filteredRows);
  };

  const applyFilters = () => {
    applyDateRangeFilter();
    // Apply other filters if needed
  };

  const courseOptions = getUniqueValues('course').concat('All Courses');
  const departmentOptions =
    getUniqueValues('department').concat('All Departments');
  const groupOptions = getUniqueValues('group').concat('All Groups');

  return (
    <div className="flex flex-col lg:flex-row gap-2 items-center">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Course <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {courseOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() =>
                  handleFilterChange(
                    'course',
                    option === 'All Courses' ? null : option
                  )
                }
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Department <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {departmentOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() =>
                  handleFilterChange(
                    'department',
                    option === 'All Departments' ? null : option
                  )
                }
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
                key={option}
                onClick={() =>
                  handleFilterChange(
                    'group',
                    option === 'All Groups' ? null : option
                  )
                }
              >
                {option}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className="w-[150px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : <span>Start Date</span>}
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
              variant={'outline'}
              className="w-[150px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'PPP') : <span>End Date</span>}
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

        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}

export default StudentsFilter;
