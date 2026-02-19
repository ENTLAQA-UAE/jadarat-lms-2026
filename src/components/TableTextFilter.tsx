import React from 'react';
import { Table } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';

interface TextFilterProps<T> {
  table: Table<T>;
  columnIds: (keyof T)[];
  placeholder: string;
}

function TextFilter<T>({ table, columnIds, placeholder }: TextFilterProps<T>) {
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterValue = event.target.value;
    columnIds.forEach((columnId) => {
      const column = table.getColumn(columnId as string);
      if (column) {
        column.setFilterValue(filterValue);
      }
    });
  };

  return (
    <Input
      placeholder={placeholder}
      value={columnIds.map((colId) => (table.getColumn(colId as string)?.getFilterValue() as string) ?? '').join(' ')}
      onChange={handleFilterChange}
      className="min-w-[300px] w-full"
    />
  );
}

export default TextFilter;
