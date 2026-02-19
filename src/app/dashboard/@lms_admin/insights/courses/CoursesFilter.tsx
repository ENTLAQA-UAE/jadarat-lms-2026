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
import { useAppSelector } from '@/hooks/redux.hook';


function CoursesFilter() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { settings } = useAppSelector(state => state.organization);
    const [categoryOptions, setCategoryOptions] = useState<{ id: string, name: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function fetchCategoryOptions() {
            setIsLoading(true);
            try {
                const data = await getCategoriesOptions(+settings.organization_id);
                setCategoryOptions(data);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch category options:', error);
            }
        }
        fetchCategoryOptions();
    }, [settings.organization_id]);

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
                </>
            )}
        </div>
    );
}

export default CoursesFilter;