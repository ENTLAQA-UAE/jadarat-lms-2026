"use client"
import { Button } from '@/components/ui/button';
import { columns } from './columns'
import CompletionsFilter from './CompletionsFilter';
import { Student } from './type';
import { DataTableComponent } from '@/components/DataTable';
import { TableControls } from '@/components/shared/TableControls';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportExcel';
import { getAllCompletions } from '@/action/lms-admin/insights/completions/completionsActions';
import Link from 'next/link';


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
        renderMobileCard={(row: Student) => (
          <Card key={row.enrollment_id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate exclude-weglot">{row.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span className="font-medium text-right truncate max-w-[60%] exclude-weglot">{row.course}</span>
                </div>
                {row.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department</span>
                    <span className="font-medium exclude-weglot">{row.department}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{new Date(row.completion_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={row.progress_percentage} className="h-2 flex-1" />
                <span className="text-xs font-medium shrink-0">{row.progress_percentage}%</span>
              </div>
              <Link href={`/dashboard/insights/completions/${row.course_id}?user_id=${row.user_id}`}>
                <Button size="sm" variant="outline" className="w-full mt-1">
                  Show Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      />
    </>
  )
}

export default CompletionsDataTable
