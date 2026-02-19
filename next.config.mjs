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
            "s3-placid.s3.eu-central-1.amazonaws.com",
            "www.ti.com",
            "c0.wallpaperflare.com",
            "img.freepik.com",
            "placehold.co"
        ],
    },
};

export default nextConfig;
