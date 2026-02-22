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
import { Search, ArrowRight, BookOpen, GraduationCap, Compass } from "lucide-react";
import { useLanguage } from "@/context/language.context";

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
  const { isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const inProgressCourses = courses.filter((course) => course.percentage !== 100);
  const completedCourses = courses.filter((course) => course.percentage === 100);

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
    <div className="p-4 md:p-6 space-y-6">
      {/* Mobile Search */}
      <div className="md:hidden">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isRTL ? "ابحث عن الدورات..." : "Search courses..."}
            className="w-full rounded-xl bg-card shadow-sm ps-10 h-11 border-border/50"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                router.push(`/dashboard/search?keyword=${search}`)
              }
            }}
          />
        </div>
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
      {inProgressCourses.length > 0 && (
        <Section
          title={isRTL ? "أكمل دوراتك" : "Continue Learning"}
          link="/dashboard/learn"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          isRTL={isRTL}
        >
          <CourseGrid>
            {inProgressCourses.slice(0, 3).map((course) => (
              <Course key={course.course_id} course={course} />
            ))}
          </CourseGrid>
        </Section>
      )}

      {/* AI Recommended Courses */}
      <RecommendedCourses
        maxVisible={3}
        onCourseClick={(courseId) => router.push(`/dashboard/discover?course=${courseId}`)}
      />

      {/* Achievements & Leaderboard Widgets */}
      <DashboardWidgets />

      {/* Discover Courses Section */}
      <Section
        title={isRTL ? "اكتشف الدورات" : "Discover Courses"}
        link="/dashboard/discover"
        icon={<Compass className="h-5 w-5 text-primary" />}
        isRTL={isRTL}
        extraContent={
          <DropdownFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        }
      >
        {filteredOrgCourses.length === 0 ? (
          <EmptyState
            message={isRTL ? "لا توجد دورات متاحة حالياً" : "No courses available yet"}
            subMessage={isRTL ? "تحقق لاحقاً لاكتشاف دورات جديدة" : "Check back later for new courses"}
          />
        ) : (
          <CourseGrid>
            {filteredOrgCourses.map((course) => (
              <Course key={course.course_id} course={course} />
            ))}
          </CourseGrid>
        )}
      </Section>

      {/* Completed Courses Section */}
      <Section
        title={isRTL ? "الدورات المكتملة" : "Completed Courses"}
        link="/dashboard/learn"
        icon={<GraduationCap className="h-5 w-5 text-success" />}
        isRTL={isRTL}
      >
        {completedCourses.length === 0 ? (
          <EmptyState
            message={isRTL ? "لم تكمل أي دورة بعد" : "No completed courses yet"}
            subMessage={isRTL ? "استمر في التعلم لإكمال دورتك الأولى!" : "Keep learning to complete your first course!"}
          />
        ) : (
          <CourseGrid>
            {completedCourses.map((course) => (
              <Course key={`completed-${course.course_id}`} course={course} completed />
            ))}
          </CourseGrid>
        )}
      </Section>
    </div>
  );
}

/* ── Helper Components ── */

const Section = ({
  title,
  link,
  icon,
  isRTL,
  children,
  extraContent,
}: {
  title: string;
  link?: string;
  icon?: React.ReactNode;
  isRTL?: boolean;
  children: React.ReactNode;
  extraContent?: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {extraContent}
        {link && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={link}>
              {isRTL ? "عرض الكل" : "View All"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
    {children}
  </section>
);

const CourseGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
);

const EmptyState = ({ message, subMessage }: { message: string; subMessage: string }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 py-12 px-6 text-center">
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
    <p className="mt-1 text-xs text-muted-foreground/70">{subMessage}</p>
  </div>
);
