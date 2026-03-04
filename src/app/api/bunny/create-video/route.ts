import { NextRequest, NextResponse } from 'next/server';
import { BunnyStream } from '@/lib/bunny/stream';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  // Authenticate the user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

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

    // Step 3: Register the video in our database
    const orgResult = await supabase.rpc('get_user_org_id');
    const orgId = orgResult.data;

    if (orgId) {
      await supabase.rpc('register_bunny_video', {
        p_organization_id: orgId,
        p_bunny_video_id: videoId,
        p_bunny_library_id: libraryId,
        p_title: title,
        p_user_id: user.id,
      });
    }

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
