'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import MobileCourseDrawer from './MobileSide';
import CertificateButton from '@/components/shared/CertificateButton';
import { useAppSelector } from '@/hooks/redux.hook';
import { useRouter } from 'next/navigation';
import { revalidate } from '@/action/revalidate';

/**
 * Course Player Page
 *
 * Routes learners to the correct player based on course type:
 * - SCORM courses -> redirect to /dashboard/course/scorm-player/{slug}
 * - Native courses -> will render CoursePlayer component (Phase 2)
 *
 * This replaces the old Coassemble iframe player.
 */

const ProgressSection = ({
  progress,
  courseId,
  learnerId,
  courseName,
  learnerName,
  isGenerating,
  isSharing,
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
            learnerName,
          }}
          variant="download"
          disabled={isGenerating || isSharing}
        />
        <CertificateButton
          selectedCourse={{
            id: courseId,
            learnerId,
            courseName,
            learnerName,
          }}
          variant="share"
          disabled={isGenerating || isSharing}
        />
      </div>
    )}
  </div>
);

export default function CourseViewer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { courses, user: { id, name } } = useAppSelector(state => state.user);
  const [progress, setProgress] = useState(0);
  const [generatingCertificate] = useState(false);
  const [sharingCertificate] = useState(false);

  const selectedCourse = courses.find(e => e.slug === params.id);

  useEffect(() => {
    if (selectedCourse) {
      setProgress(selectedCourse.percentage ?? 0);
    }
  }, [selectedCourse]);

  // Route SCORM courses to the SCORM player
  useEffect(() => {
    if (selectedCourse?.isscorm) {
      router.replace(`/dashboard/course/scorm-player/${selectedCourse.slug}`);
    }
  }, [selectedCourse, router]);

  // If SCORM, show loading while redirecting
  if (selectedCourse?.isscorm) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Redirecting to SCORM player...</p>
      </div>
    );
  }

  // Native course -- placeholder until CoursePlayer is built in Phase 2
  return (
    <div className="flex h-[100vh] w-full p-0">
      <aside className="hidden w-[300px] flex-col gap-6 bg-muted p-6 md:flex">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full p-2 hover:bg-muted transition-colors"
          onClick={async () => {
            await revalidate(`/dashboard/courses/play/${params.id}`);
            router.back();
          }}
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="sr-only">Back</span>
        </Button>

        <ProgressSection
          progress={progress}
          courseId={selectedCourse?.course_id ?? 0}
          learnerId={id!}
          courseName={selectedCourse?.name ?? ''}
          learnerName={name ?? ''}
          isGenerating={generatingCertificate}
          isSharing={sharingCertificate}
        />
      </aside>

      <main className="flex-1 relative h-[calc(100vh)] flex flex-col">
        <div className="absolute top-[50%] z-[44] left-[0] md:hidden">
          <MobileCourseDrawer
            back={async () => {
              await revalidate(`/dashboard/courses/play/${params.id}`);
              router.back();
            }}
            generatingCertificate={generatingCertificate}
            overallProgress={progress}
            percentage={selectedCourse?.percentage}
            sharingCertificate={sharingCertificate}
            selectedCourse={{
              id: selectedCourse?.course_id ?? 0,
              name: selectedCourse?.name ?? '',
            }}
            id={id}
            name={name}
          />
        </div>

        {/* Native CoursePlayer will go here in Phase 2 */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-semibold">Native Course Player</h2>
            <p className="text-muted-foreground">
              The block-based course player will be available in Phase 2.
              This will render courses created with the native editor.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
