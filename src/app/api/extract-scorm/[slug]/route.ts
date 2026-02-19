// app/api/scorm/[slug]/[...path]/route.ts
import { createClient } from '@/utils/supabase/server';
import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';

const scormCache = new Map<string, JSZip>();

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; path: string[] } }
) {
  try {
    const { slug, path } = params;
    const filePath = path.join('/');

    let zip = scormCache.get(slug);
    if (!zip) {
      const supabase = await createClient();
      const { data: course } = await supabase
        .from('courses')
        .select('scorm_url')
        .eq('slug', slug)
        .single();

      if (!course) {
        return new NextResponse('Course not found', { status: 404 });
      }

      const response = await fetch(course.scorm_url);
      const arrayBuffer = await response.arrayBuffer();
      zip = await JSZip.loadAsync(arrayBuffer);
      scormCache.set(slug, zip);
    }

    const file = zip.file(filePath);
    if (!file) {
      return new NextResponse('File not found', { status: 404 });
    }

    const content = await file.async('uint8array');
    const contentType = getContentType(filePath);

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error serving SCORM file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const types: Record<string, string> = {
    html: 'text/html',
    js: 'application/javascript',
    css: 'text/css',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    pdf: 'application/pdf',
    xml: 'application/xml',
  };
  return types[ext] || 'application/octet-stream';
}