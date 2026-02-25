-- ============================================================================
-- Jadarat LMS – In-App Notification System
-- ============================================================================
-- Adds per-org notification infrastructure:
--   • notifications table (in-app + email records)
--   • notification_trigger_settings (LMS Admin controls per-type behavior)
--   • notification_email_templates (LMS Admin customizable email templates)
--   • organization_email_config (Org Admin SMTP/Resend/Mailgun setup)
--   • notification_preferences (per-user opt-in/out)
--   • RLS policies, RPCs, and default seed data
-- ============================================================================

-- ==========  ENUMS  ==========

CREATE TYPE public.notification_type AS ENUM (
  'enrollment',
  'completion',
  'deadline',
  'achievement',
  'announcement'
);

CREATE TYPE public.email_provider AS ENUM (
  'smtp',
  'resend',
  'mailgun'
);

-- ==========  TABLES  ==========

-- ----------  1. organization_email_config  ----------
-- Org Admin configures email delivery infrastructure here.
CREATE TABLE public.organization_email_config (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  provider          public.email_provider NOT NULL DEFAULT 'resend',
  from_email        TEXT           NOT NULL DEFAULT 'noreply@example.com',
  from_name         TEXT           NOT NULL DEFAULT 'LMS Notifications',
  config_encrypted  TEXT,          -- AES-256-GCM encrypted JSON (provider-specific credentials)
  is_verified       BOOLEAN        NOT NULL DEFAULT false,
  is_active         BOOLEAN        NOT NULL DEFAULT false,
  last_tested_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),

  UNIQUE (organization_id)
);

-- ----------  2. notification_trigger_settings  ----------
-- LMS Admin controls which notification types fire and delivery channels.
CREATE TABLE public.notification_trigger_settings (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  is_active         BOOLEAN        NOT NULL DEFAULT true,
  in_app_enabled    BOOLEAN        NOT NULL DEFAULT true,
  email_enabled     BOOLEAN        NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),

  UNIQUE (organization_id, notification_type)
);

-- ----------  3. notification_email_templates  ----------
-- LMS Admin customizes email subject + body with {{variables}}.
CREATE TABLE public.notification_email_templates (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  notification_type public.notification_type NOT NULL,
  subject           TEXT           NOT NULL DEFAULT '',
  body_html         TEXT           NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),

  UNIQUE (organization_id, notification_type)
);

-- ----------  4. notifications  ----------
-- The actual notification records delivered to users.
CREATE TABLE public.notifications (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  recipient_id      UUID           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type              public.notification_type NOT NULL,
  title             TEXT           NOT NULL,
  body              TEXT           NOT NULL DEFAULT '',
  metadata          JSONB          NOT NULL DEFAULT '{}',
  is_read           BOOLEAN        NOT NULL DEFAULT false,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_org ON public.notifications(organization_id, created_at DESC);

-- ----------  5. notification_preferences  ----------
-- Per-user opt-in/out for each notification type.
CREATE TABLE public.notification_preferences (
  id                    SERIAL     PRIMARY KEY,
  user_id               UUID       NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  in_app_enabled        BOOLEAN    NOT NULL DEFAULT true,
  email_enabled         BOOLEAN    NOT NULL DEFAULT true,
  enrollment_notify     BOOLEAN    NOT NULL DEFAULT true,
  completion_notify     BOOLEAN    NOT NULL DEFAULT true,
  deadline_notify       BOOLEAN    NOT NULL DEFAULT true,
  achievement_notify    BOOLEAN    NOT NULL DEFAULT true,
  announcement_notify   BOOLEAN    NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id)
);

-- ==========  ENABLE REALTIME  ==========

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ==========  RLS POLICIES  ==========

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_trigger_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_email_templates ENABLE ROW LEVEL SECURITY;

-- notifications: users see/update/delete only their own
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- notification_preferences: users manage their own
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can upsert own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- organization_email_config: org admins manage via RPC (SECURITY DEFINER)
-- Direct access for org admins to read their own config
CREATE POLICY "Org admins can view own email config"
  ON public.organization_email_config FOR SELECT
  USING (
    organization_id IN (
      SELECT u.organization_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('organizationAdmin', 'superAdmin')
    )
  );

-- notification_trigger_settings: LMS admins manage
CREATE POLICY "LMS/Org admins can view trigger settings"
  ON public.notification_trigger_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT u.organization_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin')
    )
  );

-- notification_email_templates: LMS admins manage
CREATE POLICY "LMS/Org admins can view email templates"
  ON public.notification_email_templates FOR SELECT
  USING (
    organization_id IN (
      SELECT u.organization_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin')
    )
  );

-- ==========  RPC FUNCTIONS  ==========

-- ----------  Get notifications (paginated)  ----------
CREATE OR REPLACE FUNCTION public.get_notifications(
  p_limit  INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id              INT,
  organization_id INT,
  type            public.notification_type,
  title           TEXT,
  body            TEXT,
  metadata        JSONB,
  is_read         BOOLEAN,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    n.id, n.organization_id, n.type, n.title, n.body,
    n.metadata, n.is_read, n.read_at, n.created_at
  FROM public.notifications n
  WHERE n.recipient_id = auth.uid()
  ORDER BY n.created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- ----------  Get unread count  ----------
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::INT, 0)
  FROM public.notifications
  WHERE recipient_id = auth.uid() AND is_read = false;
$$;

-- ----------  Mark one notification as read  ----------
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_id INT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = p_id AND recipient_id = auth.uid();
END;
$$;

-- ----------  Mark all notifications as read  ----------
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE recipient_id = auth.uid() AND is_read = false;
END;
$$;

-- ----------  Delete a notification  ----------
CREATE OR REPLACE FUNCTION public.delete_notification(p_id INT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE id = p_id AND recipient_id = auth.uid();
END;
$$;

-- ----------  Send notification (internal, used by triggers)  ----------
CREATE OR REPLACE FUNCTION public.send_notification(
  p_organization_id INT,
  p_recipient_id    UUID,
  p_type            public.notification_type,
  p_title           TEXT,
  p_body            TEXT DEFAULT '',
  p_metadata        JSONB DEFAULT '{}'
)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trigger   RECORD;
  v_user_pref RECORD;
  v_notify_col TEXT;
  v_new_id    INT;
BEGIN
  -- 1. Check org trigger settings
  SELECT * INTO v_trigger
  FROM public.notification_trigger_settings
  WHERE organization_id = p_organization_id
    AND notification_type = p_type;

  -- If no settings row, default to in-app only
  IF NOT FOUND THEN
    INSERT INTO public.notifications (organization_id, recipient_id, type, title, body, metadata)
    VALUES (p_organization_id, p_recipient_id, p_type, p_title, p_body, p_metadata)
    RETURNING id INTO v_new_id;
    RETURN v_new_id;
  END IF;

  -- If trigger is not active, skip entirely
  IF NOT v_trigger.is_active THEN
    RETURN NULL;
  END IF;

  -- 2. Check user preferences
  SELECT * INTO v_user_pref
  FROM public.notification_preferences
  WHERE user_id = p_recipient_id;

  -- Build the column name for the type-specific preference
  v_notify_col := p_type::TEXT || '_notify';

  -- 3. Insert in-app notification if enabled
  IF v_trigger.in_app_enabled THEN
    -- Check user pref (default true if no pref row)
    IF NOT FOUND OR (v_user_pref.in_app_enabled AND
       CASE p_type
         WHEN 'enrollment' THEN COALESCE(v_user_pref.enrollment_notify, true)
         WHEN 'completion' THEN COALESCE(v_user_pref.completion_notify, true)
         WHEN 'deadline' THEN COALESCE(v_user_pref.deadline_notify, true)
         WHEN 'achievement' THEN COALESCE(v_user_pref.achievement_notify, true)
         WHEN 'announcement' THEN COALESCE(v_user_pref.announcement_notify, true)
         ELSE true
       END
    ) THEN
      INSERT INTO public.notifications (organization_id, recipient_id, type, title, body, metadata)
      VALUES (p_organization_id, p_recipient_id, p_type, p_title, p_body, p_metadata)
      RETURNING id INTO v_new_id;
    END IF;
  END IF;

  -- Email delivery is handled at the application layer (API route)
  -- because it needs to decrypt credentials and call external APIs.

  RETURN v_new_id;
END;
$$;

-- ----------  Send bulk notification (announcements)  ----------
CREATE OR REPLACE FUNCTION public.send_bulk_notification(
  p_organization_id INT,
  p_type            public.notification_type,
  p_title           TEXT,
  p_body            TEXT DEFAULT '',
  p_metadata        JSONB DEFAULT '{}'
)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_count INT := 0;
BEGIN
  -- Verify caller is LMSAdmin or orgAdmin
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND organization_id = p_organization_id
      AND role IN ('LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  -- Send to all active users in the organization
  FOR v_user IN
    SELECT id FROM public.users
    WHERE organization_id = p_organization_id
      AND is_active = true
      AND role = 'learner'
  LOOP
    PERFORM public.send_notification(
      p_organization_id, v_user.id, p_type, p_title, p_body, p_metadata
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ----------  Get/update notification preferences  ----------
CREATE OR REPLACE FUNCTION public.get_notification_preferences()
RETURNS TABLE (
  in_app_enabled      BOOLEAN,
  email_enabled       BOOLEAN,
  enrollment_notify   BOOLEAN,
  completion_notify   BOOLEAN,
  deadline_notify     BOOLEAN,
  achievement_notify  BOOLEAN,
  announcement_notify BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(np.in_app_enabled, true),
    COALESCE(np.email_enabled, true),
    COALESCE(np.enrollment_notify, true),
    COALESCE(np.completion_notify, true),
    COALESCE(np.deadline_notify, true),
    COALESCE(np.achievement_notify, true),
    COALESCE(np.announcement_notify, true)
  FROM public.notification_preferences np
  WHERE np.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.update_notification_preferences(
  p_in_app_enabled      BOOLEAN DEFAULT true,
  p_email_enabled       BOOLEAN DEFAULT true,
  p_enrollment_notify   BOOLEAN DEFAULT true,
  p_completion_notify   BOOLEAN DEFAULT true,
  p_deadline_notify     BOOLEAN DEFAULT true,
  p_achievement_notify  BOOLEAN DEFAULT true,
  p_announcement_notify BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (
    user_id, in_app_enabled, email_enabled,
    enrollment_notify, completion_notify, deadline_notify,
    achievement_notify, announcement_notify, updated_at
  ) VALUES (
    auth.uid(), p_in_app_enabled, p_email_enabled,
    p_enrollment_notify, p_completion_notify, p_deadline_notify,
    p_achievement_notify, p_announcement_notify, now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    in_app_enabled = EXCLUDED.in_app_enabled,
    email_enabled = EXCLUDED.email_enabled,
    enrollment_notify = EXCLUDED.enrollment_notify,
    completion_notify = EXCLUDED.completion_notify,
    deadline_notify = EXCLUDED.deadline_notify,
    achievement_notify = EXCLUDED.achievement_notify,
    announcement_notify = EXCLUDED.announcement_notify,
    updated_at = now();
END;
$$;

-- ----------  Get trigger settings for org  ----------
CREATE OR REPLACE FUNCTION public.get_notification_trigger_settings()
RETURNS TABLE (
  id                INT,
  notification_type public.notification_type,
  is_active         BOOLEAN,
  in_app_enabled    BOOLEAN,
  email_enabled     BOOLEAN
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u WHERE u.id = auth.uid();

  RETURN QUERY
  SELECT
    ts.id, ts.notification_type, ts.is_active,
    ts.in_app_enabled, ts.email_enabled
  FROM public.notification_trigger_settings ts
  WHERE ts.organization_id = v_org_id
  ORDER BY ts.notification_type;
END;
$$;

-- ----------  Update trigger settings  ----------
CREATE OR REPLACE FUNCTION public.update_notification_trigger_setting(
  p_notification_type public.notification_type,
  p_is_active         BOOLEAN,
  p_in_app_enabled    BOOLEAN,
  p_email_enabled     BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u
  WHERE u.id = auth.uid()
    AND u.role IN ('LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO public.notification_trigger_settings (
    organization_id, notification_type, is_active, in_app_enabled, email_enabled, updated_at
  ) VALUES (
    v_org_id, p_notification_type, p_is_active, p_in_app_enabled, p_email_enabled, now()
  )
  ON CONFLICT (organization_id, notification_type) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    in_app_enabled = EXCLUDED.in_app_enabled,
    email_enabled = EXCLUDED.email_enabled,
    updated_at = now();
END;
$$;

-- ----------  Get email templates for org  ----------
CREATE OR REPLACE FUNCTION public.get_notification_email_templates()
RETURNS TABLE (
  id                INT,
  notification_type public.notification_type,
  subject           TEXT,
  body_html         TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u WHERE u.id = auth.uid();

  RETURN QUERY
  SELECT
    t.id, t.notification_type, t.subject, t.body_html
  FROM public.notification_email_templates t
  WHERE t.organization_id = v_org_id
  ORDER BY t.notification_type;
END;
$$;

-- ----------  Update email template  ----------
CREATE OR REPLACE FUNCTION public.update_notification_email_template(
  p_notification_type public.notification_type,
  p_subject           TEXT,
  p_body_html         TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u
  WHERE u.id = auth.uid()
    AND u.role IN ('LMSAdmin', 'learningManager', 'organizationAdmin', 'superAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO public.notification_email_templates (
    organization_id, notification_type, subject, body_html, updated_at
  ) VALUES (
    v_org_id, p_notification_type, p_subject, p_body_html, now()
  )
  ON CONFLICT (organization_id, notification_type) DO UPDATE SET
    subject = EXCLUDED.subject,
    body_html = EXCLUDED.body_html,
    updated_at = now();
END;
$$;

-- ----------  Get org email config (for org admin)  ----------
CREATE OR REPLACE FUNCTION public.get_organization_email_config()
RETURNS TABLE (
  id              INT,
  provider        public.email_provider,
  from_email      TEXT,
  from_name       TEXT,
  is_verified     BOOLEAN,
  is_active       BOOLEAN,
  last_tested_at  TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u
  WHERE u.id = auth.uid()
    AND u.role IN ('organizationAdmin', 'superAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT
    ec.id, ec.provider, ec.from_email, ec.from_name,
    ec.is_verified, ec.is_active, ec.last_tested_at
  FROM public.organization_email_config ec
  WHERE ec.organization_id = v_org_id;
END;
$$;

-- ----------  Upsert org email config (credentials handled in API route)  ----------
CREATE OR REPLACE FUNCTION public.upsert_organization_email_config(
  p_provider        public.email_provider,
  p_from_email      TEXT,
  p_from_name       TEXT,
  p_config_encrypted TEXT DEFAULT NULL,
  p_is_active       BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id INT;
BEGIN
  SELECT u.organization_id INTO v_org_id
  FROM public.users u
  WHERE u.id = auth.uid()
    AND u.role IN ('organizationAdmin', 'superAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO public.organization_email_config (
    organization_id, provider, from_email, from_name,
    config_encrypted, is_active, updated_at
  ) VALUES (
    v_org_id, p_provider, p_from_email, p_from_name,
    p_config_encrypted, p_is_active, now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    provider = EXCLUDED.provider,
    from_email = EXCLUDED.from_email,
    from_name = EXCLUDED.from_name,
    config_encrypted = CASE
      WHEN EXCLUDED.config_encrypted IS NOT NULL THEN EXCLUDED.config_encrypted
      ELSE organization_email_config.config_encrypted
    END,
    is_active = EXCLUDED.is_active,
    is_verified = CASE
      WHEN EXCLUDED.config_encrypted IS NOT NULL THEN false
      ELSE organization_email_config.is_verified
    END,
    updated_at = now();
END;
$$;

-- ----------  Seed default trigger settings for an org  ----------
CREATE OR REPLACE FUNCTION public.seed_notification_defaults(p_organization_id INT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Seed trigger settings
  INSERT INTO public.notification_trigger_settings (organization_id, notification_type, is_active, in_app_enabled, email_enabled)
  VALUES
    (p_organization_id, 'enrollment',   true, true, false),
    (p_organization_id, 'completion',   true, true, false),
    (p_organization_id, 'deadline',     true, true, false),
    (p_organization_id, 'achievement',  true, true, false),
    (p_organization_id, 'announcement', true, true, false)
  ON CONFLICT (organization_id, notification_type) DO NOTHING;

  -- Seed default email templates
  INSERT INTO public.notification_email_templates (organization_id, notification_type, subject, body_html)
  VALUES
    (p_organization_id, 'enrollment',
     'Welcome to {{course_title}}!',
     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#1a1a1a">Hello {{learner_name}},</h1><p style="font-size:16px;color:#333">You have been enrolled in <strong>{{course_title}}</strong>.</p><p style="font-size:16px;color:#333">Start your learning journey today!</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="font-size:12px;color:#999">{{org_name}}</p></div>'),

    (p_organization_id, 'completion',
     'Congratulations! You completed {{course_title}}',
     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#1a1a1a">Well done, {{learner_name}}!</h1><p style="font-size:16px;color:#333">You have successfully completed <strong>{{course_title}}</strong>.</p><p style="font-size:16px;color:#333">Your final score: <strong>{{score}}</strong></p><hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="font-size:12px;color:#999">{{org_name}}</p></div>'),

    (p_organization_id, 'deadline',
     'Reminder: {{course_title}} expires in {{days_remaining}} days',
     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#1a1a1a">Hi {{learner_name}},</h1><p style="font-size:16px;color:#333">Your course <strong>{{course_title}}</strong> expires on <strong>{{deadline_date}}</strong> ({{days_remaining}} days remaining).</p><p style="font-size:16px;color:#333">Don''t forget to complete it!</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="font-size:12px;color:#999">{{org_name}}</p></div>'),

    (p_organization_id, 'achievement',
     'You earned the {{badge_name}} badge!',
     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#1a1a1a">Congratulations, {{learner_name}}!</h1><p style="font-size:16px;color:#333">You just earned the <strong>{{badge_name}}</strong> badge.</p><p style="font-size:16px;color:#333">{{badge_description}}</p><hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="font-size:12px;color:#999">{{org_name}}</p></div>'),

    (p_organization_id, 'announcement',
     '{{title}}',
     '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h1 style="color:#1a1a1a">{{title}}</h1><p style="font-size:16px;color:#333">Hello {{learner_name}},</p><div style="font-size:16px;color:#333">{{message}}</div><hr style="border:none;border-top:1px solid #eee;margin:20px 0"/><p style="font-size:12px;color:#999">{{org_name}}</p></div>')
  ON CONFLICT (organization_id, notification_type) DO NOTHING;
END;
$$;

-- ==========  SEED DEFAULTS FOR EXISTING ORGS  ==========
-- Run seed_notification_defaults for every existing organization.
DO $$
DECLARE
  v_org RECORD;
BEGIN
  FOR v_org IN SELECT id FROM public.organization LOOP
    PERFORM public.seed_notification_defaults(v_org.id);
  END LOOP;
END;
$$;
