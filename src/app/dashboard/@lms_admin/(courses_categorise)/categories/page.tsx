export const dynamic = 'force-dynamic'
import { fetchUserData } from "@/action/authAction";
import { redirect } from "next/navigation";
import CategoryDataTablePage from "./@table/page";

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
    <div className="p-6">
      <CategoryDataTablePage
        searchParams={searchParams}
      />
    </div>
  )
}

export default page