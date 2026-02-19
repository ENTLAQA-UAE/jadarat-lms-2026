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
  const { data: courseData, error: courseError } = await supabase.rpc('get_course_user_details', { slug_input: slug });
  const host = headers().get('host')

  const baseUrl = process.env.NODE_ENV === 'development' ? `http://${host}` : `https://${host}`
  

  return (
    <Player courseData={courseData[0]} baseUrl={baseUrl} slug={slug} showSidebar={true}/>
  )

}
