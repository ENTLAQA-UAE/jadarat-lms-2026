import { fetchUserData } from "@/action/authAction";
import CoursesDataTablePage from "./@table/page"
import { CSVButton } from "./CSVButton";
import DataPageLayout from "@/components/shared/DataPageLayout";

export const dynamic = 'force-dynamic'
async function CoursePage({ searchParams }: { searchParams: { page?: string, course?: string, department?: string } }) {
  const userData = await fetchUserData();
  const user_role = userData?.user_role ?? '';
  return (
    <DataPageLayout title="Courses" actions={<CSVButton />}>
      <CoursesDataTablePage searchParams={searchParams} userRole={user_role} />
    </DataPageLayout>
  )
}

export default CoursePage