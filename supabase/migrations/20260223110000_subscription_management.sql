-- ==========================================================================
--  SUBSCRIPTION MANAGEMENT — super-admin lifecycle controls
-- ==========================================================================

-- 1. Convert start_date & expires_at from TEXT to TIMESTAMPTZ
--    Existing data may use locale-dependent formats (e.g. "22/02/2026 ..."),
--    so we set datestyle to handle DD/MM/YYYY before the cast.
SET datestyle = 'ISO, DMY';

ALTER TABLE public.subscriptions
  ALTER COLUMN start_date  TYPE timestamptz USING start_date::timestamptz,
  ALTER COLUMN expires_at  TYPE timestamptz USING expires_at::timestamptz;

RESET datestyle;

-- 2. Add is_active flag (existing rows default to true)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 3. Add status tracking to subscription_requests
ALTER TABLE public.subscription_requests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
-- valid values: 'pending', 'approved', 'dismissed'

-- ==========================================================================
--  UPDATED RPCs
-- ==========================================================================

-- 4. get_all_organization — add start_date, is_active; fix expiration_date type
CREATE OR REPLACE FUNCTION public.get_all_organization()
RETURNS TABLE (
  id                          int,
  name                        text,
  domain                      text,
  logo_url                    text,
  subscription_package        text,
  total_users                 bigint,
  allowed_users               int,
  total_courses               bigint,
  allowed_courses             int,
  total_content_creators      bigint,
  allowed_content_creators    int,
  subscription_expiration_date timestamptz,
  subscription_start_date     timestamptz,
  subscription_is_active      boolean,
  create_courses              boolean,
  ai_builder                  boolean,
  document_builder            boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.id, os.name, o.domain, os.logo AS logo_url,
         COALESCE(st.tier_name, 'None') AS subscription_package,
         (SELECT count(*) FROM users u WHERE u.organization_id = o.id) AS total_users,
         COALESCE(st.max_user, 0) AS allowed_users,
         (SELECT count(*) FROM courses c WHERE c.organization_id = o.id) AS total_courses,
         COALESCE(st.max_courses, 0) AS allowed_courses,
         (SELECT count(*) FROM users u WHERE u.organization_id = o.id AND u.role IN ('LMSAdmin','learningManager')) AS total_content_creators,
         COALESCE(st.max_lms_managers, 0) AS allowed_content_creators,
         s.expires_at  AS subscription_expiration_date,
         s.start_date  AS subscription_start_date,
         COALESCE(s.is_active, true) AS subscription_is_active,
         os.create_courses, os.ai_builder, os.document_builder
  FROM organization o
  JOIN organization_settings os ON o.id = os.organization_id
  LEFT JOIN subscriptions s ON s.organization_id = o.id
  LEFT JOIN subscription_tiers st ON s.subscription_tier = st.id
  ORDER BY o.created_at DESC;
$$;

-- 5. create_new_organization — accept start/end dates
CREATE OR REPLACE FUNCTION public.create_new_organization(
  org_domain               text,
  org_name                 text,
  org_sub_tier_name        text,
  org_create_courses       boolean DEFAULT true,
  org_ai_builder           boolean DEFAULT false,
  org_ai_documents_builder boolean DEFAULT false,
  p_start_date             timestamptz DEFAULT now(),
  p_expires_at             timestamptz DEFAULT (now() + interval '1 year')
)
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id  int;
  _tier_id int;
BEGIN
  INSERT INTO organization (domain) VALUES (org_domain) RETURNING id INTO _org_id;

  INSERT INTO organization_settings (
    organization_id, name, create_courses, ai_builder, document_builder,
    registeration_enabled, registeration_require_approval, registeration_require_specific_domain,
    course_expiration_enabled, course_self_entrollment_policy
  ) VALUES (
    _org_id, org_name, org_create_courses, org_ai_builder, org_ai_documents_builder,
    false, false, false, false, 'lms'
  );

  SELECT id INTO _tier_id FROM subscription_tiers WHERE tier_name = org_sub_tier_name LIMIT 1;
  IF _tier_id IS NOT NULL THEN
    INSERT INTO subscriptions (organization_id, subscription_tier, start_date, expires_at)
    VALUES (_org_id, _tier_id, p_start_date, p_expires_at);
  END IF;

  RETURN _org_id;
END;
$$;

-- 6. get_organization_subscription — return is_active for org-admin Redux
CREATE OR REPLACE FUNCTION public.get_organization_subscription()
RETURNS TABLE (
  id                int,
  created_at        timestamptz,
  expires_at        timestamptz,
  organization_id   int,
  subscription_tier int,
  start_date        timestamptz,
  tier_name         text,
  max_user          int,
  max_courses       int,
  max_lms_managers  int,
  is_active         boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id, s.created_at, s.expires_at, s.organization_id,
         s.subscription_tier, s.start_date,
         st.tier_name, st.max_user, st.max_courses, st.max_lms_managers,
         s.is_active
  FROM subscriptions s
  JOIN subscription_tiers st ON s.subscription_tier = st.id
  WHERE s.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

-- ==========================================================================
--  NEW RPCs
-- ==========================================================================

-- 7. get_organization_subscription_details — for the super-admin sheet
CREATE OR REPLACE FUNCTION public.get_organization_subscription_details(p_org_id int)
RETURNS TABLE (
  subscription_id   int,
  tier_id           int,
  tier_name         text,
  start_date        timestamptz,
  expires_at        timestamptz,
  is_active         boolean,
  max_user          int,
  max_courses       int,
  max_lms_managers  int,
  create_courses    boolean,
  ai_builder        boolean,
  document_builder  boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id AS subscription_id, st.id AS tier_id, st.tier_name,
         s.start_date, s.expires_at, s.is_active,
         st.max_user, st.max_courses, st.max_lms_managers,
         os.create_courses, os.ai_builder, os.document_builder
  FROM subscriptions s
  JOIN subscription_tiers st ON s.subscription_tier = st.id
  JOIN organization_settings os ON os.organization_id = s.organization_id
  WHERE s.organization_id = p_org_id
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

-- 8. update_organization_subscription — create or update subscription
CREATE OR REPLACE FUNCTION public.update_organization_subscription(
  p_org_id      int,
  p_tier_id     int,
  p_start_date  timestamptz,
  p_expires_at  timestamptz,
  p_is_active   boolean
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM subscriptions WHERE organization_id = p_org_id) THEN
    UPDATE subscriptions SET
      subscription_tier = p_tier_id,
      start_date        = p_start_date,
      expires_at        = p_expires_at,
      is_active         = p_is_active
    WHERE organization_id = p_org_id;
  ELSE
    INSERT INTO subscriptions (organization_id, subscription_tier, start_date, expires_at, is_active)
    VALUES (p_org_id, p_tier_id, p_start_date, p_expires_at, p_is_active);
  END IF;
END;
$$;

-- 9. get_pending_subscription_requests — for super-admin review
CREATE OR REPLACE FUNCTION public.get_pending_subscription_requests(p_org_id int)
RETURNS TABLE (
  id                         int,
  organization_id            int,
  requester_id               uuid,
  number_of_users            int,
  number_of_courses          int,
  number_of_content_creators int,
  created_at                 timestamptz,
  status                     text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT sr.id, sr.organization_id, sr.requester_id,
         sr.number_of_users, sr.number_of_courses, sr.number_of_content_creators,
         sr.created_at, sr.status
  FROM subscription_requests sr
  WHERE sr.organization_id = p_org_id AND sr.status = 'pending'
  ORDER BY sr.created_at DESC;
$$;

-- 10. resolve_subscription_request — approve or dismiss
CREATE OR REPLACE FUNCTION public.resolve_subscription_request(
  p_request_id int,
  p_status     text  -- 'approved' or 'dismissed'
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE subscription_requests SET status = p_status WHERE id = p_request_id;
END;
$$;
