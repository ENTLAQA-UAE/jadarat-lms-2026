import { fetchUserData } from "@/action/authAction";
import CoursesDataTablePage from "./@table/page"
import { CSVButton } from "./CSVButton";

export const dynamic = 'force-dynamic'
async function CoursePage({ searchParams }: { searchParams: { page?: string, course?: string, department?: string } }) {
  const userData = await fetchUserData();
  const user_role = userData?.user_role ?? '';
  return (
    <div className="flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Courses</h1>
        <CSVButton />
      </div>
      <CoursesDataTablePage searchParams={searchParams} userRole={user_role} />
    </div>
  )
}

export default CoursePage