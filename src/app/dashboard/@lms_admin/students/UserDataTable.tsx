'use client'

import { useState } from 'react'
import { Learner } from './type'
import { DataTableComponent } from '@/components/DataTable'
import { columns } from './columns'
import { TableControls } from '@/components/shared/TableControls'
import { useRouter } from 'next/navigation'
import TableSkeleton from '@/components/skeleton/TableSkeleton'
import { exportToExcel } from '@/utils/exportExcel'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { getAllLearners } from '@/action/lms-admin/insights/students/studentsActions'
import StudentsFilter from './StudentFilter'

export default function UserDataTable({
  students,
  currentPage,
  pageSize,
  count,
  loading
}: {
  students: Learner[]
  currentPage: number
  pageSize: number
  count: number
  loading: boolean
}) {
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
      const response = await getAllLearners()
      if (response.data) {
        exportToExcel(response.data, "exported_data")
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
    setExportLoading(false)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTableComponent
          columns={columns}
          data={students}
          renderToolbar={() => (
            <StudentsFilter />
          )}
          controls={() => (
            <TableControls
              currentPage={currentPage}
              pageSize={pageSize}
              count={count}
              onPageChange={handlePageChange}
            />
          )}
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
        />
      )}
    </div>
  )
}