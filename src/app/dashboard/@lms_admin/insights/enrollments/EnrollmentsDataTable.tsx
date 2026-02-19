"use client"
import { TableControls } from '@/components/shared/TableControls';
import { columns } from './columns'
import EnrollmentsFilter from './EnrollmentsFilter';
import { Enrollments } from './type';
import { DataTableComponent } from '@/components/DataTable';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportExcel';
import { useState } from 'react';
import { getAllEnrollments } from '@/action/lms-admin/enrollments/enrollmentsActions';



function EnrollmentsDataTable({ Enrollments, currentPage, pageSize, count }: { Enrollments: Enrollments[], currentPage: number, pageSize: number, count: number }) {
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
      const response = await getAllEnrollments()
      if (response.data) {
        exportToExcel(response.data, "exported_enrollments")
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
    setExportLoading(false)
  }

  return (
    <>
      <DataTableComponent
        columns={columns}
        data={Enrollments}
        renderToolbar={(table) => (
          <EnrollmentsFilter table={table} />
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
    </>
  )
}

export default EnrollmentsDataTable