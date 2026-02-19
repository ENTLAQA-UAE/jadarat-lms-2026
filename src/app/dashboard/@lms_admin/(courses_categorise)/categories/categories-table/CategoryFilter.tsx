'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

const CategoryFilter: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [filterValue, setFilterValue] = useState(searchParams.get('name') || '');
    const debouncedFilterValue = useDebounce(filterValue, 300);

    const updateUrl = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('name', value);
        } else {
            params.delete('name');
        }
        if (params && value) {
            params.set('page', '1');
            router.push(`?${params.toString()}`, { scroll: false });
        } else {
            router.push(`?${params.toString()}`, { scroll: false });

        }
    }, [searchParams]);

    useEffect(() => {
        updateUrl(debouncedFilterValue);
    }, [debouncedFilterValue, updateUrl]);

    useEffect(() => {
        const nameFromUrl = searchParams.get('name') || '';
        if (nameFromUrl !== filterValue) {
            setFilterValue(nameFromUrl);
        }
    }, [searchParams]);


    return (
        <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
            <div className="relative flex gap-2">
                <Input
                    placeholder="Filter results..."
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                    className="min-w-[300px] w-full"
                />
            </div>
        </div>
    );
};

export default CategoryFilter;
