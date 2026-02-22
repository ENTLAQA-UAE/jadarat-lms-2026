"use client"
import { TableControls } from '@/components/shared/TableControls';
import { columns } from './columns'
import CoursesFilter from './CoursesFilter';

import { DataTableComponent } from '@/components/DataTable';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { exportCourses } from '@/action/lms-admin/insights/courses/coursesAction';
import { exportToExcel } from '@/utils/exportExcel';
import Image from 'next/image';
import Link from 'next/link';
import { InsightsCourseColumnsProps } from './type';



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
            renderMobileCard={(row: InsightsCourseColumnsProps) => (
                <Card key={row.course_id}>
                    <CardContent className="p-4">
                        <div className="flex gap-3 mb-3">
                            {row.thumbnail && (
                                <Image
                                    src={row.thumbnail}
                                    alt={row.name}
                                    width={64}
                                    height={64}
                                    className="h-16 w-16 rounded object-cover shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-sm truncate exclude-weglot">{row.name}</p>
                                <p className="text-xs text-muted-foreground exclude-weglot">{row.category}</p>
                                <Badge className="mt-1" variant={row.status === "Published" ? "default" : "outline"}>
                                    {row.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div>
                                <span className="text-muted-foreground">Enrollments: </span>
                                <span className="font-medium">{row.enrollments}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Completions: </span>
                                <span className="font-medium">{row.completions}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Created: </span>
                                <span className="font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">By: </span>
                                <span className="font-medium exclude-weglot">{row.created_by_name}</span>
                            </div>
                        </div>
                        <Link href={`/dashboard/insights/courses/${row.course_id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                                View Details
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        />
    )
}

export default CourseTable
