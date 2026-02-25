// DeleteButton.tsx
'use client'

import { useState } from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { deleteCourse } from '@/action/lms-admin/insights/courses/course/courseAction';

interface DeleteButtonProps {
 courseId: number;
}

export function DeleteButton({ courseId }: DeleteButtonProps) {
 const [isDialogOpen, setIsDialogOpen] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const { toast } = useToast();

 const handleDelete = async () => {
  setIsLoading(true);
  const { error } = await deleteCourse(courseId);
  if (error) {
   toast({
    title: 'Error',
    description: 'Failed to delete course : ' + error.message,
    variant: 'destructive',
   });
   setIsDialogOpen(false);
   setIsLoading(false);
  } else {
   toast({
    title: 'Success',
    description: 'Course deleted successfully',
   });
   setIsLoading(false);
   setIsDialogOpen(false);
  }
 };

 return (
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
   <DialogTrigger asChild>
    <Button size='icon' variant='outline' aria-label="Delete course">
     <Trash className='w-5 h-5' />
    </Button>
   </DialogTrigger>
   <DialogContent>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogDescription>
     Are you sure you want to delete this course? All users who took this course will lose progress.
    </DialogDescription>
    <DialogFooter>
     <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
     <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
      {isLoading ? 'Deleting...' : 'Delete'}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}
