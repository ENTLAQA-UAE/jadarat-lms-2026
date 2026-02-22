import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { encryptApiKey } from '@/lib/ai/encryption';

// POST: Save org AI configuration (server-side, encrypts API key)
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['organizationAdmin', 'LMSAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const {
      provider,
      model,
      apiKey,
      systemPrompt,
      temperature,
      maxTokens,
      rateLimitRpm,
      rateLimitRpd,
      chatEnabled,
      searchEnabled,
      recommendationsEnabled,
    } = body;

    // Encrypt the API key if provided (otherwise pass null to keep existing)
    let encryptedKey: string | null = null;
    if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
      encryptedKey = encryptApiKey(apiKey.trim());
    }

    const { error } = await supabase.rpc('upsert_org_ai_config', {
      p_provider: provider || 'anthropic',
      p_model: model || 'claude-sonnet-4-5-20250929',
      p_api_key: encryptedKey,
      p_system_prompt: systemPrompt || null,
      p_temperature: temperature ?? 0.7,
      p_max_tokens: maxTokens ?? 2048,
      p_rate_limit_rpm: rateLimitRpm ?? 30,
      p_rate_limit_rpd: rateLimitRpd ?? 500,
      p_chat_enabled: chatEnabled ?? true,
      p_search_enabled: searchEnabled ?? true,
      p_recommendations_enabled: recommendationsEnabled ?? true,
    });

    if (error) {
      console.error('Failed to save AI config:', error);
      return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI config API error:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// GET: Retrieve org AI configuration (without decrypted key)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await supabase.rpc('get_org_ai_config');
    const config = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({ config: config || null });
  } catch (error) {
    console.error('AI config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}
