'use client'
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect } from 'react'

function BuildCoursePage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const url = searchParams.get('url')
   const courseId = searchParams.get('courseId')
   const handleWS = useCallback(
      async (message: any) => {
         const supabase = createClient()
         if (message.origin !== 'https://coassemble.com') return;
         const payload = JSON.parse(message.data);
         if (payload?.data?.id && courseId) {
            console.log("payload =>", payload);
            let { data, error } = await supabase
               .rpc('add_coassemble_id', {
                  _coassemble_id: payload.data.id.toString(),
                  _course_id: +courseId
               })
            if (error) console.error(error)
            else console.log(data)
         }
      }, [courseId]
   );

   useEffect(() => {
      if (typeof window !== 'undefined')
         window.addEventListener('message', handleWS);

      return () => {
         window.removeEventListener('message', handleWS);
      };
   }, [handleWS]);

   //if make listen to the message == "back" then redirect to the course page
   const onMessage = useCallback((event: MessageEvent) => {
      try {
         const message = JSON.parse(event.data);
         if (message.type === 'back') {
            router.push('/dashboard/courses'); // Redirect back to the /training page
         }
      } catch (error) {
         console.error('Message handling error:', error);
      }
   }, [router]);

   useEffect(() => {
      window.addEventListener('message', onMessage);
      return () => {
         window.removeEventListener('message', onMessage);
      };
   }, [onMessage]);

   return (
      <div className='w-full h-dvh'>
         <iframe src={`https://coassemble.com/embed/${url}`} className='w-full h-dvh' />
      </div>
   )
}

export default BuildCoursePage