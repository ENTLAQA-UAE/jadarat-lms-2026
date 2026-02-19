"use client"
import { TableControls } from '@/components/shared/TableControls';
import { columns } from './columns'
import CoursesFilter from './CoursesFilter';

import { DataTableComponent } from '@/components/DataTable';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportCourses } from '@/action/lms-admin/insights/courses/coursesAction';
import { exportToExcel } from '@/utils/exportExcel';



function CourseTable({ courses, count, currentPage, pageSize }: { courses: any, count?: number, currentPage?: number, pageSize?: number }) {
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
            const response = await exportCourses()
            if (response.data) {
                exportToExcel(response, "exported_courses")
            }
        } catch (error) {
            console.error('Error exporting data:', error)
        }
        setExportLoading(false)
    }
    
    return (
        <DataTableComponent
            columns={columns}
            data={courses}
            renderToolbar={() => (
                <CoursesFilter />
            )}
            controls={() => (
                <TableControls
                    currentPage={currentPage ?? 1}
                    pageSize={pageSize ?? 10}
                    count={count ?? 0}
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
    )
}

export default CourseTable