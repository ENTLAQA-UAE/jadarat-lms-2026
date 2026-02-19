'use client';
import { TableControls } from '@/components/shared/TableControls';
import CoursesFilter from './CoursesFilter';

import { DataTableComponent } from '@/components/DataTable';
import { getColumns } from './columns';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  PlusCircle,
  FileUp,
  Sparkles,
  Loader2,
  FolderClosed,
} from 'lucide-react';
import { exportCourses } from '@/action/lms-admin/insights/courses/coursesAction';
import { exportToExcel } from '@/utils/exportExcel';
import Link from 'next/link';
import { useAppSelector } from '@/hooks/redux.hook';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAiAndDocumentBuilder } from '@/action/organization/organizationAction';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseTableProps {
  courses: any;
  count?: number;
  currentPage?: number;
  pageSize?: number;
  userRole?: string;
}

function CourseTable({
  courses,
  count = 0,
  currentPage = 1,
  pageSize = 10,
  userRole = '',
}: CourseTableProps) {
  const router = useRouter();
  const [isExportLoading, setIsExportLoading] = useState(false);
  const columns = getColumns(userRole);

  function handlePageChange(newPage: number) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('page', newPage.toString());
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  async function handleExport() {
    setIsExportLoading(true);
    try {
      const data = await exportCourses();
      if (data) {
        exportToExcel(data, 'exported_courses');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    setIsExportLoading(false);
  }

  return (
    <DataTableComponent
      columns={columns}
      data={courses}
      renderToolbar={() => <CoursesFilter />}
      controls={() => (
        <TableControls
          currentPage={currentPage}
          pageSize={pageSize}
          count={count}
          onPageChange={handlePageChange}
        />
      )}
      actionTable={() => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="w-full md:w-fit"
            onClick={handleExport}
            disabled={isExportLoading}
          >
            {isExportLoading ? 'Exporting...' : 'Export'}{' '}
            <Download className="ms-2 h-4 w-4" />
          </Button>
          <CoursesHeaderLinks role={userRole} />
        </div>
      )}
    />
  );
}

export default CourseTable;

function CoursesHeaderLinks({ role }: { role: string }) {
  const {
    settings,
    loading: orgLoading,
  } = useAppSelector((state: any) => state.organization);
  const [features, setFeatures] = useState<{
    ai_builder: boolean;
    document_builder: boolean;
    create_courses: boolean;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const organization_id = settings?.organization_id;


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAiAndDocumentBuilder(organization_id);
      setFeatures(data as { ai_builder: boolean; document_builder: boolean; create_courses: boolean });
    } catch (error) {
      console.error('Error fetching AI and Document Builder data:', error);
    } finally {
      setLoading(false);
    }
  }, [organization_id]);

  useEffect(() => {
    if (!orgLoading) {
      fetchData();
    }
  }, [orgLoading, fetchData]);

  const handleNoSubscriptionClick = (message: string) => {
    toast.info(message);
  };

  if (role !== 'LMSAdmin') return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading || !features?.create_courses}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add New Course
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <CourseLinkItem
          key="from-scratch"
          href="/dashboard/courses/add-course"
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
          label="From Scratch"
        />
        {loading ? (
          <>
            <Skeleton className="h-9 px-2 py-1.5 text-sm">
              <div className="flex items-center">
                <FileUp className="mr-2 h-4 w-4" />
                From Document
              </div>
            </Skeleton>
            <Skeleton className="h-9 px-2 py-1.5 text-sm">
              <div className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with A.I
              </div>
            </Skeleton>
          </>
        ) : (
          <>
            <CourseLinkItem
              key="from-document"
              href={
                features?.document_builder
                  ? '/dashboard/courses/add-course?flow=document'
                  : undefined
              }
              icon={<FileUp className="mr-2 h-4 w-4" />}
              label="From Document"
              onClick={() =>
                !features?.document_builder &&
                handleNoSubscriptionClick(
                  'You need a subscription for Document Builder.'
                )
              }
            />
            <CourseLinkItem
              key="generate-with-ai"
              href={
                features?.ai_builder
                  ? '/dashboard/courses/add-course?flow=ai'
                  : undefined
              }
              icon={<Sparkles className="mr-2 h-4 w-4" />}
              label="Generate with A.I"
              onClick={() =>
                !features?.ai_builder &&
                handleNoSubscriptionClick(
                  'You need a subscription for AI Builder.'
                )
              }
            />
            <CourseLinkItem
              key="scorm"
              href={'/dashboard/courses/add-course?flow=scorm'}
              icon={<FolderClosed className="mr-2 h-4 w-4" />}
              label="SCORM"
            />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const CourseLinkItem = ({
  href,
  icon,
  label,
  onClick,
}: {
  href?: string;
  icon: JSX.Element;
  label: string;
  onClick?: () => void;
}) => (
  <DropdownMenuItem onClick={onClick}>
    {href ? (
      <Link href={href} className="flex gap-1 items-center">
        {icon}
        {label}
      </Link>
    ) : (
      <div className="flex gap-1 items-center cursor-pointer">
        {icon}
        {label}
      </div>
    )}
  </DropdownMenuItem>
);
