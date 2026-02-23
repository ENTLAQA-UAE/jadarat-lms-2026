import SuperAdminDashboard from './SuperAdminDashboard';
import { getSummaryData } from '@/action/super-admin/superAdminActions';

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
