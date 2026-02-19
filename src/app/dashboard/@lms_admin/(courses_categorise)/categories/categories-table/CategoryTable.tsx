"use client"
import { DataTableComponent } from '@/components/DataTable'
import { GetColumn } from "./columns"
import CategoryFilter from './CategoryFilter'
import CategoryHeader from './CategoryHeader'
import { CSVButton } from '../CSVButton'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { exportToExcel } from '@/utils/exportExcel'
import { TableControls } from '@/components/shared/TableControls'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { fetchAllCategories } from '@/action/categories/categoriesActions'


export default function CategoryTable({ AllCategories, page, pageSize, filters , count}: { AllCategories: any, page: number, pageSize: number, filters: any , count: number }) {
  const columns = GetColumn()
  const router = useRouter()
  const [exportLoading, setExportLoading] = useState(false)

  const handlePageChange = (newPage: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('page', newPage.toString())
    router.push(`?${searchParams.toString()}`, { scroll: false })
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      // Call the server action
      const data = await fetchAllCategories()
      if (data) {
        exportToExcel(data, "exported_categories")
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
    setExportLoading(false)
  }


  return (
    <>
      <div className='flex flex-col mt-4 px-1'>
        <div className='flex items-center justify-between'>
          <h1 className="text-2xl font-bold">Categories</h1>
          <CSVButton/>
        </div>
        <DataTableComponent
          data={AllCategories}
          columns={columns}
          renderToolbar={() => <CategoryFilter />}
          headerLinks={() => <CategoryHeader />}
          actionTable={() => (
            <Button
              variant="outline"
              className='w-full md:w-fit'
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export'} <Download className="ms-2 h-4 w-4" />
            </Button>
          )}
          controls={() => (
            <TableControls
              currentPage={page ?? 1}
              pageSize={pageSize ?? 10}
              count={count ?? 0}
              onPageChange={handlePageChange}
            />
          )}
        />
      </div>
    </>
  )
}