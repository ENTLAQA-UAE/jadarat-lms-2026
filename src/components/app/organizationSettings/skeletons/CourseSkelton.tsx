import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CourseSkelton = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="w-[100px] h-[24px]"></Skeleton>
        <Skeleton className="w-[200px] h-[20px]"></Skeleton>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-[120px] h-[14px]"></Skeleton>
            <Skeleton className="w-[40px] h-[14px] " />
          </div>
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="w-[120px] h-[14px]"></Skeleton>
            <Skeleton className="w-[40px] h-[14px]" />
          </div>

          <Skeleton className="text-sm w-[200px] h-[14px]"></Skeleton>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Skeleton className="flex items-center gap-2 w-[100px] h-[14px]">
          <Skeleton className="h-5 w-5" />
        </Skeleton>
      </CardFooter>
    </Card>
  );
};

export default CourseSkelton;
