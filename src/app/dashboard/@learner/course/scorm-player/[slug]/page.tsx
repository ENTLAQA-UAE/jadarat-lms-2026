"use server"
import { createClient } from '@/utils/supabase/server';
import Player from './Player';
import { headers } from 'next/headers';

export default async function ScormPlayerPage({
  params: { slug }
}: {
  params: { slug: string }
}) {

  const supabase = await createClient();
  const { data: courseData } = await supabase.rpc('get_course_user_details', { slug_input: slug });
  const host = headers().get('host')

  const baseUrl = process.env.NODE_ENV === 'development' ? `http://${host}` : `https://${host}`

  // Generate Bunny CDN signed URL if configured, otherwise use proxy route
  let scormContentUrl: string | undefined;
  const bunnyPullZoneKey = process.env.BUNNY_PULL_ZONE_KEY;
  const bunnyCdnHost = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST;

  if (bunnyPullZoneKey && bunnyCdnHost && courseData?.[0]?.organization_id) {
    try {
      const { BunnyCDN } = await import('@/lib/bunny/cdn');
      const cdn = new BunnyCDN();
      const orgId = courseData[0].organization_id;
      const launchPath = courseData[0].launch_path || 'index.html';
      scormContentUrl = cdn.generateSignedDirectoryUrl(
        `scorm/${orgId}/${slug}`,
        launchPath,
        7200 // 2 hour expiry
      );
    } catch {
      // Fall back to proxy route if Bunny CDN is not configured
    }
  }

  return (
    <Player
      courseData={courseData[0]}
      baseUrl={baseUrl}
      slug={slug}
      showSidebar={true}
      scormContentUrl={scormContentUrl}
    />
  )
}
