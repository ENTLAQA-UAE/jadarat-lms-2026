"use client";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Course from "@/components/app/home/learnerDashboard/Course";
import Sliders from "@/components/app/home/learnerDashboard/Sliders";
import ContinueLearningHero from "@/components/app/home/learnerDashboard/ContinueLearningHero";
import StatsRow from "@/components/app/home/learnerDashboard/StatsRow";
import DashboardWidgets from "@/components/app/home/learnerDashboard/DashboardWidgets";
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

  // Pick the course closest to completion for the hero
  const heroCourse = useMemo(() => {
    if (inProgressCourses.length === 0) return null;
    return [...inProgressCourses].sort(
      (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)
    )[0];
  }, [inProgressCourses]);

  const filteredOrgCourses = organizationCourses
    .filter((orgCourse) => !courses.some((course) => course.course_id === orgCourse.course_id))
    .filter((orgCourse) => !selectedCategory || orgCourse.category_id === selectedCategory);

  return (
    <div className="p-4 md:p-6 space-y-0">
      {/* Search Bar (Visible on Mobile) */}
      <div className="md:hidden">
        <Input
          type="search"
          placeholder="Search courses..."
          className="w-full rounded-xl bg-background shadow-sm mb-8 h-11"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(`/dashboard/search?keyword=${search}`)
            }
          }}
        />
      </div>

      {/* Continue Learning Hero */}
      {heroCourse && <ContinueLearningHero course={heroCourse} />}

      {/* Stats Row */}
      <StatsRow
        completedCount={completedCourses.length}
        inProgressCount={inProgressCourses.length}
      />

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

      {/* Achievements & Leaderboard Widgets */}
      <DashboardWidgets />

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
    <div className="mb-5 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {extraContent}
        {link && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            asChild
          >
            <Link href={link}>View All</Link>
          </Button>
        )}
      </div>
    </div>
    {children}
  </div>
);

// Grid Layout for Courses
const CourseGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
);
