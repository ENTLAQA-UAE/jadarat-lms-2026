// /api/scorm/[slug]/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { mkdir, writeFile, readFile, readdir, stat } from 'fs/promises';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { parse } from 'csv-parse/sync';
import os from 'os';

const SCORM_BASE_DIR = process.env.NODE_ENV === 'development' 
  ? join(process.cwd(), 'public', 'scorm')
  : join(os.tmpdir(), 'scorm');

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = params.slug;
  try {
    const supabase = await createClient();
    const { data: course, error } = await supabase
      .from('courses')
      .select('scorm_url, id, scorm_version')
      .eq('slug', slug)
      .single();

    if (error || !course) {
      console.error("Supabase error:", error);
      return new NextResponse('Course not found', { status: 404 });
    }

    // Create base directory
    const coursePath = join(SCORM_BASE_DIR, slug);
    
    // Check if files are already extracted
    try {
      const stats = await stat(coursePath);
      if (stats.isDirectory()) {
        // Files already extracted, skip extraction
        return await handleManifest(coursePath, course, slug);
      }
    } catch {
      // Directory doesn't exist, proceed with extraction
    }

    await mkdir(coursePath, { recursive: true });

    // Fetch and extract SCORM package
    const response = await fetch(course.scorm_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch SCORM package: ${response.statusText}`);
    }

    const zipBuffer = Buffer.from(await response.arrayBuffer());
    const zip = new JSZip();
    const contents = await zip.loadAsync(zipBuffer);

    // Extract all files with proper error handling
    const extractionPromises = [];
    for (const [filePath, file] of Object.entries(contents.files)) {
      if (file.dir) continue;
      
      const extractPromise = async () => {
        const fullPath = join(coursePath, filePath);
        const fileDir = join(fullPath, '..');
        
        await mkdir(fileDir, { recursive: true });
        const content = await file.async('nodebuffer');
        await writeFile(fullPath, content);
      };
      
      extractionPromises.push(extractPromise());
    }

    // Wait for all files to be extracted
    await Promise.all(extractionPromises).catch((error) => {
      throw new Error(`Failed to extract files: ${error.message}`);
    });

    return await handleManifest(coursePath, course, slug);

  } catch (error) {
    console.error('Error processing SCORM package:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process SCORM package', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to handle manifest processing
async function handleManifest(coursePath: string, course: { id: string, scorm_version: string }, slug: string) {
  let launchPath = '';

  if (course.scorm_version === 'aicc') {
    // Handle AICC
    const files = await readdir(coursePath);
    const auFile = files.find(file => file.endsWith('.au'));
    
    if (!auFile) {
      throw new Error('No .au file found in AICC package');
    }

    const auPath = join(coursePath, auFile);
    const auContent = await readFile(auPath, 'utf-8');
    
    const records = parse(auContent, {
      columns: true,
      skip_empty_lines: false,
      trim: true
    });

    if (records.length > 0) {
      launchPath = records[0].file_name;
    } else {
      throw new Error('No launch file found in AICC package');
    }
  } else {
    // Handle SCORM
    const manifestPath = join(coursePath, 'imsmanifest.xml');
    
    try {
      const manifestContent = await readFile(manifestPath, 'utf-8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });
      
      const manifest = parser.parse(manifestContent);
      const resources = manifest.manifest.resources.resource;
      const scoResource = Array.isArray(resources) 
        ? resources.find(r => r['@_adlcp:scormtype'] === 'sco')
        : resources;
      
      launchPath = scoResource?.['@_href'] || '';
      
      if (!launchPath) {
        throw new Error('No launch path found in manifest');
      }
    } catch (error) {
      console.error('Error processing manifest:', error);
      throw new Error(`Failed to process manifest: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const publicUrl = process.env.NODE_ENV === 'development'
    ? `/scorm/${slug}`
    : `/api/scorm/${slug}/content`;

  return NextResponse.json({ 
    path: publicUrl,
    launchPath,
    courseId: course.id,
    scormVersion: course.scorm_version
  });
}

