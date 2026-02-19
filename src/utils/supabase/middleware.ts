import { CookieOptions, createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next(); // Initialize response

    // Create Supabase server-side client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        {
            auth: {
                autoRefreshToken: true,
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            }
        }
    );

    // Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // if (!user) {
    //     return NextResponse.redirect(new URL('/login', request.url))
    // }

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const verifiedTOTP = factors?.totp.find(factor => factor.status === 'verified')
    
    // Get authenticated user data
    const mfaVerifiedAt = user?.user_metadata?.mfa_verified_at
    
    // Check if user has logged in after their last MFA verification
    const lastUpdateTime = new Date(user?.updated_at ?? 0).getTime()
    const lastMFATime = new Date(mfaVerifiedAt ?? 0).getTime()
    const requiresMFA = verifiedTOTP && (!mfaVerifiedAt || lastUpdateTime > lastMFATime)

    // If MFA is required and user is not on the verify-mfa page, redirect
    if (requiresMFA && !request.nextUrl.pathname.startsWith('/verify-mfa')) {
        return NextResponse.redirect(new URL('/verify-mfa', request.url))
    }

    // Check if user is not authenticated and trying to access a protected page
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) && !user) {
        // Prevent redirect loops by avoiding redirecting if already on login page
        if (pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Check if user is authenticated and trying to access login page
    if (pathname.endsWith('/login') && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.endsWith('/dashboard/insights') && !user) {
        return NextResponse.redirect(new URL('/dashboard/insights/general', request.url));
    }

    // Return the updated response
    return supabaseResponse;
}
