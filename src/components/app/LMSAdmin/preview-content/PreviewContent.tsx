"use client";
import { getSignedURL } from "@/app/dashboard/@learner/course/play/[id]/getSignedURL";
import { LoadingAnimation } from "@/components/loader";
import NoContent from "@/components/shared/NoContent";
import TestMode from "@/components/shared/TestMode";
import { useAppSelector } from "@/hooks/redux.hook";
import { useEffect, useState } from "react";

function PreviewContent({ coassembleId }: { coassembleId: string }) {
    const { user: { organization_id, id } } = useAppSelector((state) => state.user);
    const [url, setUrl] = useState<string | undefined>(undefined);
    const [hasContent, setHasContent] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchSignedURL = async () => {
            if (coassembleId && id && organization_id) {
                setIsLoading(true); // Start loading
                try {
                    const data = await getSignedURL(coassembleId);
                    if (data) {
                        setUrl(data);
                    } else {
                        setHasContent(false); // No content available
                    }
                } catch (error) {
                    console.error('Error fetching signed URL:', error);
                    setHasContent(false); // Error also results in no content
                } finally {
                    setIsLoading(false); // Stop loading
                }
            }
        };

        fetchSignedURL();
    }, [coassembleId, id, organization_id]);

    return (
        <>
            <TestMode coassembleId={coassembleId} />
            {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                    <LoadingAnimation />
                </div>
            ) : url ? (
                <div className="h-full w-full">
                    <iframe src={url} width="100%" height="100%" />
                </div>
            ) : (
                !hasContent && <NoContent />
            )}
        </>
    );
}

export default PreviewContent;
