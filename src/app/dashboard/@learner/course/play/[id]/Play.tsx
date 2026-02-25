'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';

// Components
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import MobileCourseDrawer from './MobileSide';
import CertificateButton from '@/components/shared/CertificateButton';

// Hooks & Utils
import { useAppSelector } from '@/hooks/redux.hook';
import { createClient } from '@/utils/supabase/client';
import { getUserCourses } from '@/utils/getUserCourses';
import { getSelectedCourse } from '../../[id]/getCourses';
import { getSignedURL } from './getSignedURL';

// Types
import { coassembleType } from '../../[id]/types';
import TestMode from '@/components/shared/TestMode';
import { revalidate } from '@/action/revalidate';
import { useRouter } from 'next/navigation';

// Custom Hook for Course Data
const useCourseData = (courseSlug: string, coassembleId?: string) => {
  const [state, setState] = useState({
    coassembleCourse: null as coassembleType | null,
    courseURL: null as string | null,
    overallProgress: 0,
    generatingCertificate: false,
    sharingCertificate: false
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return [state, updateState] as const;
};

// Progress Handler Component
const ProgressSection = ({
  progress,
  courseId,
  learnerId,
  courseName,
  learnerName,
  isGenerating,
  isSharing
}: {
  progress: number;
  courseId: number;
  learnerId: string;
  courseName: string;
  learnerName: string;
  isGenerating: boolean;
  isSharing: boolean;
}) => (
  <div>
    <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
      <User className="w-5 h-5" />
      Overall Progress
    </h3>
    <div className="flex items-center gap-2 mb-6 rounded-lg bg-background p-2 shadow-sm">
      <div className="flex-1 py-2">
        <div className="text-xs text-muted-foreground">Overall Progress</div>
        <div className="font-semibold text-sm">{progress}%</div>
        <Progress value={progress} className="mt-2" />
      </div>
    </div>
    {progress === 100 && (
      <div className="w-full space-y-4">
        <CertificateButton
          selectedCourse={{
            id: courseId,
            learnerId,
            courseName,
            learnerName
          }}
          variant="download"
          disabled={isGenerating || isSharing}
        />
        <CertificateButton
          selectedCourse={{
            id: courseId,
            learnerId,
            courseName,
            learnerName
          }}
          variant="share"
          disabled={isGenerating || isSharing}
        />
      </div>
    )}
  </div>
);

// Message Handler for WebSocket
const useMessageHandler = (courseId: number, overallProgress: number, updateProgress: (progress: number) => void) => {
  return useCallback(async (message: MessageEvent) => {
    if (message.origin !== 'https://coassemble.com') return;

    const payload = JSON.parse(message.data);

    // Extract payload data
    const { type, event, data } = payload;
    const newProgress = data?.progress;

    // Check if it's a course completion event
    const isCourseComplete = type === "course" && event === "complete";

    if (typeof newProgress === 'number') {
      // Only update if:
      // 1. It's a course completion event (set to 100) OR
      // 2. New progress is greater than current AND less than 100
      if (isCourseComplete || (!isCourseComplete && newProgress > overallProgress && newProgress < 100)) {
        const finalProgress = isCourseComplete ? 100 : newProgress;
        updateProgress(finalProgress);

        const supabase = createClient();
        await supabase.rpc('update_course_percentage', {
          courseid: courseId,
          percentage: finalProgress,
          scormdata: null
        });
      }
    }
  }, [courseId, overallProgress, updateProgress]);
};


export default function CourseViewer({ params }: { params: { id: string } }) {

  const router = useRouter()

  const { courses, user: { id, organization_id, name } } = useAppSelector(state => state.user);
  const [progress, setProgress] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<{
    id: number;
    percentage: number | undefined;
    coassemble_id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (courses) {
      const selectedCourse = courses.find(e => e.slug === params.id);
      if (selectedCourse) {
        setSelectedCourse({
          id: selectedCourse.id,
          percentage: selectedCourse.percentage,
          coassemble_id: selectedCourse.coassemble_id || "",
          name: selectedCourse.name
        });
        setProgress(selectedCourse.percentage ?? 0);
      }
    }
  }, [courses, params.id])

  //  const selectedCourse = useMemo(() =>
  //   courses.find(e => e.slug === params.id),
  //   [courses, params.id]
  //   );



  const coassembleId = selectedCourse?.coassemble_id;

  const [
    { coassembleCourse, courseURL, generatingCertificate, sharingCertificate },
    updateState
  ] = useCourseData(params.id, coassembleId);

  // Load course data
  useEffect(() => {
    if (params.id && !coassembleCourse && coassembleId) {
      getSelectedCourse(parseFloat(coassembleId))
        .then(response => updateState({ coassembleCourse: response }));
    }
    if (!courses.length) getUserCourses();
  }, [coassembleCourse, coassembleId, courses.length, params.id, updateState]);

  // Get signed URL
  useEffect(() => {
    if (id && organization_id && coassembleId && !courseURL) {
      getSignedURL(coassembleId)
        .then(response => updateState({ courseURL: response }));
    }
  }, [coassembleId, courseURL, id, organization_id, updateState]);

  // Handle WebSocket messages
  const handleMessage = useMessageHandler(
    selectedCourse?.id ?? 0,
    progress,
    progress => setProgress(progress)
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="flex h-[100vh] w-full p-0">
      <aside className="hidden w-[300px] flex-col gap-6 bg-muted p-6 md:flex">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full p-2 hover:bg-muted transition-colors"
          onClick={async () => {
            await revalidate(`/dashboard/courses/play/${params.id}`)
            router.back()
          }}
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Button>

        <ProgressSection
          progress={progress}
          courseId={selectedCourse?.id ?? 0}
          learnerId={id!}
          courseName={selectedCourse?.name ?? ""}
          learnerName={name ?? ""}
          isGenerating={generatingCertificate}
          isSharing={sharingCertificate}
        />
      </aside>

      <main className="flex-1 relative h-[calc(100vh)] flex flex-col">
        <div className="absolute top-[50%] z-[44] left-[0] md:hidden">
          <MobileCourseDrawer
            back={async () => {
              await revalidate(`/dashboard/courses/play/${params.id}`)
              router.back()
            }}
            generatingCertificate={generatingCertificate}
            overallProgress={progress}
            percentage={selectedCourse?.percentage}
            sharingCertificate={sharingCertificate}
            selectedCourse={selectedCourse}
            id={id}
            name={name}
          />
        </div>

        {courseURL ? (
          <iframe
            title="Course content"
            src={courseURL}
            className="w-full relative h-[calc(100vh)]"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading course content...</p>
          </div>
        )}

        {/* <div className="absolute bg-[#FED141] text-black w-full z-[33] h-[8px] top-[2px] bottom-13">
     <TooltipProvider>
      <Tooltip>
       <TooltipTrigger asChild>
        <div className="w-[260px] text-xs uppercase mt-1 px-4 py-3 text-center h-9 rounded-lg bg-[#FED141] mx-auto">
         <span className="block truncate">
          {selectedCourse?.name || 'Loading...'}
         </span>
        </div>
       </TooltipTrigger>
       <TooltipContent>
        <p>{selectedCourse?.name || 'Loading...'}</p>
       </TooltipContent>
      </Tooltip>
     </TooltipProvider>
    </div> */}
        <TestMode coassembleId={coassembleId ?? null} name={selectedCourse?.name ?? null} />
      </main>
    </div>
  );
}