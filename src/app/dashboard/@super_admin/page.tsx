import SuperAdminDashboard from './SuperAdminDashboard';

// TODO: Replace mock data with real data from getSummaryData()
// import { getSummaryData } from '@/action/super-admin/superAdminActions';

const mockDashboardData = {
  total_organizations: 24,
  total_organizations_last_month: 3,
  total_users: 1_250,
  total_users_last_month: 87,
  total_courses: 156,
  total_courses_last_month: 12,
  total_certificates: 3_420,
  total_certificates_last_month: 245,
  monthly_stats: [
    { month: 'Jan', arabic_month: 'يناير', organizations: 2, users: 45, courses: 8, certificates: 120 },
    { month: 'Feb', arabic_month: 'فبراير', organizations: 1, users: 62, courses: 5, certificates: 180 },
    { month: 'Mar', arabic_month: 'مارس', organizations: 3, users: 78, courses: 12, certificates: 250 },
    { month: 'Apr', arabic_month: 'أبريل', organizations: 2, users: 95, courses: 10, certificates: 310 },
    { month: 'May', arabic_month: 'مايو', organizations: 4, users: 110, courses: 15, certificates: 380 },
    { month: 'Jun', arabic_month: 'يونيو', organizations: 1, users: 88, courses: 9, certificates: 290 },
    { month: 'Jul', arabic_month: 'يوليو', organizations: 3, users: 105, courses: 14, certificates: 350 },
    { month: 'Aug', arabic_month: 'أغسطس', organizations: 2, users: 120, courses: 18, certificates: 420 },
    { month: 'Sep', arabic_month: 'سبتمبر', organizations: 1, users: 135, courses: 11, certificates: 280 },
    { month: 'Oct', arabic_month: 'أكتوبر', organizations: 2, users: 142, courses: 20, certificates: 460 },
    { month: 'Nov', arabic_month: 'نوفمبر', organizations: 3, users: 158, courses: 17, certificates: 390 },
    { month: 'Dec', arabic_month: 'ديسمبر', organizations: 0, users: 212, courses: 17, certificates: 490 },
  ],
};

export default async function SuperAdminDashboardPage() {
  return (
    <SuperAdminDashboard
      loading={false}
      dashboardData={mockDashboardData}
      errorMessage=""
    />
  );
}
