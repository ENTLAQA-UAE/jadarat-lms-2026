import { NextResponse } from 'next/server';

let scormCache: Record<string, Record<string, string>> = {};

export async function GET(
 req: Request,
 { params }: { params: { slug: string; file: string } }
) {
 const { slug, file } = params;

 if (!scormCache[slug]) {
  return NextResponse.json(
   { error: 'SCORM files not found. Please extract them first.' },
   { status: 404 }
  );
 }

 const fileContent = scormCache[slug][file];
 if (!fileContent) {
  return NextResponse.json(
   { error: `File ${file} not found in SCORM package` },
   { status: 404 }
  );
 }

 return new NextResponse(fileContent, {
  headers: {
   'Content-Type': 'text/html', // Adjust based on file type
   'Cache-Control': 'no-cache',
  },
 });
}
