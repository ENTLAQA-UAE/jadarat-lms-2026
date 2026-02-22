import { fetchUserData } from '@/action/authAction';
import InactiveEmail from '@/components/InactiveEmail';
import { Toaster } from '@/components/ui/sonner';
import { createClient } from '@/utils/supabase/server';

export default async function Layout({
  children,
  learner,
  lms_admin,
  org_admin,
  super_admin,
}: {
  children: React.ReactNode;
  learner: React.ReactNode;
  lms_admin: React.ReactNode;
  org_admin: React.ReactNode;
  super_admin: React.ReactNode;
}) {
  // First verify user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user role - try RPC first, fallback to direct query
  let user_role: string | null = null;
  let is_active = false;

  try {
    const userData = await fetchUserData();
    user_role = userData?.user_role ?? null;
    is_active = userData?.is_active ?? false;
  } catch (error) {
    console.error('fetchUserData RPC failed, trying direct query:', error);
  }

  // Fallback: query users table directly if RPC failed
  if (!user_role) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (userRecord) {
      user_role = userRecord.role;
      is_active = userRecord.is_active ?? false;
    }
  }

  if (!user_role) {
    return null;
  }

  return (

    <>
      {!is_active && <div className='w-[calc(100vw-64px)] h-[calc(100vh-64px)] flex items-center justify-center'>
        <InactiveEmail />
      </div>}
      {children}
      {user_role === 'learner' && is_active && learner}
      {(user_role === 'LMSAdmin' || user_role === 'learningManager') && is_active && lms_admin}
      {user_role === 'organizationAdmin' && is_active && org_admin}
      {user_role === 'superAdmin' && is_active && super_admin}
      <Toaster richColors />
    </>
  );
}
