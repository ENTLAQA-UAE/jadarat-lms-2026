"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Course from "@/components/app/home/learnerDashboard/Course";
import Sliders from "@/components/app/home/learnerDashboard/Sliders";
import DropdownFilter from "@/components/DropdownFilter";
import Link from "next/link";
import { Category, SliderType } from "./types";
import { useRouter } from "next/navigation";
import { RecommendedCourses } from "@/components/ai/RecommendedCourses";

export default function LearnerDashboard({
  categories,
  courses,
  sliders,
  organizationCourses,
}: {
  categories: Category[];
  courses: any[];
  sliders: SliderType[];
  organizationCourses: any[];
}) {

  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const inProgressCourses = courses.filter((course) => course.percentage !== 100);
  const completedCourses = courses.filter((course) => course.percentage === 100);


  const filteredOrgCourses = organizationCourses
    .filter((orgCourse) => !courses.some((course) => course.course_id === orgCourse.course_id))
    .filter((orgCourse) => !selectedCategory || orgCourse.category_id === selectedCategory);

  return (
    <div className="p-6">
      {/* Search Bar (Visible on Mobile) */}
      <div className="md:hidden">
        <Input
          type="search"
          placeholder="Search courses..."
          className="w-full rounded-lg bg-background shadow-sm mb-8"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(`/dashboard/search?keyword=${search}`)
            }
          }}
        />
      </div>

      {/* Sliders Section */}
      {sliders.length > 0 && <Sliders sliders={sliders} />}

      {/* Continue Courses Section */}
      {inProgressCourses.length > 0 ? (
        <Section title="Continue Courses" link="/dashboard/learn">
          <CourseGrid>
            {inProgressCourses.slice(0, 3).map((course) => (
              <Course key={course.course_id} course={course} />
            ))}
          </CourseGrid>
        </Section>
      ) : <p>No courses available</p>}

      {/* AI Recommended Courses */}
      <div className="mb-8">
        <RecommendedCourses
          maxVisible={3}
          onCourseClick={(courseId) => router.push(`/dashboard/discover?course=${courseId}`)}
        />
      </div>

      {/* Discover Courses Section */}
      <Section
        title="Discover Courses"
        link="/dashboard/discover"
        extraContent={
          <DropdownFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        }
      >
        <CourseGrid>
          {filteredOrgCourses.length === 0 ? (
            <p>No courses available</p>
          ) : (
            filteredOrgCourses.map((course) => (
              <Course key={course.course_id} course={course} />
            ))
          )}
        </CourseGrid>
      </Section>

      {/* Completed Courses Section */}
      {completedCourses.length > 0 ? (
        <Section title="Completed Courses"
          link="/dashboard/learn"
        >
          <CourseGrid>
            {completedCourses.map((course) => (
              <Course key={`completed-${course.course_id}`} course={course} completed />
            ))}
          </CourseGrid>
        </Section>
      ) : <>
        <Section title="Completed Courses"
          link="/dashboard/learn"
        >
          <p>No courses available</p>
        </Section>
      </>}
    </div>
  );
}

/* Helper Components */

// Section Component to avoid repetitive structure
const Section = ({
  title,
  link,
  children,
  extraContent,
}: {
  title: string;
  link?: string;
  children: React.ReactNode;
  extraContent?: React.ReactNode;
}) => (
  <div className="mb-8">
    <h2 className="mb-4 text-2xl font-bold flex flex-col items-start justify-between md:flex-row">
      {title}
      <div className="flex items-center gap-2 mt-4 md:mt-0">
        {extraContent}
        {link && (
          <Button
            variant="outline"
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link href={link}>View All</Link>
          </Button>
        )}
      </div>
    </h2>
    {children}
  </div>
);

// Grid Layout for Courses
const CourseGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
);
