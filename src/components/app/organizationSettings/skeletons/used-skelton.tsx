import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// import { CardContent } from "@/components/ui/card"; // Assuming you have a CardContent component

const UsedSkelton = () => {
  return (
    <Card className="grid  px-2 p-4">
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center mb-2 justify-between">
            <Skeleton className="text-sm font-medium w-[50px] h-[15px]"></Skeleton>
            <div className="text-sm">
              <Skeleton className="h-4 w-20 " />
            </div>
          </div>

          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <div className="flex items-center mb-2 justify-between">
            <Skeleton className="text-sm font-medium w-[50px] h-[15px]"></Skeleton>
            <div className="text-sm">
              <Skeleton className="h-4 w-20 " />
            </div>
          </div>

          <Skeleton className="h-4 w-full" />
        </div>
        <div>
          <div className="flex items-center mb-2 justify-between">
            <Skeleton className="text-sm font-medium w-[50px] h-[15px]"></Skeleton>
            <div className="text-sm">
              <Skeleton className="h-4 w-20 " />
            </div>
          </div>

          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UsedSkelton;
