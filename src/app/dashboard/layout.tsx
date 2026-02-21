import { fetchUserData } from '@/action/authAction';
import InactiveEmail from '@/components/InactiveEmail';
import { Toaster } from '@/components/ui/sonner';

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
  const userData = await fetchUserData();
  const user_role = userData?.user_role;
  const is_active = userData?.is_active;

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
