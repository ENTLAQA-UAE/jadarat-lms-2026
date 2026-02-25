'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function fetchUserData() {
  try {
    const supabase = await createClient();

    let { data, error } = await supabase.rpc('get_user_details');

    if (error) {
      console.error('Error fetching user details:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0];
    return { ...row, user_role: row.role };
  } catch {
    return null;
  }
}

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});



export async function loginAuth(_currentState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Validate inputs using Zod
  try {
    loginSchema.parse({ email, password });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
  }

  const supabase = await createClient();
  const domain = headers().get('host') ?? '';
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMIAN;
  const devDomain = process.env.NEXT_PUBLIC_MAIN_DOMIAN_DEV;

  try {
    // Only check organization membership if NOT on main domain AND NOT on dev domain
    if (domain !== mainDomain && domain !== devDomain) {
      const { data: orgUser, error: orgError } = await supabase.rpc(
        "check_if_user_exists_under_organization",
        {
          domain,
          user_email: email,
        }
      );

      if (orgError || !orgUser) {
        return "You don't have access to this organization.";
      }
    }

    // Attempt authentication for all users
    const { error: authError, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Changed condition: return error if there IS an error OR if there is NO user
    if (authError || !data.user) {
      return "Invalid credentials.";
    }
  } catch (error) {
    console.error("Login error:", error);
    return "An unexpected error occurred. Please try again.";
  }

  redirect("/dashboard");
}