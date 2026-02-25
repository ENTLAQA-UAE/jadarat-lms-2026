'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Filter } from 'lucide-react';
import { debounce } from '@/utils/debounce';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { getCategoriesOptions } from '@/action/lms-admin/categories/categoriesActions';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseStatusBadge } from '@/components/shared/StatusBadge';

const STATUS_OPTIONS = [
    { value: null as string | null, label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'private', label: 'Private' },
    { value: 'published', label: 'Published' },
];

function CoursesFilter() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchCategoryOptions() {
            setIsLoading(true);
            try {
                const data = await getCategoriesOptions();
                setCategoryOptions(data);
            } catch (error) {
                console.error('Failed to fetch category options:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCategoryOptions();
    }, []);

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

    const FilterDropdown = ({ title, options, columnId }: { title: string, options: string[], columnId: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className='flex w-full min-w-[200px] lg:min-w-[400px] justify-between'>
                    {title} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-full min-w-[200px] lg:min-w-[400px]">
                {!isLoading ? options.map((option) => (
                    <DropdownMenuItem
                        key={option}
                        className='exclude-weglot'
                        onClick={() => handleDebouncedFilterChange(columnId, option === `All ${title}` ? null : option)}
                    >
                        {option}
                    </DropdownMenuItem>
                )) :
                    <DropdownMenuItem className='flex flex-col gap-2'>
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-full h-4" />
                    </DropdownMenuItem>
                }
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const currentStatusFilter = searchParams.get('status');

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
                        <FilterDropdown title="Category" options={categoryOptions.map(category => category.name)} columnId="category" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex min-w-[150px] justify-between">
                                {currentStatusFilter ? (
                                    <CourseStatusBadge status={currentStatusFilter} />
                                ) : (
                                    'All Statuses'
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[150px]">
                            {STATUS_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option.label}
                                    onClick={() => handleDebouncedFilterChange('status', option.value)}
                                    className="flex items-center gap-2"
                                >
                                    {option.value ? (
                                        <CourseStatusBadge status={option.value} />
                                    ) : (
                                        option.label
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </div>
    );
}

export default CoursesFilter;
