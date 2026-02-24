import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { decryptApiKey } from '@/lib/ai/encryption';
import { sendEmail } from '@/lib/email/providers';
import { renderTemplate } from '@/lib/email/template';
import type { EmailProvider, NotificationType, SmtpConfig, ResendConfig, MailgunConfig } from '@/types/notifications';

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
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!userData || !['LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { type, title, message, metadata } = body as {
      type: NotificationType;
      title: string;
      message?: string;
      metadata?: Record<string, unknown>;
    };

    if (!type || !title) {
      return NextResponse.json({ error: 'type and title are required' }, { status: 400 });
    }

    // For announcements, use bulk send
    if (type === 'announcement') {
      const { data: count, error } = await supabase.rpc('send_bulk_notification', {
        p_organization_id: userData.organization_id,
        p_type: type,
        p_title: title,
        p_body: message || '',
        p_metadata: metadata || {},
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Check if email is enabled for this trigger
      const { data: triggerSettings } = await supabase
        .from('notification_trigger_settings')
        .select('email_enabled')
        .eq('organization_id', userData.organization_id)
        .eq('notification_type', type)
        .single();

      if (triggerSettings?.email_enabled) {
        // Fire and forget email delivery
        sendBulkEmail(supabase, userData.organization_id, type, { title, message: message || '' }).catch(console.error);
      }

      return NextResponse.json({ success: true, count });
    }

    return NextResponse.json({ error: 'Use the send_notification RPC for non-announcement types' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendBulkEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: number,
  type: NotificationType,
  variables: Record<string, string>
) {
  // Get email config
  const { data: emailConfig } = await supabase
    .from('organization_email_config')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  if (!emailConfig?.is_active || !emailConfig.config_encrypted) return;

  // Decrypt credentials
  let providerConfig: SmtpConfig | ResendConfig | MailgunConfig;
  try {
    providerConfig = JSON.parse(decryptApiKey(emailConfig.config_encrypted));
  } catch {
    return;
  }

  // Get email template
  const { data: template } = await supabase
    .from('notification_email_templates')
    .select('subject, body_html')
    .eq('organization_id', organizationId)
    .eq('notification_type', type)
    .single();

  if (!template) return;

  // Get org name
  const { data: org } = await supabase
    .from('organization_settings')
    .select('name')
    .eq('organization_id', organizationId)
    .single();

  // Get all active learners who have email enabled
  const { data: learners } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .eq('role', 'learner');

  if (!learners?.length) return;

  for (const learner of learners) {
    // Check user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email_enabled, announcement_notify')
      .eq('user_id', learner.id)
      .single();

    // Default is true if no preferences set
    if (prefs && (!prefs.email_enabled || !prefs.announcement_notify)) continue;

    const templateVars = {
      ...variables,
      learner_name: learner.name || 'Learner',
      org_name: org?.name || '',
    };

    const subject = renderTemplate(template.subject, templateVars);
    const html = renderTemplate(template.body_html, templateVars);

    await sendEmail(
      emailConfig.provider as EmailProvider,
      providerConfig,
      {
        to: learner.email,
        subject,
        html,
        from_email: emailConfig.from_email,
        from_name: emailConfig.from_name,
      }
    );
  }
}
