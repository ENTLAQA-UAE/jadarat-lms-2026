import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { decryptApiKey } from '@/lib/ai/encryption';
import { sendEmail } from '@/lib/email/providers';
import type { EmailProvider, SmtpConfig, ResendConfig, MailgunConfig } from '@/types/notifications';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify role
    const { data: userData } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (!userData || !['organizationAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the org email config (including encrypted credentials)
    const { data: orgUser } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!orgUser) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { data: emailConfig } = await supabase
      .from('organization_email_config')
      .select('*')
      .eq('organization_id', orgUser.organization_id)
      .single();

    if (!emailConfig || !emailConfig.config_encrypted) {
      return NextResponse.json({ error: 'Email configuration not found or credentials missing' }, { status: 404 });
    }

    // Decrypt credentials
    let providerConfig: SmtpConfig | ResendConfig | MailgunConfig;
    try {
      providerConfig = JSON.parse(decryptApiKey(emailConfig.config_encrypted));
    } catch {
      return NextResponse.json({ error: 'Failed to decrypt email credentials' }, { status: 500 });
    }

    // Send test email to the admin
    const result = await sendEmail(
      emailConfig.provider as EmailProvider,
      providerConfig,
      {
        to: userData.email,
        subject: 'Test Email - Jadarat LMS Notification System',
        html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1>Test Email</h1><p>This is a test email from your Jadarat LMS notification system.</p><p>If you received this email, your email configuration is working correctly!</p></div>',
        from_email: emailConfig.from_email,
        from_name: emailConfig.from_name,
      }
    );

    if (result.success) {
      // Mark as verified
      await supabase
        .from('organization_email_config')
        .update({ is_verified: true, last_tested_at: new Date().toISOString() })
        .eq('organization_id', orgUser.organization_id);

      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ error: result.error || 'Test email failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
