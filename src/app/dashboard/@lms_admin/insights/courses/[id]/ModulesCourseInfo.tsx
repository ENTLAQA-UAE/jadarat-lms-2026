"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Interface for Course Screen Data
interface Screen {
  id: number;
  title: string;
  description?: string;
}

// Interface for Coassemble Course
interface Course {
  id: number;
  title: string;
  screens: Screen[];
}

export default function ModulesCourseInfo({ id }: { id: string }) {
  const [coassembleCourse, setCoassembleCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // To track loading state

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(
          `https://api.coassemble.com/api/v1/headless/courses?clientIdentifier=49`,
          {
            headers: {
              Authorization: process.env.NEXT_PUBLIC_COASSEMBLE,
            },
          }
        );
        const selectedCourse = data.find(
          (course: Course) => course.id === parseInt(id)
        );
        setCoassembleCourse(selectedCourse);
        // console.log("selectedCourse id=>", selectedCourse);
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false); // Stop loading after the request is completed
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Course Modules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid px-8">
          <ScrollArea className="h-[25rem]">
            {loading ? (
              // Skeleton loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-[30%] h-[16px]" />
                  <Skeleton className="w-[80%] h-[12px]" />
                </div>
              ))
            ) : coassembleCourse ? (
              // Course details content


              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <ul className="list-inside grid gap-4 ">
                    {coassembleCourse.screens.map((screen: Screen) => (

                      <li key={screen.id} className="font-medium  list-disc exclude-weglot">
                        {screen.title}
                      </li>
                    ))}


                  </ul>
                </div>
              </div>

            ) : (
              // No course found message
              <p>No Modules data found.</p>
            )}
          </ScrollArea>

        </div>
      </CardContent>
    </Card>
  );
}
