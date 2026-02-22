'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableType,
} from '@tanstack/react-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/context/language.context';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  renderToolbar?: (table: TableType<TData>) => React.ReactNode;
  actionTable?: () => React.ReactNode;
  headerLinks?: () => React.ReactNode
  controls?: () => React.ReactNode
  pagination?: boolean;
  renderMobileCard?: (row: TData) => React.ReactNode;
}

export function DataTableComponent<TData>({ columns, data, renderToolbar, actionTable, headerLinks, controls, pagination = false, renderMobileCard }: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { isRTL } = useLanguage()
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col md:flex-row gap-2 w-full items-center py-4 ">
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col lg:flex-row gap-2">
            {renderToolbar && renderToolbar(table)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actionTable && actionTable()}
          {headerLinks && headerLinks()}
        </div>
      </div>

      {/* Mobile card layout */}
      {renderMobileCard && (
        <div className="md:hidden space-y-3">
          {data.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                {renderMobileCard(row.original)}
              </React.Fragment>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          )}
        </div>
      )}

      {/* Desktop table layout */}
      <div className={`rounded-md border grid ${renderMobileCard ? 'hidden md:grid' : ''}`}>
        <ScrollArea className="h-[80vh]" dir={isRTL ? 'rtl' : "ltr"}>
          <Table>
            <TableHeader className='bg-primary sticky top-0 z-[3]'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead className={`text-white rtl:text-start ${header.column.columnDef.meta?.headerClassName}`} key={header.id + Math.random()}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data.length > 0 && table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    className="w-[200px] "
                    key={row.id + Math.random()}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className={cell.column.columnDef.meta?.cellClassName} key={cell.id + Math.random()}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  ></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {controls && controls()}
      {pagination && (
        <div className="py-4  ">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.getCanPreviousPage() && table.previousPage()}
                  className={!table.getCanPreviousPage() ? 'pointer-events-none  opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    className='cursor-pointer'
                    onClick={() => table.setPageIndex(pageNumber - 1)}
                    isActive={table.getState().pagination.pageIndex === pageNumber - 1}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => table.getCanNextPage() && table.nextPage()}
                  className={!table.getCanNextPage() ? 'pointer-events-none  opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
