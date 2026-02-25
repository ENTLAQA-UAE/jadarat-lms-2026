import { fetchUserData } from "@/action/authAction";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Function to fetch the file from the Supabase storage
const fetchFileFromSupabase = async (fileUrl: string) => {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
  }

  return response;
};

// Add MIME type mapping
const getMimeType = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'html': 'text/html',
    'js': 'application/javascript',
    'css': 'text/css',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'xml': 'application/xml',
    'json': 'application/json',
  };
  return mimeTypes[extension ?? ''] || 'application/octet-stream';
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { path: string[] } }
) => {
  const courseSlug = params.path[0];
  const searchPath = params.path.slice(1).join("/");
  const userData = await fetchUserData();
  const organization_id = userData?.organization_id;


  try {
    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scorm/${organization_id}/scorm/${courseSlug}/extract/${searchPath}`

    if (!fileUrl) {
      return NextResponse.json(
        {
          error: "File not found",
          requestedPath: searchPath,
        },
        { status: 404 }
      );
    }

    const response = await fetchFileFromSupabase(fileUrl);

    const content = await response.arrayBuffer();
    const contentType = getMimeType(searchPath);


    const headersList = headers()
    const origin = headersList.get('origin')

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0",
        "Access-Control-Allow-Origin": origin ?? "*",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Cross-Origin-Embedder-Policy": "credentialless",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error serving file" },
      { status: 500 }
    );
  }
};
