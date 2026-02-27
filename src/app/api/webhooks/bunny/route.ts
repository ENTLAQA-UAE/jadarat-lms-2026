import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

/**
 * Bunny Stream video status codes:
 *   0 = created
 *   1 = uploaded
 *   2 = processing
 *   3 = transcoding
 *   4 = finished (encoding complete)
 *   5 = error
 */
const BUNNY_STATUS_FINISHED = 4;
const BUNNY_STATUS_ERROR = 5;

interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;
}

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.BUNNY_STREAM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Bunny Webhook] BUNNY_STREAM_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Read raw body for signature verification
  const rawBody = await request.text();

  // Verify the webhook signature
  const signatureHeader = request.headers.get('x-bunny-signature');
  const isValid = verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);

  if (!isValid) {
    console.error('[Bunny Webhook] Invalid webhook signature');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // Parse the verified payload
  let payload: BunnyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error('[Bunny Webhook] Failed to parse webhook payload');
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  const { VideoGuid, VideoLibraryId, Status } = payload;

  if (!VideoGuid || Status === undefined) {
    console.error('[Bunny Webhook] Missing required fields in payload');
    return NextResponse.json(
      { error: 'Missing required fields: VideoGuid, Status' },
      { status: 400 }
    );
  }

  console.log(
    `[Bunny Webhook] Video ${VideoGuid} (Library ${VideoLibraryId}) - Status: ${Status}`
  );

  // Only process finished or error statuses
  if (Status !== BUNNY_STATUS_FINISHED && Status !== BUNNY_STATUS_ERROR) {
    return NextResponse.json({ received: true, action: 'ignored', status: Status });
  }

  try {
    const supabase = await createClient();

    const statusLabel = Status === BUNNY_STATUS_FINISHED ? 'finished' : 'error';

    const { error: rpcError } = await supabase.rpc('update_bunny_video_status', {
      p_bunny_video_id: VideoGuid,
      p_bunny_library_id: String(VideoLibraryId),
      p_status: statusLabel,
    });

    if (rpcError) {
      console.error('[Bunny Webhook] Supabase RPC error:', rpcError.message);
      return NextResponse.json(
        { error: 'Failed to update video status' },
        { status: 500 }
      );
    }

    console.log(
      `[Bunny Webhook] Updated video ${VideoGuid} status to "${statusLabel}"`
    );

    return NextResponse.json({
      received: true,
      action: 'updated',
      videoId: VideoGuid,
      status: statusLabel,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[Bunny Webhook] Unexpected error:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
