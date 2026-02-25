import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SubscriptionSkelton = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="w-[100px] h-[24px]"></Skeleton>
        <Skeleton className="w-[200px] h-[14px]"></Skeleton>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-[90px] h-[14px]"></Skeleton>
            <Skeleton className="w-[70px] h-[14px] " />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-[90px] h-[14px]"></Skeleton>
            <Skeleton className="w-[70px] h-[14px]" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-4">
        <Skeleton className="flex items-center gap-2 w-[150px] h-[24px]">
          <Skeleton className="h-5 w-5" />
        </Skeleton>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionSkelton;
