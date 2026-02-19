import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import { DeleteButton } from './DeleteButton';
import { Course } from '../type';



export const ActionsCell = ({ course }: { course: Course }) => {

    return (
        <div className='flex items-center gap-2'>
            <Button asChild size={'icon'} variant={"outline"}>
                <Link href={`/dashboard/courses/edit-course/${course.course_id}`}>
                    <Edit className='w-5 h-5' />
                </Link>
                {/* <span><Edit className='w-5 h-5' /></span> */}
            </Button>
            <DeleteButton courseId={course.course_id} />
        </div>
    );

};