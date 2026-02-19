"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language.context';
import { createClient } from '@/utils/supabase/client';
import { Activity, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

function CardStatus() {
  const { numbers } = useLanguage();
  const [users, setUsers] = useState<number>(0);
  const [usersByMonth, setUsersByMonth] = useState<number>(0);
  const [enrollments, setEnrollments] = useState<number>(0);
  const [enrollmentsByMonth, setEnrollmentsByMonth] = useState<number>(0);
  const [completed, setCompleted] = useState<number>(0);
  const [completedByMonth, setCompletedByMonth] = useState<number>(0);
  const [active, setActive] = useState<number>(0);
  const [activeByMonth, setActiveByMonth] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();
    const getUsers = async () => {
      let { data, error } = await supabase.rpc('get_organization_users_count');
      if (!error) setUsers(data);
    };
    const getEnrollements = async () => {
      let { data, error } = await supabase.rpc(
        'get_orgnaization_enrollements_count'
      );
      if (!error) setEnrollments(data);
    };
    const getCompleted = async () => {
      let { data, error } = await supabase.rpc(
        'get_orgnaization_completed_courses_count'
      );
      if (!error) setCompleted(data);
    };
    const getActive = async () => {
      let { data, error } = await supabase.rpc('get_organization_active_count');
      if (!error) setActive(data);
    };
    const getUsersByMonth = async () => {
      let { data, error } = await supabase.rpc(
        'get_organization_users_count_for_last_month'
      );
      if (!error) setUsersByMonth(data);
    };
    const getEnrollmentsByMonth = async () => {
      let { data, error } = await supabase.rpc(
        'get_orgnaization_enrollements_count_for_last_month'
      );
      if (!error) setEnrollmentsByMonth(data);
    };
    const getCompletedByMonth = async () => {
      let { data, error } = await supabase.rpc(
        'get_orgnaization_completed_courses_count_for_last_month'
      );
      if (!error) setCompletedByMonth(data);
    };
    const getActiveByMonth = async () => {
      let { data, error } = await supabase.rpc(
        'get_organization_active_count_for_last_month'
      );
      if (!error) setActiveByMonth(data);
    };

    getUsers();
    getEnrollements();
    getCompleted();
    getActive();
    getUsersByMonth();
    getEnrollmentsByMonth();
    getCompletedByMonth();
    getActiveByMonth();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card x-chunk="dashboard-01-chunk-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(users ?? 0).toLocaleString(numbers)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{usersByMonth.toLocaleString(numbers)} from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(enrollments ?? 0).toLocaleString(numbers)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{enrollmentsByMonth.toLocaleString(numbers)} from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completions</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(completed ?? 0).toLocaleString(numbers)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{completedByMonth.toLocaleString(numbers)} from last month
          </p>
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-01-chunk-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(active ?? 0).toLocaleString(numbers)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{activeByMonth.toLocaleString(numbers)} from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default CardStatus;
