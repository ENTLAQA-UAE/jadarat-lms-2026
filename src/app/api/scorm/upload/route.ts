import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BunnyStorage } from '@/lib/bunny/storage';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export const maxDuration = 300; // 5 minutes for large SCORM packages

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;
    const organizationId = formData.get('organization_id') as string | null;
    const deleteOld = formData.get('delete_old') === 'true';

    if (!file || !slug || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, slug, organization_id' },
        { status: 400 }
      );
    }

    // Extract ZIP
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Parse imsmanifest.xml
    const manifestKey = Object.keys(zip.files).find((path) =>
      path.toLowerCase().includes('imsmanifest.xml')
    );

    if (!manifestKey) {
      return NextResponse.json(
        { error: 'Invalid SCORM package: missing imsmanifest.xml' },
        { status: 400 }
      );
    }

    const manifestXml = await zip.files[manifestKey].async('string');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const manifest = parser.parse(manifestXml);
    const resources = manifest?.manifest?.resources?.resource;
    const scoResource = Array.isArray(resources)
      ? resources.find(
          (r: Record<string, string>) => r['@_adlcp:scormtype'] === 'sco'
        )
      : resources;
    const launchPath = scoResource?.['@_href'] || 'index.html';

    if (!launchPath) {
      return NextResponse.json(
        { error: 'No launch path found in manifest' },
        { status: 400 }
      );
    }

    const bunnyStorage = new BunnyStorage();
    const packagePath = `scorm/${organizationId}/${slug}`;

    // Delete old package if switching
    if (deleteOld) {
      await bunnyStorage.deleteDirectory(packagePath);
    }

    // Collect all files from ZIP
    const files = new Map<string, Buffer>();
    const filePromises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        filePromises.push(
          zipEntry.async('nodebuffer').then((buffer) => {
            files.set(relativePath, buffer);
          })
        );
      }
    });

    await Promise.all(filePromises);

    // Upload to Bunny Storage
    const result = await bunnyStorage.uploadScormPackage(packagePath, files);

    return NextResponse.json({
      launchPath,
      packageId: packagePath,
      totalFiles: result.totalFiles,
      totalBytes: result.totalBytes,
    });
  } catch (error) {
    console.error('SCORM upload error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload SCORM package',
      },
      { status: 500 }
    );
  }
}
