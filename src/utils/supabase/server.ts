import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies as nextCookies } from 'next/headers';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Key are not configured');
  }

  // Remove artificial delay and simplify cookie handling
  const cookieStore = nextCookies();

  return createServerClient(
    url,
    key,
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

/**
 * Server-side admin client using the service_role key.
 * Bypasses RLS — use only in server actions / server components.
 */
export function createServerAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Secret Key are not configured');
  }

  return createSupabaseClient(url, key);
}
