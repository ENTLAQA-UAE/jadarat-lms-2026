"use client"
import * as React from 'react'

import { Switch } from "@/components/ui/switch"
import {
    ColumnDef,
    flexRender,
    SortingState,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from './button'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Skeleton } from './skeleton';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    enablePagination?: boolean,
    title?: string,
    viewAll?: {
        visible?: boolean,
        url: string
    },
    withLoading?: boolean,
    toggle?: {
        title: string,
        visible: boolean,
        value?: boolean,
        onChange: React.Dispatch<React.SetStateAction<boolean>>
    },
    hideCols?: VisibilityState,
    onlyTable?: boolean
    emptyMessage?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    enablePagination = false,
    title,
    viewAll,
    withLoading = false,
    toggle,
    hideCols,
    onlyTable,
    emptyMessage
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})

    React.useEffect(() => {
        if (hideCols) {
            setColumnVisibility(st => ({ ...st, ...hideCols }))
        }
    }, [hideCols])

    const table = useReactTable({
        data,
        columns,
        manualPagination: !enablePagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnVisibility,
        },
    })


    const pageInfo = React.useMemo(() => {
        const pageIndex = table.getState().pagination.pageIndex;
        const from = (pageIndex * table.getPaginationRowModel().rows.length + 1);
        const to = ((pageIndex + 1) * table.getPaginationRowModel().rows.length);
        return <p className='text-sm text-muted-foreground'>{`${from}-${to} of ${data.length} ${title}`}</p>
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.length, table?.getState()?.pagination, title])

    return (
        <div className='min-w-full lg:max-w-[700px] overflow-auto'>
            {onlyTable ? <></> : <div className='flex items-center'>
                <div className="flex items-center space-x-4 w-full">
                    {toggle?.visible ? <div className="flex items-center space-x-2">
                        <Switch defaultChecked={toggle?.value} onCheckedChange={toggle.onChange} />
                        <span className="text-sm font-medium">{toggle?.title}</span>
                    </div> : <></>}
                </div>
                {viewAll?.visible ? <Button asChild size="sm" className="ml-auto gap-1 me-3">
                    <Link href={viewAll.url}>
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button> : <></>}
            </div>}
            <div className="rounded-md">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
    {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => {
            const rowData = row.original; // This gets the original row data
          
            return (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className='exclude-weglot'>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                </TableRow>
            );
        })
    ) : withLoading ? [...Array(5)].map(() => {
        return (
            <TableRow key={Math.random() * 100} >
                <TableCell colSpan={columns.length} className="h-[88px] mb-2">
                    <Skeleton className="w-full h-full" />
                </TableCell>
            </TableRow>
        );
    }) : (
        <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage ?? "No results."}
            </TableCell>
        </TableRow>
    )}
</TableBody>
                </Table>
            </div>
            {enablePagination &&
                <div className='flex items-center justify-between'>
                    {data.length ? pageInfo : <div />}
                    <div className='flex items-center justify-end gap-4'>
                        <Select onValueChange={size => {
                            table.setPageSize(parseFloat(size))
                        }}>
                            <SelectTrigger className="w-fit">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="40">40</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center justify-end space-x-2 py-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}
