import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
} from 'lucide-react';
import React from 'react';

export type Subscription = {
  id: string;
  package: string;
  totalAllowedUsers: number;
  totalAllowedCourses: number;
  totalAllowedContentCreators: number;
  associatedOrganizations: number;
};

export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: 'package',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Subscription Package
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="exclude-weglot">{row.original.package}</div>

    )
  },
  {
    accessorKey: 'totalAllowedUsers',
    header: 'Total Allowed Users',
  },
  {
    accessorKey: 'totalAllowedCourses',
    header: 'Total Allowed Courses',
  },
  {
    accessorKey: 'totalAllowedContentCreators',
    header: 'Total Allowed Content Creators',
  },
  {
    accessorKey: 'associatedOrganizations',
    header: 'Associated Organizations',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const subscription = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('View', subscription)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', subscription)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Delete', subscription)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
