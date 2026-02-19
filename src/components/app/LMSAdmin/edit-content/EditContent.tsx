"use client";

import { getSignedURLForEdit } from "@/app/dashboard/@learner/course/play/[id]/getSignedURL";
import { LoadingAnimation } from "@/components/loader";
import NoContent from "@/components/shared/NoContent";
import { useAppSelector } from "@/hooks/redux.hook";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function EditContent({ coassembleId }: { coassembleId: string }) {
 const { user: { organization_id, id } } = useAppSelector((state) => state.user);
 const [state, setState] = useState({
  url: undefined as string | undefined,
  isLoading: false,
  hasContent: true,
 });
 const router = useRouter();

 useEffect(() => {
  async function fetchSignedURLForEdit() {
   if (coassembleId && id && organization_id) {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
     const data = await getSignedURLForEdit(coassembleId);
     setState({ url: data, isLoading: false, hasContent: !!data });
    } catch (error) {
     console.error('Error fetching signed URL for edit:', error);
     setState({ url: undefined, isLoading: false, hasContent: false });
    }
   }
  }

  fetchSignedURLForEdit();
 }, [coassembleId, id, organization_id]);

 const onMessage = useCallback((event: MessageEvent) => {
  try {
   const message = JSON.parse(event.data);
   if (message.type === 'back') {
    router.push('/dashboard/courses');
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
  <>
   {state.isLoading ? (
    <div className="h-full w-full flex items-center justify-center">
     <LoadingAnimation />
    </div>
   ) : state.url ? (
    <div className="h-full w-full">
     <iframe src={state.url} width="100%" height="100%" />
    </div>
   ) : (
    !state.hasContent && <NoContent />
   )}
  </>
 );
}
