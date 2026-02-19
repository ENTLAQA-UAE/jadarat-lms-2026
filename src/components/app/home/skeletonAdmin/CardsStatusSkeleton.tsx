import { Skeleton } from "@/components/ui/skeleton";

function CardStatusSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 shadow-sm" x-chunk="dashboard-01-chunk-0">
          <div className="flex flex-row gap-6 items-center justify-between pb-2">
            <Skeleton className="w-[40px] h-[14px]" />
            <Skeleton className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <Skeleton className="w-[80px] h-[20px] my-4" />
            <Skeleton className="text-xs w-[100px] h-[14px] my-2 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardStatusSkeleton;
