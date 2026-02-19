'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BarCharSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">
          <Skeleton className="h-8 w-64" />
        </CardTitle>
        <Skeleton className="h-8 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full max-w-[250px] mb-4" />
        <div className="space-y-2">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
