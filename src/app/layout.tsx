export const dynamic = 'force-dynamic';
import './globals.css';
import localFont from 'next/font/local';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as Toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import NextTopLoader from 'nextjs-toploader';
import SetupProvider from '@/context/setup.context';
import LangugageProvider from '@/context/language.context';
import AppThemeProvider from '@/context/theme.context';
import { Suspense } from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';
import {
  getOrganizationDetails,
  getOrganizationSubscription,
  getUserDetails,
} from '@/action/organization/organizationAction';

const localFonts = localFont({
  src: [
    { path: '../../public/fonts/light.otf', weight: '300' },
    { path: '../../public/fonts/regular.otf', weight: '400' },
    { path: '../../public/fonts/medium.otf', weight: '500' },
    { path: '../../public/fonts/bold.otf', weight: '700' },
  ],
  variable: '--font-ping-font-tlwen',
});

export async function generateMetadata() {
  const headersList = headers();
  const domainWithPort = headersList.get('host') || '';
  const [domain] = domainWithPort.split(':');

  let title = 'Jadarat';

  if (domain === 'localhost') {
    title = 'Jadarat';
  } else {
    let subdomain = domain.split('.')[0];
    subdomain = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);

    title = `${subdomain} LMS`;
  }
  return {
    title,
    description:
      'ENTLAQA is an Arabic name which means a successful launch of rockets & spaceships toward the space which we believe it’s a crucial part of our daily lives to help customers successfully launch any kind of project.',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side data fetching with error handling
  const fulldomain = headers().get('host');

  let organizationDetails = null;
  let organizationSubscription = null;
  let userDetails = null;

  try {
    [organizationDetails, organizationSubscription, userDetails] = await Promise.all([
      getOrganizationDetails(fulldomain! ?? null),
      getOrganizationSubscription(),
      getUserDetails(),
    ]);
  } catch (error) {
    // Handle error if any of the requests fail
    console.error('Failed to fetch data:', error);
  }
  // Provide fallback data if requests fail
  organizationDetails = organizationDetails || {
    settings: {
      logo: "/logo.png",
      authBackground: "/side.png",
      name: "Entlaqa",
      primaryColor: "#706efa",
      secondaryColor: "",
      courseExpirationEnabled: false,
      courseExpirationPeriod: 0,
      courseSelfEntrollmentPolicy: 'direct',
      organization_id: 0,
      registerationDomain: '',
      registerationEnabled: false,
      registerationRequireApproval: false,
      registerationRequireSpecificDomain: false,
      certificate: {}
    },
    subscription: undefined,
    loading: true,
    courses: []
  };

  organizationSubscription = organizationSubscription || {
    subscription_type: 'free',
    features: [],
  };

  return (
    <html lang="ar" dir="auto">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="HandheldFriendly" content="true" />
        <Script strategy="beforeInteractive" src="https://cdn.weglot.com/weglot.min.js" />
        <Script strategy="beforeInteractive" src="https://player.vimeo.com/api/player.js" />
        <Script id="Weglot" strategy="beforeInteractive">
          {`setTimeout(() => {
            try {
              if (typeof Weglot !== 'undefined') {
                Weglot.initialize({
                  api_key: "wg_6ed8ff3cee7ad29ea2def8ac2f08adfa8",
                  hide_switcher: true,
                });
              }
            } catch (e) {
              console.warn('Weglot initialization failed:', e);
            }
          }, 400)`}
        </Script>
      </head>
      <body className={cn('min-h-screen bg-background', localFonts.className)}>
        <Suspense>
          <LangugageProvider>
            <SetupProvider
              organizationDetails={organizationDetails}
              organizationSubscription={organizationSubscription}
              userDetails={userDetails}
            >
              <AppThemeProvider>
                <NextTopLoader showSpinner={false} />
                {children}
                <Toaster />
                <Toast />
              </AppThemeProvider>
            </SetupProvider>
          </LangugageProvider>
        </Suspense>
      </body>
    </html>
  );
}