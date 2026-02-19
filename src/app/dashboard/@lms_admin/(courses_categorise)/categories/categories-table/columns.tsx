'use client'
import { ColumnDef } from '@tanstack/react-table';
import { Category } from './type';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import Image from 'next/image';
import PlaceholderImage from '@/../public/placeholder.png';
import TableAction from './components/TableAction';
import { useLanguage } from '@/context/language.context';
import useSWR from 'swr';
import { fetchAllCategories } from '@/action/categories/categoriesActions';


export const GetColumn = () => {
  const { isRTL } = useLanguage()
  const { data: categoriesData, error } = useSWR('categories', fetchAllCategories)
  const columns: ColumnDef<Category>[] =
    [

      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => <div className='flex items-center gap-2'>
          {row.original.id}
        </div>,
      },

      {
        accessorKey: 'name',
        header: 'Category Name',
        cell: ({ row }) => <div className="text-sm truncate  lg:text-base exclude-weglot ">{isRTL ? row.original.ar_name : row.original.name}</div>,
      },
      {
        accessorKey: 'image',
        header: 'Category Image',
        cell: ({ row }) => <Image src={row.original.image || PlaceholderImage} loading='lazy' alt={row.original.name} width={60} height={30} />,
      },

      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => <div>{new Date(row.original.created_at).toLocaleDateString()}</div>

      },

      {
        accessorKey: 'id',
        header: 'Actions',
        cell: ({ row }) => (
          <TableAction row={row} categoriesData={categoriesData} key={'categoriesData'} />
        ),
      },

    ];
  return columns
}


