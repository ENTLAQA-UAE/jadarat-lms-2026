-- ============================================================================
-- Certificate System Phase 1: UUID verification, multi-template, status/expiry
-- ============================================================================

-- ==========  1. Certificate status enum  ==========
CREATE TYPE public.certificate_status AS ENUM ('active', 'expired', 'revoked');

-- ==========  2. Add UUID + status + expiration to user_certificates  ==========

ALTER TABLE public.user_certificates
  ADD COLUMN IF NOT EXISTS uuid TEXT,
  ADD COLUMN IF NOT EXISTS status public.certificate_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

-- Backfill existing rows with UUIDs
UPDATE public.user_certificates
SET uuid = gen_random_uuid()::text
WHERE uuid IS NULL;

-- Make uuid NOT NULL and unique after backfill
ALTER TABLE public.user_certificates
  ALTER COLUMN uuid SET NOT NULL,
  ALTER COLUMN uuid SET DEFAULT gen_random_uuid()::text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_uuid
  ON public.user_certificates (uuid);

-- ==========  3. Certificate templates table  ==========
CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id            SERIAL       PRIMARY KEY,
  organization_id INT        NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  name_ar       TEXT,
  template_json JSONB        NOT NULL,
  is_default    BOOLEAN      NOT NULL DEFAULT false,
  created_by    UUID         REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificate_templates_org
  ON public.certificate_templates (organization_id);

-- ==========  4. Per-course template assignment  ==========
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_id INT
    REFERENCES public.certificate_templates(id) ON DELETE SET NULL;

-- ==========  5. Add linkedin_company_id to organization_settings  ==========
ALTER TABLE public.organization_settings
  ADD COLUMN IF NOT EXISTS linkedin_company_id TEXT;

-- ==========  6. Updated RPC: insert_user_certificate (now returns uuid)  ==========
DROP FUNCTION IF EXISTS public.insert_user_certificate(text, int);
CREATE OR REPLACE FUNCTION public.insert_user_certificate(
  certificate_url text,
  course int,
  cert_expires_at timestamptz DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uuid TEXT;
BEGIN
  _uuid := gen_random_uuid()::text;

  INSERT INTO user_certificates (user_id, course_id, certificate, uuid, expires_at)
  VALUES (auth.uid(), course, certificate_url, _uuid, cert_expires_at)
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET certificate = EXCLUDED.certificate,
        updated_at = now()
  RETURNING uuid INTO _uuid;

  RETURN _uuid;
END;
$$;

-- ==========  7. New RPC: verify_certificate (public, no auth required)  ==========
CREATE OR REPLACE FUNCTION public.verify_certificate(cert_uuid text)
RETURNS TABLE (
  certificate_id   int,
  uuid             text,
  user_name        text,
  user_email       text,
  course_title     text,
  course_description text,
  organization_name text,
  org_logo         text,
  certificate_url  text,
  certificate_auth_title text,
  issued_at        timestamptz,
  expires_at       timestamptz,
  status           text,
  revocation_reason text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    uc.id AS certificate_id,
    uc.uuid,
    u.name AS user_name,
    u.email AS user_email,
    c.title AS course_title,
    c.description AS course_description,
    os.name AS organization_name,
    os.logo AS org_logo,
    uc.certificate AS certificate_url,
    os.certificate_auth_title,
    uc.created_at AS issued_at,
    uc.expires_at,
    CASE
      WHEN uc.status = 'revoked' THEN 'revoked'
      WHEN uc.expires_at IS NOT NULL AND uc.expires_at < now() THEN 'expired'
      ELSE 'active'
    END AS status,
    uc.revocation_reason
  FROM user_certificates uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  JOIN organization_settings os ON u.organization_id = os.organization_id
  WHERE uc.uuid = cert_uuid;
$$;

-- ==========  8. New RPC: get_certificate_templates  ==========
CREATE OR REPLACE FUNCTION public.get_certificate_templates()
RETURNS TABLE (
  id              int,
  organization_id int,
  name            text,
  name_ar         text,
  template_json   jsonb,
  is_default      boolean,
  created_by      uuid,
  updated_at      timestamptz,
  created_at      timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT ct.id, ct.organization_id, ct.name, ct.name_ar, ct.template_json,
         ct.is_default, ct.created_by, ct.updated_at, ct.created_at
  FROM certificate_templates ct
  JOIN users u ON u.id = auth.uid()
  WHERE ct.organization_id = u.organization_id
  ORDER BY ct.is_default DESC, ct.created_at DESC;
$$;

-- ==========  9. New RPC: upsert_certificate_template  ==========
CREATE OR REPLACE FUNCTION public.upsert_certificate_template(
  template_id     int DEFAULT NULL,
  template_name   text DEFAULT 'Untitled',
  template_name_ar text DEFAULT NULL,
  template_json   jsonb DEFAULT '{}'::jsonb,
  set_default     boolean DEFAULT false
)
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
  _result_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  -- If setting as default, unset all other defaults first
  IF set_default THEN
    UPDATE certificate_templates SET is_default = false
    WHERE organization_id = _org_id;
  END IF;

  IF template_id IS NOT NULL THEN
    UPDATE certificate_templates
    SET name = template_name,
        name_ar = template_name_ar,
        template_json = upsert_certificate_template.template_json,
        is_default = set_default,
        updated_at = now()
    WHERE id = template_id AND organization_id = _org_id
    RETURNING id INTO _result_id;
  ELSE
    INSERT INTO certificate_templates (organization_id, name, name_ar, template_json, is_default, created_by)
    VALUES (_org_id, template_name, template_name_ar, upsert_certificate_template.template_json, set_default, auth.uid())
    RETURNING id INTO _result_id;
  END IF;

  RETURN _result_id;
END;
$$;

-- ==========  10. New RPC: delete_certificate_template  ==========
CREATE OR REPLACE FUNCTION public.delete_certificate_template(template_id int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  -- Unset courses using this template
  UPDATE courses SET certificate_template_id = NULL
  WHERE certificate_template_id = template_id AND organization_id = _org_id;

  DELETE FROM certificate_templates
  WHERE id = template_id AND organization_id = _org_id;
END;
$$;

-- ==========  11. New RPC: revoke_certificate  ==========
CREATE OR REPLACE FUNCTION public.revoke_certificate(cert_uuid text, reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  UPDATE user_certificates uc
  SET status = 'revoked',
      revoked_at = now(),
      revocation_reason = reason,
      updated_at = now()
  FROM users u
  WHERE uc.user_id = u.id
    AND uc.uuid = cert_uuid
    AND u.organization_id = _org_id;
END;
$$;

-- ==========  12. Updated RPC: get_certificate_if_exists (now includes uuid)  ==========
DROP FUNCTION IF EXISTS public.get_certificate_if_exists(int);
CREATE OR REPLACE FUNCTION public.get_certificate_if_exists(course_id int)
RETURNS TABLE (
  certificate text,
  course_id   int,
  created_at  timestamptz,
  id          int,
  updated_at  timestamptz,
  user_id     uuid,
  uuid        text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.certificate, uc.course_id, uc.created_at, uc.id, uc.updated_at, uc.user_id, uc.uuid
  FROM user_certificates uc
  WHERE uc.user_id = auth.uid() AND uc.course_id = get_certificate_if_exists.course_id;
$$;

-- ==========  13. Updated RPC: get_user_certificates (now includes uuid + status)  ==========
DROP FUNCTION IF EXISTS public.get_user_certificates();
CREATE OR REPLACE FUNCTION public.get_user_certificates()
RETURNS TABLE (
  id          int,
  created_at  timestamptz,
  user_id     uuid,
  course_id   int,
  certificate text,
  updated_at  timestamptz,
  uuid        text,
  status      text,
  expires_at  timestamptz,
  title       text,
  description text,
  level       text,
  category    text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.id, uc.created_at, uc.user_id, uc.course_id, uc.certificate,
         uc.updated_at, uc.uuid,
         CASE
           WHEN uc.status = 'revoked' THEN 'revoked'
           WHEN uc.expires_at IS NOT NULL AND uc.expires_at < now() THEN 'expired'
           ELSE 'active'
         END AS status,
         uc.expires_at,
         c.title, c.description, c.level::text,
         cat.name AS category
  FROM user_certificates uc
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE uc.user_id = auth.uid()
  ORDER BY uc.created_at DESC;
$$;

-- ==========  14. Migrate existing org template to certificate_templates  ==========
-- Migrate any existing certificate_template_json from organization_settings
-- into the new certificate_templates table as the default template
INSERT INTO certificate_templates (organization_id, name, name_ar, template_json, is_default)
SELECT
  os.organization_id,
  'Default Template',
  'القالب الافتراضي',
  os.certificate_template_json,
  true
FROM organization_settings os
WHERE os.certificate_template_json IS NOT NULL
ON CONFLICT DO NOTHING;
