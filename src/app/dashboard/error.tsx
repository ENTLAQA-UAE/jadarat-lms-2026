'use client';

import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 w-full">
      <h1 className="text-2xl font-bold text-destructive">
        Something went wrong loading the dashboard
      </h1>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
