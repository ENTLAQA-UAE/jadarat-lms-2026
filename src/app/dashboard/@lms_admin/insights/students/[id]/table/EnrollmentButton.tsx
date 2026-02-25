"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { coursesTitlesAndIds } from "@/action/lms-admin/insights/courses/coursesAction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { enrolToCourse } from "@/action/students/studentsActions";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Fetcher function for SWR
const fetcher = (action: () => Promise<any>) => action();

export default function EnrollmentButton() {
  const { id: userId } = useParams<{ id: string }>();
  const {
    data: courses,
    error,
    isLoading,
  } = useSWR("coursesTitlesAndIds", () => fetcher(coursesTitlesAndIds), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(
    undefined
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleEnroll = async () => {
    if (!selectedCourse || !userId) return;

    setIsSending(true);

    try {
      const { errorMessage } = await enrolToCourse(selectedCourse, userId);
      if (errorMessage) {
        if (errorMessage.includes("already")) {
          toast("User already enrolled");
        } else {
          toast.error("Error", {
            description: errorMessage,
          });
        }
      } else {
        toast.success("Enrollment Successful", {
          description: `You have been enrolled in the course successfully.`,
        });
        setIsDialogOpen(false); // Close the dialog
      }
    } catch (err: any) {
      toast.error("Enrollment Failed", {
        description: `An error occurred: ${err.message}`,
      });
    } finally {
      setIsSending(false);
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-3 w-3 me-2" />
          Enroll Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Course</DialogTitle>
          <DialogDescription>
            Choose the course you would like to enroll in.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Select onValueChange={(value) => setSelectedCourse(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent
              className="max-h-[300px] overflow-auto"
              onWheel={handleWheel}
            >
              <SelectGroup>
                {isLoading ? (
                  <SelectLabel>Loading...</SelectLabel>
                ) : error ? (
                  <SelectLabel>Error loading courses</SelectLabel>
                ) : (
                  courses?.data?.map((course: any) => (
                    <SelectItem
                      className="exclude-weglot"
                      key={course.course_id}
                      value={course.course_id.toString()}
                    >
                      {course.title}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            onClick={handleEnroll}
            disabled={!selectedCourse || isSending}
          >
            {isSending ? "Enrolling..." : "Enroll"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
