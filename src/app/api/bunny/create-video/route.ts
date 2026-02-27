import { NextRequest, NextResponse } from 'next/server';
import { BunnyStream } from '@/lib/bunny/stream';

export async function POST(request: NextRequest) {
  let body: { title?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const title = body.title?.trim();
  if (!title) {
    return NextResponse.json(
      { error: 'Missing required field: title' },
      { status: 400 }
    );
  }

  try {
    const bunny = new BunnyStream();

    // Step 1: Create the video placeholder in Bunny Stream
    const { guid: videoId, libraryId } = await bunny.createVideo(title);

    // Step 2: Generate TUS upload credentials for client-side resumable upload
    const tusCredentials = bunny.generateTusCredentials(videoId);

    return NextResponse.json({
      videoId: tusCredentials.videoId,
      libraryId,
      tusEndpoint: tusCredentials.uploadUrl,
      tusAuthHeader: tusCredentials.authorizationSignature,
      tusAuthExpire: tusCredentials.authorizationExpire,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create video';

    console.error('[POST /api/bunny/create-video]', message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
