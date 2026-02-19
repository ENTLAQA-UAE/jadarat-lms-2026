import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readdir } from 'fs/promises';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
 try {
  const publicPath = join(process.cwd(), 'public', 'scorm', params.slug);
  const files = await readdir(publicPath, { recursive: true });

  // Filter for HTML files and convert to relative paths
  const htmlFiles = files
   .filter(file => typeof file === 'string' && file.endsWith('.html'))
   .map(file => file.replace(/\\/g, '/'));

  return NextResponse.json(htmlFiles);
 } catch (error) {
  console.error('Error listing SCORM files:', error);
  return new NextResponse('Failed to list SCORM files', { status: 500 });
 }
}