import React, { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSelectedCourse } from '@/app/dashboard/@learner/course/[id]/getCourses';



function TestMode({ coassembleId, name }: { coassembleId: string | null, name?: string | null }) {
    const [selectedCourse, setSelectedCourse] = useState<{ title: string } | null>(null)

    useEffect(() => {
        if (coassembleId) {
            getSelectedCourse(parseFloat(coassembleId))
                .then(response => setSelectedCourse(response));
        }

    }, [coassembleId]);


    return (
        <div className="absolute bg-[#FED141] text-black w-full z-[33] h-[8px] top-[2px] bottom-13">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-[260px] text-xs uppercase mt-1 px-4 py-3 text-center h-9 rounded-lg bg-[#FED141] mx-auto">
                            <span className="block truncate">
                                {name || selectedCourse?.title || 'Test Mode'}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{name || selectedCourse?.title || 'Test Mode'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default TestMode