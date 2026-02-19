"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Student } from "./type";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { debounce } from "@/utils/debounce";
import { getCompletionsOptions } from "@/action/lms-admin/insights/completions/completionsActions";

interface CompletionsFilterProps {
  table: Table<Student>;
}

interface CompletionOption {
  courses: string[];
  departments: string[];
  group_names: string[];
}

function CompletionsFilter({ table }: CompletionsFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [completionOptions, setCompletionOptions] = useState<CompletionOption>();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchCompletionOptions() {
      try {
        const { data } = await getCompletionsOptions();
        setCompletionOptions(data[0]);
      } catch (error) {
        console.error('Failed to fetch completion options:', error);
      }
    }
    fetchCompletionOptions();
  }, []);

  console.log("completionOptions", completionOptions);
  

  const courseOptions = ['All Courses', ...(completionOptions?.courses ?? [])];
  const departmentOptions = ['All Departments', ...(completionOptions?.departments ?? [])];
  const groupOptions = ['All Groups', ...(completionOptions?.group_names ?? [])];

  const handleDebouncedFilterChange = debounce((columnId: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(columnId, value);
    } else {
      params.delete(columnId);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  }, 300);

  const applyDateRangeFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

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

    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
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

export default CompletionsFilter;