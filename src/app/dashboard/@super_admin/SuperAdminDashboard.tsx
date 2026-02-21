'use client';
import React from 'react';
import BarChar from './BarChar';
import StatsCard from './StatsCard';
import {
  BuildingIcon,
  UsersIcon,
  BookIcon,
  GraduationCapIcon,
} from 'lucide-react';

export default function SuperAdminDashboard({
  loading,
  dashboardData,
  errorMessage,
}: {
  loading: boolean;
  dashboardData: any;
  errorMessage: string;
}) {
  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div>Loading.....</div>
      </div>
    );
  }

  if (errorMessage || !dashboardData) {
    return (
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="text-red-500">{errorMessage || 'Failed to load dashboard data.'}</div>
      </div>
    );
  }

  // Prepare statsData
  const statsData = [
    {
      title: 'Total Organizations',
      icon: BuildingIcon,
      value: dashboardData.total_organizations.toLocaleString(),
      percent: `+${dashboardData.total_organizations_last_month.toLocaleString()}`,
      trend: 'up',
    },
    {
      title: 'Total Users',
      icon: UsersIcon,
      value: dashboardData.total_users.toLocaleString(),
      percent: `+${dashboardData.total_users_last_month.toLocaleString()}`,
      trend: 'up',
    },
    {
      title: 'Total Courses',
      icon: BookIcon,
      value: dashboardData.total_courses.toLocaleString(),
      percent: `+${dashboardData.total_courses_last_month.toLocaleString()}`,
      trend: 'up',
    },
    {
      title: 'Total Certificates',
      icon: GraduationCapIcon,
      value: dashboardData.total_certificates.toLocaleString(),
      percent: `+${dashboardData.total_certificates_last_month.toLocaleString()}`,
      trend: 'up',
    },
  ];

  // Prepare monthlyData
  const monthlyData = dashboardData.monthly_stats?.map((month: any) => ({
    name: month.month,
    arabic_month: month.arabic_month,
    organizations: month.organizations,
    users: month.users,
    courses: month.courses,
    certificates: month.certificates,
  })) ?? [];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BarChar
          title="Total Organizations per Month"
          monthlyData={monthlyData}
          type="organizations"
          color="#8884d8"
        />

        <BarChar
          title="Total Users per Month"
          monthlyData={monthlyData}
          type="users"
          color="#82ca9d"
        />

        <BarChar
          title="Total Courses per Month"
          monthlyData={monthlyData}
          type="courses"
          color="#ffc658"
        />

        <BarChar
          title="Total Certificates per Month"
          monthlyData={monthlyData}
          type="certificates"
          color="#ff7300"
        />
      </div>
    </div>
  );
}
