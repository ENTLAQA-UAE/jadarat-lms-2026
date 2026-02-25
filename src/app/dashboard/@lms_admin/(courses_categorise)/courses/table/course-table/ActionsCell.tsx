'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Loader2 } from 'lucide-react';
import { DeleteButton } from './DeleteButton';
import { Course, CoursePublishStatus } from '../type';
import { CourseStatusBadge } from '@/components/shared/StatusBadge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { updateCourseStatus } from '@/action/lms-admin/insights/courses/courseStatusAction';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const statusOptions: { value: CoursePublishStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'private', label: 'Private' },
    { value: 'published', label: 'Published' },
];

export const ActionsCell = ({ course }: { course: Course }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    const handleStatusChange = async (newStatus: CoursePublishStatus) => {
        if (newStatus === (course.status ?? 'draft')) return;

        setIsUpdating(true);
        try {
            const result = await updateCourseStatus(course.course_id, newStatus);
            if (result.error) {
                toast.error('Error', {
                    description: result.error,
                });
            } else {
                toast.success('Status Updated', {
                    description: `Course status changed to "${newStatus}"`,
                });
                router.refresh();
            }
        } catch {
            toast.error('Error', {
                description: 'Failed to update course status',
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const currentStatus = course.status ?? 'draft';

    return (
        <div className='flex items-center gap-2'>
            <Button asChild size={'icon'} variant={"outline"} aria-label="Edit course">
                <Link href={`/dashboard/courses/edit-course/${course.course_id}`}>
                    <Edit className='w-5 h-5' />
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isUpdating} className="min-w-[100px]">
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CourseStatusBadge status={currentStatus} />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className="flex items-center gap-2"
                        >
                            <CourseStatusBadge status={option.value} />
                            {option.value === currentStatus && (
                                <span className="text-xs text-muted-foreground">(current)</span>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DeleteButton courseId={course.course_id} />
        </div>
    );
};
