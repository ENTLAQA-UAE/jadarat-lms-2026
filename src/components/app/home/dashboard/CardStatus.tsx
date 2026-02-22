"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/language.context';
import { createClient } from '@/utils/supabase/client';
import { Activity, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const CARD_CONFIGS = [
  {
    key: 'users',
    title: 'Users',
    icon: Users,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10 group-hover:bg-primary/15',
    borderAccent: 'from-primary/60 to-primary/20',
  },
  {
    key: 'enrollments',
    title: 'Enrollments',
    icon: UserPlus,
    iconColor: 'text-info',
    iconBg: 'bg-info/10 group-hover:bg-info/15',
    borderAccent: 'from-info/60 to-info/20',
  },
  {
    key: 'completions',
    title: 'Completions',
    icon: ShieldCheck,
    iconColor: 'text-success',
    iconBg: 'bg-success/10 group-hover:bg-success/15',
    borderAccent: 'from-success/60 to-success/20',
  },
  {
    key: 'active',
    title: 'Active',
    icon: Activity,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10 group-hover:bg-warning/15',
    borderAccent: 'from-warning/60 to-warning/20',
  },
] as const;

function CardStatus() {
  const { numbers } = useLanguage();
  const [data, setData] = useState({
    users: 0, usersByMonth: 0,
    enrollments: 0, enrollmentsByMonth: 0,
    completed: 0, completedByMonth: 0,
    active: 0, activeByMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchAll = async () => {
      const [
        { data: users },
        { data: enrollments },
        { data: completed },
        { data: active },
        { data: usersByMonth },
        { data: enrollmentsByMonth },
        { data: completedByMonth },
        { data: activeByMonth },
      ] = await Promise.all([
        supabase.rpc('get_organization_users_count'),
        supabase.rpc('get_orgnaization_enrollements_count'),
        supabase.rpc('get_orgnaization_completed_courses_count'),
        supabase.rpc('get_organization_active_count'),
        supabase.rpc('get_organization_users_count_for_last_month'),
        supabase.rpc('get_orgnaization_enrollements_count_for_last_month'),
        supabase.rpc('get_orgnaization_completed_courses_count_for_last_month'),
        supabase.rpc('get_organization_active_count_for_last_month'),
      ]);

      setData({
        users: users ?? 0, usersByMonth: usersByMonth ?? 0,
        enrollments: enrollments ?? 0, enrollmentsByMonth: enrollmentsByMonth ?? 0,
        completed: completed ?? 0, completedByMonth: completedByMonth ?? 0,
        active: active ?? 0, activeByMonth: activeByMonth ?? 0,
      });
      setLoading(false);
    };

    fetchAll();
  }, []);

  const values = [
    { value: data.users, change: data.usersByMonth },
    { value: data.enrollments, change: data.enrollmentsByMonth },
    { value: data.completed, change: data.completedByMonth },
    { value: data.active, change: data.activeByMonth },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
      {CARD_CONFIGS.map((config, i) => {
        const Icon = config.icon;
        const { value, change } = values[i];

        if (loading) {
          return (
            <Card key={config.key} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton shimmer className="h-4 w-20" />
                <Skeleton shimmer className="h-9 w-9 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton shimmer className="h-8 w-16 mb-2" />
                <Skeleton shimmer className="h-4 w-28" />
              </CardContent>
            </Card>
          );
        }

        return (
          <Card
            key={config.key}
            className="group relative overflow-hidden card-hover"
          >
            {/* Top gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.borderAccent}`} />

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {config.title}
              </CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300 ${config.iconBg}`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold tracking-tight">
                {(value ?? 0).toLocaleString(numbers)}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success font-medium">
                  +{change.toLocaleString(numbers)}
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default CardStatus;
