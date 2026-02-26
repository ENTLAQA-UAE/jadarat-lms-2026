'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Build Course Page -- Native Block Editor (Stub)
 *
 * This page replaces the old Coassemble iframe builder.
 * The full EditorCanvas will be implemented in Phase 1.
 * For now, it shows a placeholder with the course ID.
 */
export default function BuildCoursePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No course ID provided.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 border-b px-6 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/courses')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Course Editor</h1>
        <span className="text-sm text-muted-foreground">Course #{courseId}</span>
      </div>

      {/* Placeholder for EditorCanvas (Phase 1) */}
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Native Block Editor</h2>
          <p className="text-muted-foreground">
            The drag-and-drop block editor is being built. This will replace the
            old Coassemble iframe with a native editing experience.
          </p>
          <p className="text-sm text-muted-foreground">
            Phase 1 deliverable -- Coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
