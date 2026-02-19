import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from "@/components/ui/skeleton";

interface LearnerDetailsProps {
    learner: {
        profilePicture: string;
        name: string;
        department: string;
        jobTitle: string;
        group: string;
    };
    isLoading: boolean;
}

const LearnerDetails: FC<LearnerDetailsProps> = ({ learner, isLoading }) => {
    if (isLoading) {
        return <LearnerDetailsSkeleton />;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Learner Details</CardTitle>
            </CardHeader>
            <CardContent className="flex rtl:gap-4 items-center space-x-4">
                <Avatar className="size-24">
                    <AvatarImage src={learner.profilePicture} alt={learner.name} />
                    <AvatarFallback className='exclude-weglot'>{learner.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold exclude-weglot ">{learner.name}</p>
                    <p className='exclude-weglot'>{learner.department}</p>
                    <p className='exclude-weglot'>{learner.jobTitle}</p>
                    <p className='exclude-weglot'>{learner.group}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const LearnerDetailsSkeleton: FC = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
            <Skeleton className="size-24 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
            </div>
        </CardContent>
    </Card>
);

export default LearnerDetails;