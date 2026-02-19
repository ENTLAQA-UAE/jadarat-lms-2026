import { rm } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';
import os from 'os';

const SCORM_BASE_DIR = process.env.NODE_ENV === 'development' 
  ? join(process.cwd(), 'public', 'scorm')
  : join(os.tmpdir(), 'scorm');

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const coursePath = join(SCORM_BASE_DIR, params.slug);
    await rm(coursePath, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cleaning up SCORM content:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 