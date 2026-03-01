import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logUsage, GatewayError } from '@/lib/ai/gateway';
import { BunnyStorage } from '@/lib/bunny/storage';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const maxDuration = 60;

const requestSchema = z.object({
  prompt: z.string().min(3).max(1000),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1792x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  style: z.enum(['natural', 'vivid']).default('natural'),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // Use platform-level OPENAI_API_KEY for image generation
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured for image generation' },
        { status: 500 }
      );
    }

    // Call OpenAI DALL-E 3
    const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: params.prompt,
        n: 1,
        size: params.size,
        quality: params.quality,
        style: params.style,
        response_format: 'url',
      }),
    });

    if (!dalleRes.ok) {
      const err = await dalleRes.json().catch(() => ({}));
      const msg =
        err?.error?.message || `DALL-E API error: ${dalleRes.status}`;
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const dalleData = await dalleRes.json();
    const tempUrl: string = dalleData.data?.[0]?.url;
    const revisedPrompt: string = dalleData.data?.[0]?.revised_prompt || params.prompt;

    if (!tempUrl) {
      return NextResponse.json(
        { error: 'DALL-E did not return an image URL' },
        { status: 502 }
      );
    }

    // Download the generated image from DALL-E's temporary URL
    const imageRes = await fetch(tempUrl);
    if (!imageRes.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image from DALL-E' },
        { status: 502 }
      );
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // Upload to Bunny CDN Storage
    const orgId =
      (await supabase.rpc('get_user_org_id')).data || 'platform';
    const imageId = uuidv4();
    const cdnPath = `images/ai-generated/${orgId}/${imageId}.png`;

    const bunnyStorage = new BunnyStorage();
    await bunnyStorage.uploadFile(cdnPath, imageBuffer);

    // Build the public CDN URL (no signed URL needed for public images)
    const cdnHost =
      process.env.NEXT_PUBLIC_BUNNY_CDN_HOST || 'scorm.jadarat.com';
    const imageUrl = `https://${cdnHost}/${cdnPath}`;

    // Log usage
    await supabase.from('ai_generation_log').insert({
      organization_id: orgId === 'platform' ? null : orgId,
      user_id: user.id,
      operation: 'generate_image',
      model: 'dall-e-3',
      input_tokens: 0,
      output_tokens: 0,
      cost_usd: estimateCost(params.quality, params.size),
      input_summary: `Prompt: ${params.prompt.slice(0, 100)}`,
      output_summary: `Image generated: ${cdnPath}`,
    });

    await logUsage(supabase, 'generate_image', 0);

    return NextResponse.json({
      image_url: imageUrl,
      cdn_path: cdnPath,
      revised_prompt: revisedPrompt,
      model: 'dall-e-3',
    });
  } catch (error) {
    console.error('Image generation error:', error);
    if (error instanceof GatewayError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function estimateCost(
  quality: string,
  size: string
): number {
  // DALL-E 3 pricing (as of 2025):
  // Standard: $0.040 (1024x1024), $0.080 (1792x1024 or 1024x1792)
  // HD:       $0.080 (1024x1024), $0.120 (1792x1024 or 1024x1792)
  if (quality === 'hd') {
    return size === '1024x1024' ? 0.08 : 0.12;
  }
  return size === '1024x1024' ? 0.04 : 0.08;
}
