import { createServerClient } from '@supabase/ssr';
import { cookies as nextCookies } from 'next/headers';

export async function createClient() {
  // Remove artificial delay and simplify cookie handling
  const cookieStore = nextCookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      cookies: {
        async getAll() {
          return cookieStore.getAll().map(({ name, value }) => ({
            name,
            value,
          }));
        },
        async setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set more conservative cookie options
              cookieStore.set(name, value, {
                ...options,
                secure: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
              });
            });
          } catch (error) {
            // Log error in development
            if (process.env.NODE_ENV === 'development') {
              console.error('Error setting cookies:', error);
            }
          }
        },
      },
    }
  );
}
