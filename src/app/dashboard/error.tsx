'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route_segment: 'dashboard' },
    });
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 w-full px-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h1 className="text-xl font-bold text-destructive">
        Something went wrong loading the dashboard
      </h1>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
