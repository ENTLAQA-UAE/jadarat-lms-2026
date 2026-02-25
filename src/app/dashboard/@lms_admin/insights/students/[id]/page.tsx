"use client";
// Student Profile
import LearnerDetails from "./LearnerDetails";
import LearnerActionButtons from "./LearnerActionButtons";
import LearnerInsights from "./LearnerInsights";
import ProfileDataTable from "./table/profileTable";
import { createClient } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProfileDataTableSkeleton from "./ProfileDataTableSkeleton";
import BackButton from "@/components/BackButton";
interface LearnerData {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  group: string;
  lastLogin: string;
  avatarUrl?: string;
}
// Initialize Supabase client outside of the component
const supabase = createClient();

// Define the type for the fetched data
interface LearnerInsightsType {
  allCourses: number;
  completedCourses: number;
  activeCourses: number;
}

// Function to fetch user courses count
const fetchUserCoursesCount = async (
  userId: string
): Promise<LearnerInsightsType> => {
  try {
    // Fetch total courses count
    const { count: allCourses, error: allCoursesError } = await supabase
      .from("user_courses")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (allCoursesError) throw allCoursesError;

    // Fetch completed courses count
    const { count: completedCourses, error: completedCoursesError } =
      await supabase
        .from("user_courses")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("progress", "100");

    if (completedCoursesError) throw completedCoursesError;

    const activeCourses = (allCourses || 0) - (completedCourses || 0); // Calculate active courses

    return {
      allCourses: allCourses || 0,
      completedCourses: completedCourses || 0,
      activeCourses,
    };
  } catch (err) {
    console.error("Failed to fetch user courses count:", err);
    return {
      allCourses: 0,
      completedCourses: 0,
      activeCourses: 0,
    };
  }
};
export default function LearnerProfilePage(props: { params: any }) {
  const params = useParams<{ id: string }>();
  const [coursesData, setCoursesData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [learner, setLearner] = useState<LearnerData | null>(null);
  useEffect(() => {
    const fetchLearnerDetails = async () => {
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", props.params.id)
          .single();

        const { data: learnerGroup } = await supabase
          .from("groups")
          .select("name")
          .eq("id", data.group_id)
          .single();

        if (error) throw error;

        setLearner({
          id: data.id,
          name: data.name,
          email: data.email,
          jobTitle: data.job_title,
          department: data.department,
          group: learnerGroup?.name || "",
          lastLogin: new Date(data.last_login).toLocaleDateString(),
          avatarUrl: data.avatar_url,
        });
      } catch (err) {
        console.error("Failed to fetch learner details:", err);
      }
    };

    fetchLearnerDetails();
  }, [props.params.id]);
  useEffect(() => {
    const fetchUserCourses = async (userId: string) => {
      const supabase = createClient();
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_courses")
          .select("course_id, progress, created_at, courses (title, thumbnail)")
          .eq("user_id", userId);

        if (error) {
          setIsLoading(false);
          throw error;
        }

        const newData = data.map((entry: any) => {
          const course = entry.courses;

          return {
            id: entry.course_id,
            name: course?.title ?? "",
            image: course?.thumbnail ?? "",
            enrollmentDate: entry.created_at,
            progress: entry.progress,
            learnerName: learner?.name,
            learnerId: userId,
          };
        });
        setCoursesData(newData);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch user courses:", err);
        setIsLoading(false);
        return [];
      }
    };
    fetchUserCourses(params.id);
  }, [params.id, learner]);
  //   Get learner Insights
  const [learnerInsights, setLearnerInsights] =
    useState<LearnerInsightsType | null>(null); // Correctly type the state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { allCourses, completedCourses, activeCourses } =
          await fetchUserCoursesCount(props.params.id);
        setLearnerInsights({ allCourses, completedCourses, activeCourses }); // Set data correctly
      } catch (err) {
        // silently handled
      }
    };

    fetchData();
  }, [props.params.id]);
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8">
      <div className="flex justify-between space-x-4">
        <BackButton />
        <LearnerActionButtons
          learner={learner}
          coursesData={coursesData}
          learnerInsights={learnerInsights}
        />
      </div>
      <div>
        <div className="grid md:grid-cols-3 gap-6">
          <LearnerDetails learner={learner} />
          <LearnerInsights learnerInsights={learnerInsights} />
        </div>
        {isLoading ? (
          <ProfileDataTableSkeleton />
        ) : (
          <ProfileDataTable courses={coursesData ?? []} />
        )}
      </div>
    </div>
  );
}