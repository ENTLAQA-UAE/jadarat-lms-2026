"use client"
import { Button } from '@/components/ui/button';
import { columns } from './columns'
import CompletionsFilter from './CompletionsFilter';
import { Student } from './type';
import { DataTableComponent } from '@/components/DataTable';
import { TableControls } from '@/components/shared/TableControls';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportExcel';
import { getAllCompletions } from '@/action/lms-admin/insights/completions/completionsActions';


function CompletionsDataTable({  completionsData, count , currentPage , pageSize }: { completionsData: Student[], count: number, currentPage: number, pageSize: number }) {
  const router = useRouter()
  const [exportLoading, setExportLoading] = useState(false)

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}`, { scroll: false })
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const { data } = await getAllCompletions()
      if (data) {
        exportToExcel(data, "exported_completions")
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
        data={completionsData}
        renderToolbar={(table) => (
          <CompletionsFilter table={table} />
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

export default CompletionsDataTable