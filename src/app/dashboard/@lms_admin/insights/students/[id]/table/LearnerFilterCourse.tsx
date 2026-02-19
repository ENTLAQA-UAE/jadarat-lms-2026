'use client'

import { Table } from '@tanstack/react-table';
import { CourseProfile } from './type'
import { Input } from '@/components/ui/input';

interface LearnerFilterCourseProps {
    table: Table<CourseProfile>;
}


function LearnerFilterCourse({ table }: LearnerFilterCourseProps) {


    return (
        <div className="flex flex-col lg:flex-row md:justify-between gap-2 items-start lg:items-center">
            <div className='relative'>
                <Input
                    placeholder="Filter results..."
                    value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                        table.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="  min-w-[300px] w-full  placeholder:pl-[22px] placeholder:mt-2 "


                />

                {/* <Search className='w-5 h-5 text-gray-400 top-[8px] ltr:left-[12px]  rtl:left-[12px]  absolute' /> */}
            </div>
            
        </div>
    );
}

export default LearnerFilterCourse;
