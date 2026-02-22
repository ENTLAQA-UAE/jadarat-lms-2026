import { Skeleton } from "@/components/ui/skeleton";

function RecentCoursesSideBarSkeleton() {
  return (
    <>
      <aside className="hidden  flex-col gap-6 bg-muted p-6 md:flex">
       
        <Skeleton className="bg-muted-foreground/30 mt-1  w-[100px] h-[20px]" />
        <div className="flex flex-col gap-6">
          <Skeleton className="flex items-center  gap-4 bg-muted-foreground/20 p-2">
          <Skeleton className="w-[50px] h-[50px]   " />
          <Skeleton className="w-[150px] h-[80px]   " />
          </Skeleton>
          <Skeleton className="flex items-center  gap-4 bg-muted-foreground/30 p-2">
          <Skeleton className="w-[50px] h-[50px]   " />
          <Skeleton className="w-[150px] h-[92px]   " />
          </Skeleton>
          {/* <Skeleton className="w-[252px] h-[92px] bg-muted-foreground/30" /> */}
        </div>
      </aside>
    </>
  );
}

export default RecentCoursesSideBarSkeleton;
