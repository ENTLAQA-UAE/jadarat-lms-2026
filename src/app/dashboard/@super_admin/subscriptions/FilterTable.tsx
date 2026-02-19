'use client';

import React from 'react';
import { Table } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Subscription } from './columns';
import { Input } from '@/components/ui/input';

interface FilterTableProps {
  table: Table<Subscription>;
}

function FilterTable({ table }: FilterTableProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center">
      <div className="relative flex gap-2">
        <Input
          placeholder="Filter results..."
          value={(table.getColumn('package')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('package')?.setFilterValue(event.target.value)
          }
          className="min-w-[300px] w-full"
        />
      </div>
    </div>
  );
}

export default FilterTable;
