'use client';

import { User } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import CertificateButton from '@/components/shared/CertificateButton';

interface ProgressSectionProps {
  progress: number;
  courseId: number;
  learnerId: string;
  courseName: string;
  learnerName: string;
  isGenerating: boolean;
  isSharing: boolean;
}

export default function ProgressSection({
  progress,
  courseId,
  learnerId,
  courseName,
  learnerName,
  isGenerating,
  isSharing,
}: ProgressSectionProps) {
  return (
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
} 