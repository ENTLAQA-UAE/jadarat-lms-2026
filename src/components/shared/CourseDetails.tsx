import Image from 'next/image';
import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import CertificateButton from '@/components/shared/CertificateButton';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseDetailsType {
  image: string;
  name: string;
  category: string;
  enrollmentDate: string;
  completionPercentage: number;
}

interface CourseDetailsProps {
  course: CourseDetailsType | null;
  id: string | string[];
  isLoading: boolean;
  learnerName: string
  learnerId: string
}

const CourseDetails: FC<CourseDetailsProps> = ({ course, id, isLoading ,learnerName ,learnerId }) => {
  if (isLoading || !course) {
    return <CourseDetailsSkeleton />;
  }

  const enrollmentDate = new Date(course.enrollmentDate).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:block space-y-4">
        <div className="flex flex-col rtl:gap-4  md:flex-row md:justify-start items-center gap-2 text-center md:text-start space-x-4">
          <CourseImage src={course.image} alt={`${course.name} image`} />
          <CourseInfo
            name={course.name}
            category={course.category}
            enrollmentDate={enrollmentDate}
            completionPercentage={course.completionPercentage}
          />
        </div>
        <CertificateButton
          selectedCourse={{ id: Number(id), learnerId: learnerId.toString(), courseName: course.name, learnerName: learnerName }}
          variant="download"
          disabled={+course.completionPercentage < 100}
        />
      </CardContent>
    </Card>
  );
};

const CourseImage: FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <Image
    src={src || ""}
    alt={alt}
    width={250}
    height={150}
    className="rounded-lg"
  />
);

interface CourseInfoProps {
  name: string;
  category: string;
  enrollmentDate: string;
  completionPercentage: number;
}

const CourseInfo: FC<CourseInfoProps> = ({
  name,
  category,
  enrollmentDate,
  completionPercentage,
}) => (
  <div>
    <p className="font-semibold exclude-weglot ">{name}</p>
    <p className='exclude-weglot'>Category: {category}</p>
    <p>Enrollment Date: {enrollmentDate}</p>
    <div className="mt-2">
      <p>Completion: {completionPercentage}%</p>
      <Progress
        value={completionPercentage}
        className="w-full"
      />
    </div>
  </div>
);

const CourseDetailsSkeleton: FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-1/3" />
    </CardHeader>
    <CardContent className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
      <Skeleton className="h-[150px] w-[250px] rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full mt-4" />
      </div>
    </CardContent>
  </Card>
);

export default CourseDetails;