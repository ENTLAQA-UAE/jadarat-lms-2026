// ============================================================================
// Notification System Types
// ============================================================================

export type NotificationType = 'enrollment' | 'completion' | 'deadline' | 'achievement' | 'announcement';
export type EmailProvider = 'smtp' | 'resend' | 'mailgun';

export interface Notification {
  id: number;
  organization_id: number;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  enrollment_notify: boolean;
  completion_notify: boolean;
  deadline_notify: boolean;
  achievement_notify: boolean;
  announcement_notify: boolean;
}

export interface NotificationTriggerSetting {
  id: number;
  notification_type: NotificationType;
  is_active: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;
}

export interface NotificationEmailTemplate {
  id: number;
  notification_type: NotificationType;
  subject: string;
  body_html: string;
}

export interface OrganizationEmailConfig {
  id: number;
  provider: EmailProvider;
  from_email: string;
  from_name: string;
  is_verified: boolean;
  is_active: boolean;
  last_tested_at: string | null;
}

// Provider-specific config shapes (used in forms, encrypted before storage)
export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'tls' | 'ssl' | 'none';
}

export interface ResendConfig {
  api_key: string;
}

export interface MailgunConfig {
  api_key: string;
  domain: string;
  region: 'us' | 'eu';
}

export type EmailProviderConfig = SmtpConfig | ResendConfig | MailgunConfig;

// Template variable definitions (used by the template editor UI)
export interface TemplateVariable {
  key: string;
  label: string;
  labelAr: string;
  example: string;
}

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { en: string; ar: string }> = {
  enrollment: { en: 'Enrollment', ar: 'التسجيل' },
  completion: { en: 'Completion', ar: 'الإنجاز' },
  deadline: { en: 'Deadline Reminder', ar: 'تذكير الموعد النهائي' },
  achievement: { en: 'Achievement', ar: 'الإنجاز' },
  announcement: { en: 'Announcement', ar: 'إعلان' },
};

export const TEMPLATE_VARIABLES: Record<NotificationType, TemplateVariable[]> = {
  enrollment: [
    { key: 'learner_name', label: 'Learner Name', labelAr: 'اسم المتعلم', example: 'Ahmed' },
    { key: 'course_title', label: 'Course Title', labelAr: 'عنوان الدورة', example: 'Project Management 101' },
    { key: 'enrollment_date', label: 'Enrollment Date', labelAr: 'تاريخ التسجيل', example: '2026-02-24' },
    { key: 'org_name', label: 'Organization', labelAr: 'المنظمة', example: 'Acme Corp' },
  ],
  completion: [
    { key: 'learner_name', label: 'Learner Name', labelAr: 'اسم المتعلم', example: 'Ahmed' },
    { key: 'course_title', label: 'Course Title', labelAr: 'عنوان الدورة', example: 'Project Management 101' },
    { key: 'completion_date', label: 'Completion Date', labelAr: 'تاريخ الإنجاز', example: '2026-02-24' },
    { key: 'score', label: 'Final Score', labelAr: 'الدرجة النهائية', example: '92%' },
    { key: 'org_name', label: 'Organization', labelAr: 'المنظمة', example: 'Acme Corp' },
  ],
  deadline: [
    { key: 'learner_name', label: 'Learner Name', labelAr: 'اسم المتعلم', example: 'Ahmed' },
    { key: 'course_title', label: 'Course Title', labelAr: 'عنوان الدورة', example: 'Project Management 101' },
    { key: 'deadline_date', label: 'Deadline Date', labelAr: 'تاريخ الموعد النهائي', example: '2026-03-15' },
    { key: 'days_remaining', label: 'Days Remaining', labelAr: 'الأيام المتبقية', example: '3' },
    { key: 'org_name', label: 'Organization', labelAr: 'المنظمة', example: 'Acme Corp' },
  ],
  achievement: [
    { key: 'learner_name', label: 'Learner Name', labelAr: 'اسم المتعلم', example: 'Ahmed' },
    { key: 'badge_name', label: 'Badge Name', labelAr: 'اسم الشارة', example: 'Fast Learner' },
    { key: 'badge_description', label: 'Badge Description', labelAr: 'وصف الشارة', example: 'Completed 5 courses in a week' },
    { key: 'org_name', label: 'Organization', labelAr: 'المنظمة', example: 'Acme Corp' },
  ],
  announcement: [
    { key: 'learner_name', label: 'Learner Name', labelAr: 'اسم المتعلم', example: 'Ahmed' },
    { key: 'title', label: 'Title', labelAr: 'العنوان', example: 'System Maintenance' },
    { key: 'message', label: 'Message', labelAr: 'الرسالة', example: 'Scheduled downtime on Friday.' },
    { key: 'org_name', label: 'Organization', labelAr: 'المنظمة', example: 'Acme Corp' },
  ],
};

export const EMAIL_PROVIDER_LABELS: Record<EmailProvider, { en: string; ar: string }> = {
  smtp: { en: 'SMTP', ar: 'SMTP' },
  resend: { en: 'Resend', ar: 'Resend' },
  mailgun: { en: 'Mailgun', ar: 'Mailgun' },
};
