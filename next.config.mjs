import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ["error"] } : false,
    },
    redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
            },
        ];
    },
    images: {
        domains: [
            "assets-global.website-files.com",
            "1000logos.net",
            "hsa.entlaqa.com",
            "images.unsplash.com",
            "brfxdvhnrvldmtbldmzl.supabase.co",
            "dlglrlznszcrgjxwviwb.supabase.co",
            "rvfsdurjdrdbirlbbjcv.supabase.co",
            "s3-placid.s3.eu-central-1.amazonaws.com",
            "www.ti.com",
            "c0.wallpaperflare.com",
            "img.freepik.com",
            "placehold.co"
        ],
    },
};

export default withSentryConfig(nextConfig, {
    // Sentry webpack plugin options
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Upload source maps for better stack traces
    widenClientFileUpload: true,

    // Reduce bundle size by tree-shaking logger statements
    disableLogger: true,

    // Silently skip source map upload if no auth token (dev/CI without secrets)
    silent: !process.env.SENTRY_AUTH_TOKEN,
});
