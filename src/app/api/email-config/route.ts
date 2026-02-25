import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encryptApiKey, decryptApiKey } from '@/lib/ai/encryption';
import type { EmailProvider } from '@/types/notifications';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('get_organization_email_config');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const config = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ config: config || null });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify org admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['organizationAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { provider, from_email, from_name, config, is_active } = body;

    // Encrypt provider credentials if provided
    let encryptedConfig: string | null = null;
    if (config && typeof config === 'object') {
      encryptedConfig = encryptApiKey(JSON.stringify(config));
    }

    const { error } = await supabase.rpc('upsert_organization_email_config', {
      p_provider: provider as EmailProvider,
      p_from_email: from_email || 'noreply@example.com',
      p_from_name: from_name || 'LMS Notifications',
      p_config_encrypted: encryptedConfig,
      p_is_active: is_active ?? false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
