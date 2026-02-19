'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressSection from '@/components/course/ProgressSection';

interface CourseSidebarProps {
  onBack: () => void;
  progress: number;
  courseId: number;
  learnerId: string;
  courseName: string;
  learnerName: string;
  isGenerating: boolean;
  isSharing: boolean;
}

export function CourseSidebar({
  onBack,
  progress,
  courseId,
  learnerId,
  courseName,
  learnerName,
  isGenerating,
  isSharing,
}: CourseSidebarProps) {
  return (
    <aside className="hidden w-[300px] flex-col gap-6 bg-muted p-6 md:flex h-full">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full p-2 hover:bg-muted transition-colors"
        onClick={onBack}
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="sr-only">Back</span>
      </Button>

      <ProgressSection
        progress={progress}
        courseId={courseId}
        learnerId={learnerId}
        courseName={courseName}
        learnerName={learnerName}
        isGenerating={isGenerating}
        isSharing={isSharing}
      />
    </aside>
  );
} 