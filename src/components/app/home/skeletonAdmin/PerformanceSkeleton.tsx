import { Skeleton } from "@/components/ui/skeleton";

function PerformanceSkeleton() {
  return (
    <div
      className="w-full max-w-4xl max-h-[420px] bg-background border rounded-lg shadow"
      x-chunk="dashboard-01-chunk-5"
    >
      <div className="p-6">
        <Skeleton className="w-[120px] h-[20px]"></Skeleton>
      </div>
      <div className="px-6 pb-6 grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }).map((_, i) => {
          return (
            <div
              key={i}
              className="bg-gray-100 rounded-lg p-4 flex items-center gap-4"
            >
              <div className="bg-gray-300 w-[20px] h-[20px] rounded-full p-2"></div>
              <div className="w-full">
                <Skeleton className="w-[80px] h-[18px]"></Skeleton>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-[80px] h-[18px]"></Skeleton>
                  <Skeleton className="w-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PerformanceSkeleton;