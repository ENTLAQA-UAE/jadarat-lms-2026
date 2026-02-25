import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Book,
  CircleCheck,
  Clock,
  FileWarning,
  Rocket,
  RotateCcw,
  StepForward,
  User,
  Video,
} from 'lucide-react';
import Image from 'next/image';
import { capitalize } from 'lodash';
import Link from 'next/link';
import TwoColumnLearningOutcomesCard from '@/components/shared/TwoColumnLearningOutcomesCard';
import CertificateButton from '@/components/shared/CertificateButton';
import EnrolButton from './EnrolButton';
import { formatDuration } from '@/utils/formatDuration';
import ExpireDate from './ExpireDate';


async function CourseInfo({ courseInfo, organizationDetails, userData }: { courseInfo: any, organizationDetails: any, userData: { user_id: string, name: string } }) {

  const enrolledAt = new Date(courseInfo?.user_course_created_at);

  // Check if course expiration is enabled
  const isExpirationEnabled = organizationDetails?.course_expiration_period > 0;

  // Only calculate expiration if it's enabled
  const expirationDate = isExpirationEnabled
    ? new Date(enrolledAt.getTime() + (organizationDetails?.course_expiration_period || 0) * 24 * 60 * 60 * 1000)
    : null;

  // Course is expired only if expiration is enabled and current date is past expiration
  const isCourseExpired = isExpirationEnabled && expirationDate ? Date.now() > expirationDate.getTime() : false;


  return (
    <div className="grid p-6 gap-8 lg:grid-cols-[400px_1fr] lg:gap-12 items-start">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="overflow-hidden rounded-lg">
              <Image
                src={courseInfo?.course_thumbnail ?? '/placeholder.svg'}
                alt={courseInfo?.course_title ?? "Course Image"}
                width={800}
                height={400}
                className="object-cover w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Duration: {formatDuration(courseInfo?.course_timeline)} Minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Course Modules: {courseInfo?.course_outcomes?.length ?? '-'}
              </span>
            </div>
            {/* <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Course Languages: English

                </span>
                <span className="mb-1">
                  {" "}
                  <Image
                    alt="flag"
                    src="/flags/enFlag.svg"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                </span>
              </div> */}
            {courseInfo && courseInfo.user_progress && (
              <div className="flex items-center gap-2">
                <StepForward className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground min-w-fit">
                  Progress: {+courseInfo.user_progress || 0}%
                </span>
                <Progress
                  value={+courseInfo.user_progress || 0}
                  className="w-full h-2 mb-1"
                />
              </div>
            )}

            {courseInfo && !courseInfo.user_course_created_at && (
              organizationDetails?.course_self_entrollment_policy === 'direct' ? (
                <EnrolButton courseInfo={courseInfo} />
              ) : (
                <Alert className="mt-2">
                  <CircleCheck className="w-5 h-5 text-warning mr-2" />
                  <AlertDescription>
                    Only the LMS manager can enroll you into courses.
                  </AlertDescription>
                </Alert>
              )
            )}
            {/*push  */}
            {courseInfo && isCourseExpired && courseInfo.user_course_created_at ? (
              <Button size="lg" className="w-full opacity-50" disabled>
                <FileWarning className="me-2 h-4 w-4" />
                Course Expired
              </Button>
            ) : (
              +courseInfo.user_progress < 100 && courseInfo.user_course_created_at && (
                  <Link href={courseInfo.course_is_scorm ? `scorm-player/${courseInfo.course_slug_param}` : `play/${courseInfo.course_slug_param}`}>
                  <Button size="lg" className="w-full">
                    <Rocket className="me-2 h-4 w-4" />
                    Continue Course
                  </Button>
                </Link>
              )
            )}
            {courseInfo && courseInfo.user_progress === "100" && (
              <>
                <CertificateButton
                  className={
                    'bg-card text-foreground border border-info !text-sm'
                  }
                  selectedCourse={{
                    id: courseInfo.course_id,
                    learnerId: userData.user_id,
                    courseName: courseInfo.title,
                    learnerName: userData.name,
                  }}
                  variant="download"
                  disabled={courseInfo.user_progress !== "100"}
                />

                <CertificateButton
                  className={
                    'bg-card text-foreground border border-info !text-sm'
                  }
                  selectedCourse={{
                    id: courseInfo.course_id,
                    learnerId: userData.user_id,
                    courseName: courseInfo.title,
                    learnerName: userData.name,
                  }}
                  variant="share"
                  disabled={courseInfo.user_progress !== "100"}
                />

                {courseInfo && courseInfo.user_progress === "100" && !isCourseExpired && (
                  <Button>
                    <Link
                      className="flex items-center gap-2"
                      href={courseInfo.course_is_scorm ? `scorm-player/${courseInfo.course_slug_param}` : `play/${courseInfo.course_slug_param}`}
                    >
                      <RotateCcw className=" h-4 w-4" />
                      Back to Course
                    </Link>
                  </Button>
                )}
              </>
            )}
            {courseInfo && courseInfo.user_course_created_at && (
              <Alert className="mt-2">
                <CircleCheck className="w-5 h-5 text-success mr-2" />
                <AlertDescription>
                  You&apos;re Already Enrolled since{' '}
                  {new Date(courseInfo?.user_course_created_at || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </AlertDescription>
              </Alert>
            )}
            {courseInfo && courseInfo.user_course_created_at && isExpirationEnabled && expirationDate && (
              <ExpireDate isCourseExpired={isCourseExpired} expirationDate={expirationDate} />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-4 text-center md:text-start ">
          <div className="flex   flex-col md:flex-row items-center gap-2">
            <Book className="w-6 h-6  text-primary" />
            <h1 className="text-xl  font-semibold tracking-tight mt-2 exclude-weglot">
              {courseInfo?.course_title}
            </h1>
          </div>
          <p className="text-muted-foreground md:text-lg exclude-weglot">
            {courseInfo?.course_description}
          </p>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {capitalize(courseInfo?.course_level)} Level
            </span>
          </div>
        </div>
        <div className="grid gap-4">
          <TwoColumnLearningOutcomesCard
            outcomes={courseInfo?.course_outcomes ?? []}
          />
        </div>
      </div>
    </div>
  )
}

export default CourseInfo