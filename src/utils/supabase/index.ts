import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

function makeCookieAdapter() {
    return {
        get(name: string) {
            return getCookie(name);
        },
        set(name: string, value: string, options: CookieOptions) {
            try {
                setCookie(name, value, options);
            } catch (error) {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
            }
        },
        remove(name: string, options: CookieOptions) {
            try {
                deleteCookie(name, options);
            } catch (error) {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing
                // user sessions.
            }
        },
    };
}

let _client: ReturnType<typeof createServerClient> | null = null;
let _adminClient: ReturnType<typeof createServerClient> | null = null;

export const createClient = () => {
    if (!_client) {
        _client = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_KEY!,
            {
                cookies: makeCookieAdapter(),
                auth: { autoRefreshToken: true },
            }
        );
    }
    return _client;
};

export const createAdminClient = () => {
    if (!_adminClient) {
        _adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!,
            {
                cookies: makeCookieAdapter(),
                auth: { autoRefreshToken: true },
            }
        );
    }
    return _adminClient;
};
