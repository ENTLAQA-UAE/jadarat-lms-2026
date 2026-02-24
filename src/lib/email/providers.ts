// ============================================================================
// Email Provider Abstraction Layer
// ============================================================================
// Supports SMTP (via nodemailer), Resend API, and Mailgun API.
// Each provider implements the same interface for sending emails.
// ============================================================================

import type { SmtpConfig, ResendConfig, MailgunConfig, EmailProvider } from '@/types/notifications';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from_email: string;
  from_name: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function sendViaSmtp(
  config: SmtpConfig,
  params: SendEmailParams
): Promise<SendEmailResult> {
  try {
    // Dynamic import to avoid bundling nodemailer on client
    const nodemailer = await import('nodemailer');

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.encryption === 'ssl',
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: config.encryption === 'tls' ? { rejectUnauthorized: false } : undefined,
    });

    const info = await transporter.sendMail({
      from: `"${params.from_name}" <${params.from_email}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMTP send failed',
    };
  }
}

async function sendViaResend(
  config: ResendConfig,
  params: SendEmailParams
): Promise<SendEmailResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.api_key}`,
      },
      body: JSON.stringify({
        from: `${params.from_name} <${params.from_email}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Resend API error' };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Resend send failed',
    };
  }
}

async function sendViaMailgun(
  config: MailgunConfig,
  params: SendEmailParams
): Promise<SendEmailResult> {
  try {
    const baseUrl = config.region === 'eu'
      ? 'https://api.eu.mailgun.net/v3'
      : 'https://api.mailgun.net/v3';

    const formData = new URLSearchParams();
    formData.append('from', `${params.from_name} <${params.from_email}>`);
    formData.append('to', params.to);
    formData.append('subject', params.subject);
    formData.append('html', params.html);

    const response = await fetch(`${baseUrl}/${config.domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.api_key}`).toString('base64')}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Mailgun API error' };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mailgun send failed',
    };
  }
}

export async function sendEmail(
  provider: EmailProvider,
  providerConfig: SmtpConfig | ResendConfig | MailgunConfig,
  params: SendEmailParams
): Promise<SendEmailResult> {
  switch (provider) {
    case 'smtp':
      return sendViaSmtp(providerConfig as SmtpConfig, params);
    case 'resend':
      return sendViaResend(providerConfig as ResendConfig, params);
    case 'mailgun':
      return sendViaMailgun(providerConfig as MailgunConfig, params);
    default:
      return { success: false, error: `Unknown provider: ${provider}` };
  }
}
