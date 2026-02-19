import { getSummaryData } from '@/action/super-admin/superAdminActions';
import SuperAdminDashboard from './SuperAdminDashboard';
// Mock data for demonstration

export default async function SuperAdminDashboardPage() {
  const { loading, dashboardData, errorMessage } = await getSummaryData();
  return (
    <SuperAdminDashboard
      loading={loading}
      dashboardData={dashboardData}
      errorMessage={errorMessage}
    />
  );
}
