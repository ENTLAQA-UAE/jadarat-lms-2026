import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  User,
} from 'lucide-react';
import CertificateButton from '@/components/shared/CertificateButton';
interface MobileCourseDrawerTypes {
  back: () => void;
  percentage: number | undefined;
  overallProgress: number;
  generatingCertificate: boolean;
  sharingCertificate: boolean;
  selectedCourse: any;
  id?: string;
  name?: string;
}

export default function MobileCourseDrawer({
  back,
  percentage,
  overallProgress,
  generatingCertificate,
  sharingCertificate,
  selectedCourse,
  id,
  name,
}: MobileCourseDrawerTypes) {

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className='w-11 h-11 cursor-pointer  text-gray-200 flex justify-center items-center rounded-full bg-purple-600'
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side={'left'} className="bg-muted px-3">
        <aside className=" flex-col justify-start gap-8 bg-muted  md:flex">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-2 hover:bg-muted transition-colors"
              onClick={back}
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="sr-only">Back</span>
            </Button>
          </div>
          <div className=''>
            <SheetTitle className="mb-4 text-lg justify-center font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className='mt-2'>Overall Progress</span>
            </SheetTitle>
            <div className="flex items-center gap-2 mb-6 rounded-lg bg-background p-2 shadow-sm">
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Overall Progress
                </div>
                <div className="font-semibold text-sm">{percentage}%</div>
                <Progress value={overallProgress} className="mt-2" />
              </div>
            </div>
            {overallProgress === 100 && (
              <div className="w-full space-y-4">
                <CertificateButton selectedCourse={{ id: selectedCourse?.id ?? 0, learnerId: id!, courseName: selectedCourse?.name ?? "", learnerName: name }} variant="download" disabled={generatingCertificate || sharingCertificate} />
                <CertificateButton selectedCourse={{ id: selectedCourse?.id ?? 0, learnerId: id!, courseName: selectedCourse?.name ?? "", learnerName: name }} variant="share" disabled={generatingCertificate || sharingCertificate} />
              </div>
            )}
          </div>
        </aside>
      </SheetContent>
    </Sheet>
  );
}