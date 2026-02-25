// EnrolButton.tsx
'use client';

import { EnrolToCourse } from '@/action/leaner/enrolToCourse';
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { Rocket } from 'lucide-react';
import { useState } from 'react';

interface EnrolButtonProps {
 courseInfo: {
  course_id: number;
  course_slug_param: string;
 }
}

const EnrolButton: React.FC<EnrolButtonProps> = ({ courseInfo }) => {
 const [isLoading, setIsLoading] = useState<boolean>(false);

 const onEnrol = async () => {
  setIsLoading(true);

  const enrolPromise = new Promise(async (resolve, reject) => {
   const { error } = await EnrolToCourse(courseInfo?.course_id, courseInfo?.course_slug_param);
   if (error) {
    reject(error);
   } else {
    resolve({ name: 'Sonner' });
   }
  });

  toast.promise(enrolPromise, {
   loading: 'Enrolling...',
   success: () => `You have been enrolled to the course`,
   error: 'Error enrolling to the course',
  });

  setIsLoading(false);
 };

 return (
  <Button size="lg" onClick={onEnrol} disabled={isLoading}>
   <Rocket className="mr-2 h-4 w-4" />
   {isLoading ? 'Enrolling...' : 'Enrol Now'}
  </Button>
 );
};

export default EnrolButton;