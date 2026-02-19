"use client";
import { Skeleton } from "@/components/ui/skeleton";

function CertificateSkeleton() {
  return (
    <div className="p-4 border rounded-md shadow">
      <div className="mb-4">
        <Skeleton className="w-[120px] h-[16px]" />
        <Skeleton className="w-[250px] h-[12px] mt-2" />
      </div>
      <div className="mb-4">
        <Skeleton className="w-[100px] h-[14px]" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map(() => {
          return (
            <Skeleton
              className="w-[180px] h-[180px]"
              key={Math.random() * 100}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CertificateSkeleton;
