export const dynamic = 'force-dynamic'
import { fetchUserData } from "@/action/authAction";
import { redirect } from "next/navigation";
import CategoryDataTablePage from "./@table/page";
import DataPageLayout from "@/components/shared/DataPageLayout";

interface SearchParams {
  page?: string;
  category?: string;
  name?: string;
}

async function page({searchParams}: {searchParams: SearchParams}) {
  const userData = await fetchUserData();
  const user_role = userData?.user_role ?? '';
  if (user_role !== 'LMSAdmin') {
    return redirect('/dashboard/courses')
  }

  return (
    <DataPageLayout title="Categories">
      <CategoryDataTablePage
        searchParams={searchParams}
      />
    </DataPageLayout>
  )
}

export default page