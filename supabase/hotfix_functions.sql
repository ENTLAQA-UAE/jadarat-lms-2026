-- ==========================================================================
--  HOTFIX: Run this against an EXISTING database to fix function issues.
--  This does NOT create tables or policies (they already exist).
-- ==========================================================================

-- 1. Fix ambiguous get_all_courses overload
DROP FUNCTION IF EXISTS public.get_all_courses(text, text);

CREATE OR REPLACE FUNCTION public.get_all_courses(
  _name_filter     text DEFAULT NULL,
  _category_filter text DEFAULT NULL,
  _status_filter   text DEFAULT NULL
)
RETURNS TABLE (
  id              int,
  name            text,
  category        text,
  category_image  text,
  created_at      timestamptz,
  created_by_name text,
  enrollments     bigint,
  completions     bigint,
  status          text,
  thumbnail       text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title AS name, cat.name AS category, cat.image AS category_image,
         c.created_at,
         COALESCE(u.name, '') AS created_by_name,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id) AS enrollments,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id AND uc.status = 'completed') AS completions,
         COALESCE(c.status, 'draft') AS status, c.thumbnail
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN users u ON c.created_by = u.id
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name_filter IS NULL OR c.title ILIKE '%' || _name_filter || '%')
    AND (_category_filter IS NULL OR cat.name ILIKE '%' || _category_filter || '%')
    AND (_status_filter IS NULL OR COALESCE(c.status, 'draft') = _status_filter)
  ORDER BY c.created_at DESC;
$$;

-- 2. Fix ambiguous get_enrollment_activity overload
DROP FUNCTION IF EXISTS public.get_enrollment_activity(text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.get_enrollment_activity(
  _name              text DEFAULT NULL,
  _course            text DEFAULT NULL,
  _department        text DEFAULT NULL,
  _group_name        text DEFAULT NULL,
  _start_date        text DEFAULT NULL,
  _end_date          text DEFAULT NULL,
  _enrollment_status text DEFAULT NULL
)
RETURNS TABLE (
  enrollment_id       int,
  user_id             uuid,
  name                text,
  course              text,
  thumbnail           text,
  enrollment_date     timestamptz,
  progress_percentage numeric,
  completion_date     timestamptz,
  course_id           int,
  email               text,
  department          text,
  group_name          text,
  enrollment_status   text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.id AS enrollment_id, u.id AS user_id, u.name,
         c.title AS course, c.thumbnail,
         uc.created_at AS enrollment_date,
         uc.progress::numeric AS progress_percentage,
         uc.completed_at AS completion_date,
         c.id AS course_id, u.email, u.department,
         g.name AS group_name,
         CASE
           WHEN uc.status = 'completed' OR uc.progress::numeric >= 100 THEN 'completed'
           WHEN uc.status = 'failed' THEN 'failed'
           WHEN uc.status = 'expired' THEN 'expired'
           WHEN uc.status = 'overdue' THEN 'overdue'
           WHEN uc.progress::numeric > 0 THEN 'in_progress'
           ELSE 'not_started'
         END AS enrollment_status
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name IS NULL OR u.name ILIKE '%' || _name || '%')
    AND (_course IS NULL OR c.title ILIKE '%' || _course || '%')
    AND (_department IS NULL OR u.department ILIKE '%' || _department || '%')
    AND (_group_name IS NULL OR g.name ILIKE '%' || _group_name || '%')
    AND (_start_date IS NULL OR uc.created_at >= _start_date::timestamptz)
    AND (_end_date IS NULL OR uc.created_at <= _end_date::timestamptz)
    AND (_enrollment_status IS NULL OR
      CASE
        WHEN uc.status = 'completed' OR uc.progress::numeric >= 100 THEN 'completed'
        WHEN uc.status = 'failed' THEN 'failed'
        WHEN uc.status = 'expired' THEN 'expired'
        WHEN uc.status = 'overdue' THEN 'overdue'
        WHEN uc.progress::numeric > 0 THEN 'in_progress'
        ELSE 'not_started'
      END = _enrollment_status
    )
  ORDER BY uc.created_at DESC;
$$;

-- 3. Fix subscription management functions (changed return types)
DROP FUNCTION IF EXISTS public.get_all_organization();
DROP FUNCTION IF EXISTS public.create_new_organization(text, text, text, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS public.get_organization_subscription();

-- Convert subscription columns if still TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'start_date' AND data_type = 'text'
  ) THEN
    SET datestyle = 'ISO, DMY';
    ALTER TABLE public.subscriptions
      ALTER COLUMN start_date TYPE timestamptz USING start_date::timestamptz,
      ALTER COLUMN expires_at TYPE timestamptz USING expires_at::timestamptz;
    RESET datestyle;
  END IF;
END $$;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.subscription_requests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

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

-- New RPCs (safe to CREATE OR REPLACE)
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

CREATE OR REPLACE FUNCTION public.resolve_subscription_request(
  p_request_id int,
  p_status     text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE subscription_requests SET status = p_status WHERE id = p_request_id;
END;
$$;
