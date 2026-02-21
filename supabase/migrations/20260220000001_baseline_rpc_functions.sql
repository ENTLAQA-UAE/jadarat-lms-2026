-- ============================================================================
-- Jadarat LMS - Baseline Migration: RPC Functions
-- ============================================================================
-- All functions use SECURITY DEFINER + search_path = public for RLS bypass.
-- Functions scope data by organization_id derived from auth.uid().
-- courses.category_id is a normalized FK (INT → categories.id).
-- ============================================================================

-- ==========================================================================
--  SECTION 1: AUTH & USER FUNCTIONS
-- ==========================================================================

-- 1. get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;

-- 2. get_user_details
CREATE OR REPLACE FUNCTION public.get_user_details()
RETURNS TABLE (
  created_at     timestamptz,
  organization_id int,
  organization_domain text,
  id             uuid,
  email          text,
  role           public.roles,
  is_active      boolean,
  name           text,
  group_id       int,
  department     text,
  job_title      text,
  job_grade      text,
  country        text,
  city           text,
  lang           text,
  avatar_url     text,
  group_name     text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.created_at, u.organization_id, u.organization_domain, u.id, u.email,
         u.role, u.is_active, u.name, u.group_id, u.department, u.job_title,
         u.job_grade, u.country, u.city, u.lang, u.avatar_url,
         g.name AS group_name
  FROM users u
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE u.id = auth.uid();
$$;

-- 3. add_user
CREATE OR REPLACE FUNCTION public.add_user(
  user_id         text,
  user_email      text,
  user_role       text,
  status          boolean,
  user_name       text,
  user_group_id   int,
  user_department  text,
  user_job_title   text,
  user_job_grade   text,
  user_country     text,
  user_city        text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id  int;
  _org_dom text;
BEGIN
  SELECT organization_id, organization_domain
    INTO _org_id, _org_dom
    FROM users WHERE id = auth.uid();

  INSERT INTO users (id, email, name, role, is_active, organization_id, organization_domain,
                     group_id, department, job_title, job_grade, country, city)
  VALUES (user_id::uuid, user_email, user_name, user_role::public.roles, status,
          _org_id, _org_dom,
          NULLIF(user_group_id, 0), NULLIF(user_department,''), NULLIF(user_job_title,''),
          NULLIF(user_job_grade,''), NULLIF(user_country,''), NULLIF(user_city,''));
END;
$$;

-- 4. update_user_details
CREATE OR REPLACE FUNCTION public.update_user_details(
  user_id          text,
  new_name         text,
  new_role         text,
  new_status       boolean,
  new_department   text,
  new_job_title    text,
  new_job_grade    text,
  new_country      text,
  new_city         text,
  new_group_id     int
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE users SET
    name       = new_name,
    role       = new_role::public.roles,
    is_active  = new_status,
    department = NULLIF(new_department,''),
    job_title  = NULLIF(new_job_title,''),
    job_grade  = NULLIF(new_job_grade,''),
    country    = NULLIF(new_country,''),
    city       = NULLIF(new_city,''),
    group_id   = NULLIF(new_group_id, 0)
  WHERE id = user_id::uuid;
END;
$$;

-- 5. update_user_is_active
CREATE OR REPLACE FUNCTION public.update_user_is_active(
  userid   text,
  orgid    int,
  isactive boolean
)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE users SET is_active = isactive
  WHERE id = userid::uuid AND organization_id = orgid;
$$;

-- 6. update_user_lang
CREATE OR REPLACE FUNCTION public.update_user_lang(new_lang text)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE users SET lang = new_lang WHERE id = auth.uid();
$$;

-- 7. update_last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE users SET last_login = now() WHERE id = auth.uid();
$$;

-- 8. delete_user
CREATE OR REPLACE FUNCTION public.delete_user(userid text, orgid int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = userid::uuid;
  -- public.users row cascade-deleted via FK
END;
$$;

-- 9. check_if_user_exists_under_organization
CREATE OR REPLACE FUNCTION public.check_if_user_exists_under_organization(
  domain     text,
  user_email text
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE email = user_email AND organization_domain = domain
  );
$$;

-- 10. get_users_for_test
CREATE OR REPLACE FUNCTION public.get_users_for_test()
RETURNS TABLE (id uuid, name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.name
  FROM users u
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

-- 11. get_organization_users_info
CREATE OR REPLACE FUNCTION public.get_organization_users_info(orgid int)
RETURNS TABLE (
  created_at          timestamptz,
  organization_id     int,
  organization_domain text,
  id                  uuid,
  email               text,
  role                text,
  is_active           boolean,
  name                text,
  group_id            int,
  department          text,
  job_title           text,
  job_grade           text,
  country             text,
  city                text,
  group_name          text,
  completed_courses_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.created_at, u.organization_id, u.organization_domain, u.id, u.email,
         u.role::text, u.is_active, u.name, u.group_id, u.department,
         u.job_title, u.job_grade, u.country, u.city,
         g.name AS group_name,
         (SELECT count(*) FROM user_courses uc
          WHERE uc.user_id = u.id AND uc.status = 'completed') AS completed_courses_count
  FROM users u
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE u.organization_id = orgid;
$$;

-- 12a. get_user_course_details (org-wide overview)
CREATE OR REPLACE FUNCTION public.get_user_course_details()
RETURNS TABLE (
  user_id           uuid,
  name              text,
  country           text,
  department        text,
  "group"           text,
  completed_courses bigint,
  pending_courses   bigint,
  completion_rate   numeric,
  last_login        timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH org AS (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  SELECT u.id AS user_id, u.name, u.country, u.department,
         g.name AS "group",
         count(*) FILTER (WHERE uc.status = 'completed') AS completed_courses,
         count(*) FILTER (WHERE uc.status IS DISTINCT FROM 'completed') AS pending_courses,
         CASE WHEN count(*) > 0
              THEN round(count(*) FILTER (WHERE uc.status = 'completed')::numeric / count(*)::numeric * 100, 2)
              ELSE 0 END AS completion_rate,
         u.last_login
  FROM users u
  JOIN org ON u.organization_id = org.organization_id
  LEFT JOIN groups g ON u.group_id = g.id
  LEFT JOIN user_courses uc ON uc.user_id = u.id
  WHERE u.role = 'learner'
  GROUP BY u.id, u.name, u.country, u.department, g.name, u.last_login;
$$;

-- 12b. get_user_course_details (specific user+course)
CREATE OR REPLACE FUNCTION public.get_user_course_details(
  p_user_id  text,
  p_course_id int
)
RETURNS TABLE (
  user_name        text,
  department       text,
  job_title        text,
  group_name       text,
  avatar_url       text,
  course_title     text,
  course_category  text,
  course_thumbnail text,
  progress         text,
  created_at       timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.name AS user_name, u.department, u.job_title,
         g.name AS group_name, u.avatar_url,
         c.title AS course_title, cat.name AS course_category,
         c.thumbnail AS course_thumbnail,
         uc.progress, uc.created_at
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE uc.user_id = p_user_id::uuid AND uc.course_id = p_course_id;
$$;


-- ==========================================================================
--  SECTION 2: ORGANIZATION FUNCTIONS
-- ==========================================================================

-- 13. get_organization_id
CREATE OR REPLACE FUNCTION public.get_organization_id(domain_input text)
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM organization WHERE domain = domain_input;
$$;

-- 14. get_organization_id_by_user
CREATE OR REPLACE FUNCTION public.get_organization_id_by_user()
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- 15. get_organization_settings
CREATE OR REPLACE FUNCTION public.get_organization_settings(domain_input text)
RETURNS json
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT to_json(os.*)
  FROM organization_settings os
  JOIN organization o ON os.organization_id = o.id
  WHERE o.domain = domain_input;
$$;

-- 16. get_organization_settings_for_user
CREATE OR REPLACE FUNCTION public.get_organization_settings_for_user(domain_name text DEFAULT NULL)
RETURNS TABLE (
  id                  int,
  created_at          timestamptz,
  domain              text,
  auth_bg             text,
  logo                text,
  primary_color       text,
  secondary_color     text,
  organization_id     int,
  registeration_enabled                 boolean,
  registeration_require_approval        boolean,
  registeration_require_specific_domain boolean,
  registeration_domain                  text,
  course_expiration_enabled             boolean,
  course_expiration_period              int,
  course_self_entrollment_policy        text,
  name                text,
  certificate_template int,
  certificate_logo     text,
  certificate_auth_title text,
  certificate_sign     text,
  certificate_bg_color text,
  certificate_preview  text,
  lang                text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _domain text;
BEGIN
  IF domain_name IS NOT NULL THEN
    _domain := domain_name;
  ELSE
    SELECT u.organization_domain INTO _domain FROM users u WHERE u.id = auth.uid();
  END IF;

  RETURN QUERY
  SELECT o.id, os.created_at, o.domain, os.auth_bg, os.logo, os.primary_color,
         os.secondary_color, os.organization_id,
         os.registeration_enabled, os.registeration_require_approval,
         os.registeration_require_specific_domain, os.registeration_domain,
         os.course_expiration_enabled, os.course_expiration_period,
         os.course_self_entrollment_policy::text, os.name,
         os.certificate_template, os.certificate_logo, os.certificate_auth_title,
         os.certificate_sign, os.certificate_bg_color, os.certificate_preview, os.lang
  FROM organization o
  JOIN organization_settings os ON o.id = os.organization_id
  WHERE o.domain = _domain;
END;
$$;

-- 17. get_organization_details (legacy)
CREATE OR REPLACE FUNCTION public.get_organization_details(organization_domain text)
RETURNS SETOF record
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.*, os.*
  FROM organization o
  JOIN organization_settings os ON o.id = os.organization_id
  WHERE o.domain = organization_domain;
$$;

-- 18. get_organization_details_test
CREATE OR REPLACE FUNCTION public.get_organization_details_test(organization_domain text)
RETURNS TABLE (
  id                  int,
  created_at          timestamptz,
  domain              text,
  auth_bg             text,
  logo                text,
  primary_color       text,
  secondary_color     text,
  organization_id     int,
  registeration_enabled                 boolean,
  registeration_require_approval        boolean,
  registeration_require_specific_domain boolean,
  registeration_domain                  text,
  course_expiration_enabled             boolean,
  course_expiration_period              int,
  course_self_entrollment_policy        text,
  name                text,
  certificate_template int,
  certificate_logo     text,
  certificate_auth_title text,
  certificate_sign     text,
  certificate_bg_color text,
  certificate_preview  text,
  lang                text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.id, os.created_at, o.domain, os.auth_bg, os.logo, os.primary_color,
         os.secondary_color, os.organization_id,
         os.registeration_enabled, os.registeration_require_approval,
         os.registeration_require_specific_domain, os.registeration_domain,
         os.course_expiration_enabled, os.course_expiration_period,
         os.course_self_entrollment_policy::text, os.name,
         os.certificate_template, os.certificate_logo, os.certificate_auth_title,
         os.certificate_sign, os.certificate_bg_color, os.certificate_preview, os.lang
  FROM organization o
  JOIN organization_settings os ON o.id = os.organization_id
  WHERE o.domain = organization_domain;
$$;

-- 19. get_organization_subscription
CREATE OR REPLACE FUNCTION public.get_organization_subscription()
RETURNS SETOF record
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.id, s.created_at, s.expires_at, s.organization_id,
         s.subscription_tier, s.start_date,
         st.tier_name, st.max_user, st.max_courses, st.max_lms_managers
  FROM subscriptions s
  JOIN subscription_tiers st ON s.subscription_tier = st.id
  WHERE s.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ORDER BY s.created_at DESC
  LIMIT 1;
$$;

-- 20. get_organization_sliders
CREATE OR REPLACE FUNCTION public.get_organization_sliders()
RETURNS TABLE (
  created_at      timestamptz,
  created_by      uuid,
  id              int,
  image           text,
  link            text,
  organization_id int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT s.created_at, s.created_by, s.id, s.image, s.link, s.organization_id
  FROM slider s
  WHERE s.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

-- 21. get_organization_statistics
CREATE OR REPLACE FUNCTION public.get_organization_statistics()
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
  _result json;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  SELECT json_build_object(
    'total_users',       (SELECT count(*) FROM users WHERE organization_id = _org_id),
    'active_users',      (SELECT count(*) FROM users WHERE organization_id = _org_id AND is_active = true),
    'total_courses',     (SELECT count(*) FROM courses WHERE organization_id = _org_id),
    'total_enrollments', (SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id WHERE u.organization_id = _org_id),
    'total_completions', (SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id WHERE u.organization_id = _org_id AND uc.status = 'completed'),
    'completion_rate',   COALESCE((
      SELECT round(count(*) FILTER (WHERE uc.status = 'completed')::numeric / NULLIF(count(*)::numeric, 0) * 100, 2)
      FROM user_courses uc JOIN users u ON uc.user_id = u.id WHERE u.organization_id = _org_id
    ), 0)
  ) INTO _result;

  RETURN _result;
END;
$$;

-- 22. get_subscription_usage
CREATE OR REPLACE FUNCTION public.get_subscription_usage()
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  RETURN json_build_object(
    'users',        (SELECT count(*) FROM users WHERE organization_id = _org_id),
    'courses',      (SELECT count(*) FROM courses WHERE organization_id = _org_id),
    'lms_managers', (SELECT count(*) FROM users WHERE organization_id = _org_id AND role IN ('LMSAdmin','learningManager'))
  );
END;
$$;

-- 23-28. Organization stat counters
CREATE OR REPLACE FUNCTION public.get_organization_active_count()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*) FROM users
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.get_organization_active_count_for_last_month()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*) FROM users
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND is_active = true
    AND last_login >= date_trunc('month', now()) - interval '1 month';
$$;

CREATE OR REPLACE FUNCTION public.get_organization_users_count()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*) FROM users
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_organization_users_count_for_last_month()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*) FROM users
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND created_at >= date_trunc('month', now()) - interval '1 month'
    AND created_at <  date_trunc('month', now());
$$;

CREATE OR REPLACE FUNCTION public.get_organization_completion_rate()
RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int; _rate numeric;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  SELECT COALESCE(
    round(count(*) FILTER (WHERE uc.status = 'completed')::numeric
          / NULLIF(count(*)::numeric, 0) * 100, 2), 0)
    INTO _rate
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = _org_id;
  RETURN _rate;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_count_last_month()
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(DISTINCT uc.user_id)
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.created_at >= date_trunc('month', now()) - interval '1 month'
    AND uc.created_at <  date_trunc('month', now());
$$;

-- 29-33. More org counters (misspelled names preserved for compatibility)
CREATE OR REPLACE FUNCTION public.get_orgnaization_active_enrollments_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.status IS DISTINCT FROM 'completed';
$$;

CREATE OR REPLACE FUNCTION public.get_orgnaization_completed_courses_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.status = 'completed';
$$;

CREATE OR REPLACE FUNCTION public.get_orgnaization_completed_courses_count_for_last_month()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.status = 'completed'
    AND uc.completed_at >= date_trunc('month', now()) - interval '1 month'
    AND uc.completed_at <  date_trunc('month', now());
$$;

CREATE OR REPLACE FUNCTION public.get_orgnaization_enrollements_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_orgnaization_enrollements_count_for_last_month()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.created_at >= date_trunc('month', now()) - interval '1 month'
    AND uc.created_at <  date_trunc('month', now());
$$;

CREATE OR REPLACE FUNCTION public.get_orgnaization_enrollments_count()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_completions_count_last_month()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.status = 'completed'
    AND uc.completed_at >= date_trunc('month', now()) - interval '1 month'
    AND uc.completed_at <  date_trunc('month', now());
$$;

CREATE OR REPLACE FUNCTION public.get_users_count_last_month()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM users
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND created_at >= date_trunc('month', now()) - interval '1 month'
    AND created_at <  date_trunc('month', now());
$$;

CREATE OR REPLACE FUNCTION public.get_average_progress_by_organization()
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(round(avg(uc.progress::numeric), 2), 0)
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;


-- 34-38. Organization update functions
CREATE OR REPLACE FUNCTION public.update_organization_branding(
  new_logo text, new_auth text, new_name text, orgid int
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE organization_settings
  SET logo = new_logo, auth_bg = new_auth, name = new_name
  WHERE organization_id = orgid;
$$;

CREATE OR REPLACE FUNCTION public.update_organization_certificate_settings(
  orgid int, uuid text, logo_url text, auth_title text,
  sign_url text, color text, preview_url text
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE organization_settings SET
    certificate_template   = uuid::int,
    certificate_logo       = logo_url,
    certificate_auth_title = auth_title,
    certificate_sign       = sign_url,
    certificate_bg_color   = color,
    certificate_preview    = preview_url
  WHERE organization_id = orgid;
$$;

CREATE OR REPLACE FUNCTION public.update_organization_courses(
  orgid int, course_expiration boolean, expiration_period int, self_enrollment text
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE organization_settings SET
    course_expiration_enabled        = course_expiration,
    course_expiration_period         = expiration_period,
    course_self_entrollment_policy   = self_enrollment::public.courseenrollementpolicy
  WHERE organization_id = orgid;
$$;

CREATE OR REPLACE FUNCTION public.update_organization_registeration(
  orgid int, enabled boolean, approval_required boolean,
  require_specific_domain boolean, domain text
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE organization_settings SET
    registeration_enabled                 = enabled,
    registeration_require_approval        = approval_required,
    registeration_require_specific_domain = require_specific_domain,
    registeration_domain                  = domain
  WHERE organization_id = orgid;
$$;

-- 39. get_monthly_stats_for_year
CREATE OR REPLACE FUNCTION public.get_monthly_stats_for_year(year int)
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT to_char(m, 'YYYY-MM') AS month,
             COALESCE((SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
                        WHERE u.organization_id = _org_id
                          AND date_trunc('month', uc.created_at) = m), 0) AS enrollments,
             COALESCE((SELECT count(*) FROM user_courses uc JOIN users u ON uc.user_id = u.id
                        WHERE u.organization_id = _org_id
                          AND uc.status = 'completed'
                          AND date_trunc('month', uc.completed_at) = m), 0) AS completions,
             COALESCE((SELECT count(*) FROM users
                        WHERE organization_id = _org_id
                          AND date_trunc('month', created_at) = m), 0) AS new_users
      FROM generate_series(
        make_date(year, 1, 1)::timestamptz,
        make_date(year, 12, 1)::timestamptz,
        '1 month'::interval
      ) AS m
    ) t
  );
END;
$$;


-- ==========================================================================
--  SECTION 3: COURSE FUNCTIONS (category_id normalized to FK)
-- ==========================================================================

-- 40. get_organization_courses
CREATE OR REPLACE FUNCTION public.get_organization_courses()
RETURNS TABLE (
  category    text,
  coassemble_id text,
  created_at  timestamptz,
  created_by  uuid,
  description text,
  id          int,
  languages   jsonb[],
  level       public.courselevel,
  organization_id int,
  slug        text,
  status      text,
  thumbnail   text,
  timeline    text,
  title       text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT cat.name AS category, c.coassemble_id, c.created_at, c.created_by,
         c.description, c.id, c.languages, c.level, c.organization_id,
         c.slug, c.status, c.thumbnail, c.timeline, c.title
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;

-- 41. get_all_courses (with filter support)
CREATE OR REPLACE FUNCTION public.get_all_courses(
  _name_filter     text DEFAULT NULL,
  _category_filter text DEFAULT NULL
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
         c.status, c.thumbnail
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN users u ON c.created_by = u.id
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name_filter IS NULL OR c.title ILIKE '%' || _name_filter || '%')
    AND (_category_filter IS NULL OR cat.name ILIKE '%' || _category_filter || '%')
  ORDER BY c.created_at DESC;
$$;

-- 42. get_course_details
CREATE OR REPLACE FUNCTION public.get_course_details(p_course_id int)
RETURNS TABLE (
  id              int,
  name            text,
  category        text,
  created_at      timestamptz,
  created_by_name text,
  enrollments     bigint,
  completions     bigint,
  status          text,
  thumbnail       text,
  coassemble_id   text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title AS name, cat.name AS category, c.created_at,
         COALESCE(u.name, '') AS created_by_name,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id) AS enrollments,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id AND uc.status = 'completed') AS completions,
         c.status, c.thumbnail, c.coassemble_id
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN users u ON c.created_by = u.id
  WHERE c.id = p_course_id;
$$;

-- 43. get_course (full course object)
CREATE OR REPLACE FUNCTION public.get_course(_course_id int)
RETURNS TABLE (
  id              int,
  title           text,
  description     text,
  category_id     int,
  category_name   text,
  category_ar_name text,
  level           text,
  timeline        text,
  thumbnail       text,
  languages       jsonb[],
  slug            text,
  status          text,
  coassemble_id   text,
  organization_id int,
  outcomes        jsonb,
  is_scorm        boolean,
  scorm_version   text,
  scorm_url       text,
  launch_path     text,
  created_at      timestamptz,
  created_by      uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title, c.description, c.category_id,
         cat.name AS category_name, cat.ar_name AS category_ar_name,
         c.level::text, c.timeline, c.thumbnail, c.languages, c.slug, c.status,
         c.coassemble_id, c.organization_id, c.outcomes,
         c.is_scorm, c.scorm_version, c.scorm_url, c.launch_path,
         c.created_at, c.created_by
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.id = _course_id;
$$;

-- 44. get_course_by_slug
CREATE OR REPLACE FUNCTION public.get_course_by_slug(course_slug text)
RETURNS TABLE (
  id              int,
  title           text,
  description     text,
  category_id     int,
  category_name   text,
  category_ar_name text,
  level           text,
  timeline        text,
  thumbnail       text,
  languages       jsonb[],
  slug            text,
  status          text,
  coassemble_id   text,
  organization_id int,
  outcomes        jsonb,
  is_scorm        boolean,
  scorm_version   text,
  scorm_url       text,
  launch_path     text,
  created_at      timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title, c.description, c.category_id,
         cat.name AS category_name, cat.ar_name AS category_ar_name,
         c.level::text, c.timeline, c.thumbnail, c.languages, c.slug, c.status,
         c.coassemble_id, c.organization_id, c.outcomes,
         c.is_scorm, c.scorm_version, c.scorm_url, c.launch_path, c.created_at
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.slug = course_slug;
$$;

-- 45. get_course_title
CREATE OR REPLACE FUNCTION public.get_course_title(course_id int)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT title FROM courses WHERE id = course_id;
$$;

-- 46. get_course_titles_and_ids
CREATE OR REPLACE FUNCTION public.get_course_titles_and_ids()
RETURNS TABLE (course_id int, title text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id AS course_id, title
  FROM courses
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ORDER BY title;
$$;

-- 47. get_courses_by_category
CREATE OR REPLACE FUNCTION public.get_courses_by_category()
RETURNS TABLE (name text, value bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT cat.name, count(c.id) AS value
  FROM categories cat
  LEFT JOIN courses c ON c.category_id = cat.id
    AND c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  WHERE cat.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  GROUP BY cat.name
  ORDER BY value DESC;
$$;

-- 48. get_courses_per_month
CREATE OR REPLACE FUNCTION public.get_courses_per_month()
RETURNS TABLE (month text, course_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT to_char(created_at, 'YYYY-MM') AS month, count(*) AS course_count
  FROM courses
  WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  GROUP BY month ORDER BY month;
$$;

-- 49. get_org_courses (for learner view by org_id)
CREATE OR REPLACE FUNCTION public.get_org_courses(org_id int)
RETURNS TABLE (
  id              int,
  title           text,
  description     text,
  category_id     int,
  category_name   text,
  category_ar_name text,
  level           text,
  timeline        text,
  thumbnail       text,
  languages       jsonb[],
  slug            text,
  coassemble_id   text,
  outcomes        jsonb,
  is_scorm        boolean,
  course_id       int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title, c.description, c.category_id,
         cat.name AS category_name, cat.ar_name AS category_ar_name,
         c.level::text, c.timeline, c.thumbnail, c.languages, c.slug,
         c.coassemble_id, c.outcomes, c.is_scorm, c.id AS course_id
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.organization_id = org_id
  ORDER BY c.created_at DESC;
$$;

-- 50. add_course
CREATE OR REPLACE FUNCTION public.add_course(
  _organization_id int,
  _title           text,
  _description     text,
  _category_id     int,
  _level           text,
  _completion_time text,
  _slug            text,
  _image_preview   text,
  _outcomes        text DEFAULT '[]',
  _is_scorm        boolean DEFAULT false,
  _scorm_version   text DEFAULT NULL,
  _launch_path     text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO courses (
    organization_id, title, description, category_id, level, timeline,
    slug, thumbnail, outcomes, is_scorm, scorm_version, launch_path, created_by
  ) VALUES (
    _organization_id, _title, _description, _category_id,
    _level::public.courselevel, _completion_time,
    _slug, _image_preview, _outcomes::jsonb,
    _is_scorm, _scorm_version, _launch_path, auth.uid()
  );
END;
$$;

-- 51. update_course
CREATE OR REPLACE FUNCTION public.update_course(
  _course_id       int,
  _organization_id int,
  _title           text,
  _description     text,
  _category_id     int,
  _level           text,
  _completion_time text,
  _slug            text,
  _image_preview   text,
  _outcomes        text DEFAULT '[]'
)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE courses SET
    title       = _title,
    description = _description,
    category_id = _category_id,
    level       = _level::public.courselevel,
    timeline    = _completion_time,
    slug        = _slug,
    thumbnail   = _image_preview,
    outcomes    = _outcomes::jsonb
  WHERE id = _course_id AND organization_id = _organization_id;
$$;

-- 52. delete_course_and_related_user_courses
CREATE OR REPLACE FUNCTION public.delete_course_and_related_user_courses(p_course_id int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM user_certificates WHERE course_id = p_course_id;
  DELETE FROM user_courses      WHERE course_id = p_course_id;
  DELETE FROM certificates      WHERE course   = p_course_id;
  DELETE FROM courses           WHERE id       = p_course_id;
END;
$$;


-- ==========================================================================
--  SECTION 4: ENROLLMENT FUNCTIONS
-- ==========================================================================

-- 53. enrol_to_course (learner self-enroll)
CREATE OR REPLACE FUNCTION public.enrol_to_course(course_input_id int)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO user_courses (user_id, course_id)
  VALUES (auth.uid(), course_input_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;
$$;

-- 54. enrol_to_course_by_id (admin enroll)
CREATE OR REPLACE FUNCTION public.enrol_to_course_by_id(p_user_id text, p_course_id int)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO user_courses (user_id, course_id)
  VALUES (p_user_id::uuid, p_course_id)
  ON CONFLICT (user_id, course_id) DO NOTHING;
$$;

-- 55. enroll_users_to_courses (bulk enroll)
CREATE OR REPLACE FUNCTION public.enroll_users_to_courses(user_ids text[], course_ids int[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO user_courses (user_id, course_id)
  SELECT uid::uuid, cid
  FROM unnest(user_ids) AS uid
  CROSS JOIN unnest(course_ids) AS cid
  ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$;

-- 56. update_course_percentage (with scorm_data support)
CREATE OR REPLACE FUNCTION public.update_course_percentage(
  courseid   int,
  percentage text,
  scormdata  jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE user_courses SET
    progress   = percentage,
    scorm_data = COALESCE(scormdata, scorm_data),
    status     = CASE WHEN percentage::numeric >= 100 THEN 'completed' ELSE status END,
    completed_at = CASE WHEN percentage::numeric >= 100 AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = auth.uid() AND course_id = courseid;
END;
$$;

-- 57. get_enrollments_by_course
CREATE OR REPLACE FUNCTION public.get_enrollments_by_course(course_id_input int)
RETURNS TABLE (
  name            text,
  email           text,
  enrollment_date timestamptz,
  progress        text,
  course_id       int,
  course_title    text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.name, u.email, uc.created_at AS enrollment_date,
         uc.progress, c.id AS course_id, c.title AS course_title
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  WHERE uc.course_id = course_id_input;
$$;

-- 58a. get_enrollments_completions_per_month (org-wide)
CREATE OR REPLACE FUNCTION public.get_enrollments_completions_per_month()
RETURNS TABLE (month text, enrollments bigint, completions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT to_char(uc.created_at, 'YYYY-MM') AS month,
         count(*) AS enrollments,
         count(*) FILTER (WHERE uc.status = 'completed') AS completions
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  GROUP BY month ORDER BY month;
$$;

-- 58b. get_enrollments_completions_per_month (by course)
CREATE OR REPLACE FUNCTION public.get_enrollments_completions_per_month(course_id_input int)
RETURNS TABLE (month text, enrollments bigint, completions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT to_char(uc.created_at, 'YYYY-MM') AS month,
         count(*) AS enrollments,
         count(*) FILTER (WHERE uc.status = 'completed') AS completions
  FROM user_courses uc
  WHERE uc.course_id = course_id_input
  GROUP BY month ORDER BY month;
$$;

-- 59. get_enrollment_activity (with filters)
CREATE OR REPLACE FUNCTION public.get_enrollment_activity(
  _name       text DEFAULT NULL,
  _course     text DEFAULT NULL,
  _department text DEFAULT NULL,
  _group_name text DEFAULT NULL,
  _start_date text DEFAULT NULL,
  _end_date   text DEFAULT NULL
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
  group_name          text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.id AS enrollment_id, u.id AS user_id, u.name,
         c.title AS course, c.thumbnail,
         uc.created_at AS enrollment_date,
         uc.progress::numeric AS progress_percentage,
         uc.completed_at AS completion_date,
         c.id AS course_id, u.email, u.department,
         g.name AS group_name
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
  ORDER BY uc.created_at DESC;
$$;

-- 60. get_enrollments_options
CREATE OR REPLACE FUNCTION public.get_enrollments_options()
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  RETURN json_build_object(
    'courses',     (SELECT json_agg(DISTINCT c.title) FROM courses c WHERE c.organization_id = _org_id),
    'departments', (SELECT json_agg(DISTINCT u.department) FROM users u WHERE u.organization_id = _org_id AND u.department IS NOT NULL),
    'groups',      (SELECT json_agg(DISTINCT g.name) FROM groups g WHERE g.organization_id = _org_id)
  );
END;
$$;

-- 61. get_user_courses (current user's enrolled courses)
CREATE OR REPLACE FUNCTION public.get_user_courses()
RETURNS TABLE (
  id            int,
  name          text,
  description   text,
  thumbnail     text,
  category      text,
  coassemble_id text,
  enrolled_at   timestamptz,
  timeline      text,
  level         text,
  slug          text,
  percentage    numeric
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title AS name, c.description, c.thumbnail,
         cat.name AS category, c.coassemble_id,
         uc.created_at AS enrolled_at, c.timeline, c.level::text, c.slug,
         uc.progress::numeric AS percentage
  FROM user_courses uc
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE uc.user_id = auth.uid();
$$;

-- 62. get_user_courses_learner (learner dashboard view)
CREATE OR REPLACE FUNCTION public.get_user_courses_learner()
RETURNS TABLE (
  id              int,
  name            text,
  description     text,
  thumbnail       text,
  category        text,
  category_ar_name text,
  coassemble_id   text,
  enrolled_at     timestamptz,
  timeline        text,
  level           text,
  slug            text,
  percentage      numeric,
  course_id       int,
  is_scorm        boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title AS name, c.description, c.thumbnail,
         cat.name AS category, cat.ar_name AS category_ar_name,
         c.coassemble_id, uc.created_at AS enrolled_at,
         c.timeline, c.level::text, c.slug,
         uc.progress::numeric AS percentage,
         c.id AS course_id, c.is_scorm
  FROM user_courses uc
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE uc.user_id = auth.uid();
$$;

-- 63. get_user_courses_count_last_month
CREATE OR REPLACE FUNCTION public.get_user_courses_count_last_month()
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM user_courses
  WHERE user_id = auth.uid()
    AND created_at >= date_trunc('month', now()) - interval '1 month'
    AND created_at <  date_trunc('month', now());
$$;

-- 64. get_user_course_summary
CREATE OR REPLACE FUNCTION public.get_user_course_summary()
RETURNS TABLE (
  user_id         uuid,
  name            text,
  course          text,
  enrollment_date timestamptz,
  completion_rate numeric,
  completion_date timestamptz,
  image           text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.user_id, u.name, c.title AS course,
         uc.created_at AS enrollment_date,
         uc.progress::numeric AS completion_rate,
         uc.completed_at AS completion_date,
         c.thumbnail AS image
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ORDER BY uc.created_at DESC;
$$;


-- ==========================================================================
--  SECTION 5: CATEGORY FUNCTIONS
-- ==========================================================================

-- 65. get_categories
CREATE OR REPLACE FUNCTION public.get_categories()
RETURNS TABLE (
  ar_name         text,
  created_at      timestamptz,
  id              int,
  image           text,
  name            text,
  organization_id int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.ar_name, c.created_at, c.id, c.image, c.name, c.organization_id
  FROM categories c
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  ORDER BY c.name;
$$;

-- 66. get_all_categories (with filter)
CREATE OR REPLACE FUNCTION public.get_all_categories(_name_filter text DEFAULT NULL)
RETURNS TABLE (
  id              int,
  name            text,
  ar_name         text,
  image           text,
  organization_id int,
  created_at      timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.name, c.ar_name, c.image, c.organization_id, c.created_at
  FROM categories c
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name_filter IS NULL OR c.name ILIKE '%' || _name_filter || '%')
  ORDER BY c.created_at DESC;
$$;

-- 67. add_category
CREATE OR REPLACE FUNCTION public.add_category(_name text, _image text DEFAULT NULL, _ar_name text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  INSERT INTO categories (name, ar_name, image, organization_id)
  VALUES (_name, _ar_name, _image, _org_id);
END;
$$;

-- 68. edit_category
CREATE OR REPLACE FUNCTION public.edit_category(_id int, _name text, _image text DEFAULT NULL, _ar_name text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE categories SET name = _name, ar_name = _ar_name, image = COALESCE(_image, image) WHERE id = _id;
$$;

-- 69. delete_category_and_update_courses
CREATE OR REPLACE FUNCTION public.delete_category_and_update_courses(old_category_id int, new_category_id int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE courses SET category_id = new_category_id WHERE category_id = old_category_id;
  DELETE FROM categories WHERE id = old_category_id;
END;
$$;


-- ==========================================================================
--  SECTION 6: GROUP FUNCTIONS
-- ==========================================================================

-- 70. get_groups_with_user_count
CREATE OR REPLACE FUNCTION public.get_groups_with_user_count()
RETURNS TABLE (id int, organization_id int, created_at timestamptz, name text, user_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT g.id, g.organization_id, g.created_at, g.name,
         count(u.id) AS user_count
  FROM groups g
  LEFT JOIN users u ON u.group_id = g.id
  WHERE g.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  GROUP BY g.id
  ORDER BY g.name;
$$;

-- 71. add_new_group
CREATE OR REPLACE FUNCTION public.add_new_group(orgid int, name text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO groups (organization_id, name, created_by) VALUES (orgid, name, auth.uid());
$$;

-- 72. update_group
CREATE OR REPLACE FUNCTION public.update_group(new_name text, group_id int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE groups SET name = new_name WHERE id = group_id;
$$;

-- 73. delete_groups_by_ids
CREATE OR REPLACE FUNCTION public.delete_groups_by_ids(ids int[])
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE users SET group_id = NULL WHERE group_id = ANY(ids);
  DELETE FROM groups WHERE id = ANY(ids);
END;
$$;


-- ==========================================================================
--  SECTION 7: CERTIFICATE FUNCTIONS
-- ==========================================================================

-- 74. get_certificates (global templates)
CREATE OR REPLACE FUNCTION public.get_certificates()
RETURNS TABLE (created_at timestamptz, id int, name text, placid text, thumbnail text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT gc.created_at, gc.id, gc.name, gc.placid, gc.thumbnail
  FROM global_certificates gc;
$$;

-- 75. get_certificate_template_test
CREATE OR REPLACE FUNCTION public.get_certificate_template_test(organizationid int)
RETURNS TABLE (certificate_template int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT os.certificate_template FROM organization_settings os WHERE os.organization_id = organizationid;
$$;

-- 76. get_certificate_if_exists
CREATE OR REPLACE FUNCTION public.get_certificate_if_exists(course_id int)
RETURNS TABLE (
  certificate text,
  course_id   int,
  created_at  timestamptz,
  id          int,
  updated_at  timestamptz,
  user_id     uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.certificate, uc.course_id, uc.created_at, uc.id, uc.updated_at, uc.user_id
  FROM user_certificates uc
  WHERE uc.user_id = auth.uid() AND uc.course_id = get_certificate_if_exists.course_id;
$$;

-- 77. get_user_certificates
CREATE OR REPLACE FUNCTION public.get_user_certificates()
RETURNS TABLE (
  id          int,
  created_at  timestamptz,
  user_id     uuid,
  course_id   int,
  certificate text,
  updated_at  timestamptz,
  title       text,
  description text,
  level       text,
  category    text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.id, uc.created_at, uc.user_id, uc.course_id, uc.certificate,
         uc.updated_at, c.title, c.description, c.level::text,
         cat.name AS category
  FROM user_certificates uc
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE uc.user_id = auth.uid()
  ORDER BY uc.created_at DESC;
$$;

-- 78. insert_user_certificate
CREATE OR REPLACE FUNCTION public.insert_user_certificate(certificate_url text, course int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO user_certificates (user_id, course_id, certificate)
  VALUES (auth.uid(), course, certificate_url)
  ON CONFLICT (user_id, course_id) DO UPDATE SET certificate = EXCLUDED.certificate, updated_at = now();
$$;

-- 79. get_certificate_details
CREATE OR REPLACE FUNCTION public.get_certificate_details(user_id text, course_id int)
RETURNS TABLE (
  student_name     text,
  course_title     text,
  completion_date  timestamptz,
  organization_name text,
  certificate_url  text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.name AS student_name, c.title AS course_title,
         uc.completed_at AS completion_date,
         os.name AS organization_name,
         ucert.certificate AS certificate_url
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  JOIN organization_settings os ON u.organization_id = os.organization_id
  LEFT JOIN user_certificates ucert ON ucert.user_id = u.id AND ucert.course_id = c.id
  WHERE uc.user_id = get_certificate_details.user_id::uuid
    AND uc.course_id = get_certificate_details.course_id;
$$;


-- ==========================================================================
--  SECTION 8: INSIGHTS & ANALYTICS FUNCTIONS
-- ==========================================================================

-- 80. performance_insights
CREATE OR REPLACE FUNCTION public.performance_insights()
RETURNS TABLE (
  avg_completion_rate      numeric,
  active_enrollments_count bigint,
  avg_completion_days      numeric
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  RETURN QUERY
  SELECT
    COALESCE(round(avg(uc.progress::numeric), 2), 0) AS avg_completion_rate,
    count(*) FILTER (WHERE uc.status IS DISTINCT FROM 'completed') AS active_enrollments_count,
    COALESCE(round(avg(
      CASE WHEN uc.completed_at IS NOT NULL
           THEN EXTRACT(EPOCH FROM (uc.completed_at - uc.created_at)) / 86400.0
           ELSE NULL END
    ), 1), 0) AS avg_completion_days
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  WHERE u.organization_id = _org_id;
END;
$$;

-- 81. get_learners (with filters)
CREATE OR REPLACE FUNCTION public.get_learners(
  _learner_name       text DEFAULT NULL,
  _learner_department text DEFAULT NULL,
  _learner_group_name text DEFAULT NULL,
  _learner_country    text DEFAULT NULL
)
RETURNS TABLE (
  learner_id              uuid,
  learner_name            text,
  learner_email           text,
  learner_department      text,
  learner_group_name      text,
  enrollment_course_count bigint,
  completed_course_count  bigint,
  enrollment_date         timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id AS learner_id, u.name AS learner_name, u.email AS learner_email,
         u.department AS learner_department, g.name AS learner_group_name,
         count(uc.id) AS enrollment_course_count,
         count(uc.id) FILTER (WHERE uc.status = 'completed') AS completed_course_count,
         max(uc.created_at) AS enrollment_date
  FROM users u
  LEFT JOIN groups g ON u.group_id = g.id
  LEFT JOIN user_courses uc ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND u.role = 'learner'
    AND (_learner_name IS NULL OR u.name ILIKE '%' || _learner_name || '%')
    AND (_learner_department IS NULL OR u.department ILIKE '%' || _learner_department || '%')
    AND (_learner_group_name IS NULL OR g.name ILIKE '%' || _learner_group_name || '%')
    AND (_learner_country IS NULL OR u.country ILIKE '%' || _learner_country || '%')
  GROUP BY u.id, u.name, u.email, u.department, g.name
  ORDER BY u.name;
$$;

-- 82. get_learners_options
CREATE OR REPLACE FUNCTION public.get_learners_options()
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  RETURN json_build_object(
    'departments', (SELECT json_agg(DISTINCT u.department) FROM users u WHERE u.organization_id = _org_id AND u.department IS NOT NULL),
    'groups',      (SELECT json_agg(DISTINCT g.name) FROM groups g WHERE g.organization_id = _org_id),
    'countries',   (SELECT json_agg(DISTINCT u.country) FROM users u WHERE u.organization_id = _org_id AND u.country IS NOT NULL)
  );
END;
$$;

-- 83. get_learners_with_completed_courses (completions view)
CREATE OR REPLACE FUNCTION public.get_learners_with_completed_courses(
  _course_filter      text DEFAULT NULL,
  _department_filter  text DEFAULT NULL,
  _group_name_filter  text DEFAULT NULL,
  _name_filter        text DEFAULT NULL,
  _start_date         text DEFAULT NULL,
  _end_date           text DEFAULT NULL
)
RETURNS TABLE (
  learner_id     uuid,
  learner_name   text,
  learner_email  text,
  department     text,
  group_name     text,
  course_title   text,
  completion_date timestamptz,
  course_id      int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id AS learner_id, u.name AS learner_name, u.email AS learner_email,
         u.department, g.name AS group_name,
         c.title AS course_title, uc.completed_at AS completion_date, c.id AS course_id
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND uc.status = 'completed'
    AND (_course_filter IS NULL OR c.title ILIKE '%' || _course_filter || '%')
    AND (_department_filter IS NULL OR u.department ILIKE '%' || _department_filter || '%')
    AND (_group_name_filter IS NULL OR g.name ILIKE '%' || _group_name_filter || '%')
    AND (_name_filter IS NULL OR u.name ILIKE '%' || _name_filter || '%')
    AND (_start_date IS NULL OR uc.completed_at >= _start_date::timestamptz)
    AND (_end_date IS NULL OR uc.completed_at <= _end_date::timestamptz)
  ORDER BY uc.completed_at DESC;
$$;

-- 84. get_completion_options
CREATE OR REPLACE FUNCTION public.get_completion_options()
RETURNS json
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE _org_id int;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();
  RETURN json_build_object(
    'courses',     (SELECT json_agg(DISTINCT c.title) FROM courses c WHERE c.organization_id = _org_id),
    'departments', (SELECT json_agg(DISTINCT u.department) FROM users u WHERE u.organization_id = _org_id AND u.department IS NOT NULL),
    'groups',      (SELECT json_agg(DISTINCT g.name) FROM groups g WHERE g.organization_id = _org_id)
  );
END;
$$;

-- 85. get_students_data
CREATE OR REPLACE FUNCTION public.get_students_data()
RETURNS SETOF record
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.name, u.email, u.department,
         g.name AS group_name,
         count(uc.id) AS total_enrollments,
         count(uc.id) FILTER (WHERE uc.status = 'completed') AS completed_courses,
         CASE WHEN count(uc.id) > 0
              THEN round(count(uc.id) FILTER (WHERE uc.status = 'completed')::numeric / count(uc.id)::numeric * 100, 2)
              ELSE 0 END AS completion_rate
  FROM users u
  LEFT JOIN groups g ON u.group_id = g.id
  LEFT JOIN user_courses uc ON uc.user_id = u.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND u.role = 'learner'
  GROUP BY u.id, u.name, u.email, u.department, g.name;
$$;

-- 86. get_creator_details
CREATE OR REPLACE FUNCTION public.get_creator_details()
RETURNS TABLE (creator_organization int, creator_user uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT organization_id AS creator_organization, id AS creator_user
  FROM users WHERE id = auth.uid();
$$;


-- ==========================================================================
--  SECTION 9: SUPER ADMIN FUNCTIONS
-- ==========================================================================

-- 87. get_all_organization
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
  subscription_expiration_date text,
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
         s.expires_at AS subscription_expiration_date,
         os.create_courses, os.ai_builder, os.document_builder
  FROM organization o
  JOIN organization_settings os ON o.id = os.organization_id
  LEFT JOIN subscriptions s ON s.organization_id = o.id
  LEFT JOIN subscription_tiers st ON s.subscription_tier = st.id
  ORDER BY o.created_at DESC;
$$;

-- 88. create_new_organization
CREATE OR REPLACE FUNCTION public.create_new_organization(
  org_domain              text,
  org_name                text,
  org_sub_tier_name       text,
  org_create_courses      boolean DEFAULT true,
  org_ai_builder          boolean DEFAULT false,
  org_ai_documents_builder boolean DEFAULT false
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
    VALUES (_org_id, _tier_id, now()::text, (now() + interval '1 year')::text);
  END IF;

  RETURN _org_id;
END;
$$;

-- 89. update_organization_details (super admin)
CREATE OR REPLACE FUNCTION public.update_organization_details(
  org_id                  int,
  new_domain              text,
  new_name                text,
  new_subscription_package text,
  new_ai_builder          boolean DEFAULT false,
  new_document_builder    boolean DEFAULT false,
  new_create_courses      boolean DEFAULT true
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _tier_id int;
BEGIN
  UPDATE organization SET domain = new_domain WHERE id = org_id;

  UPDATE organization_settings SET
    name             = new_name,
    ai_builder       = new_ai_builder,
    document_builder = new_document_builder,
    create_courses   = new_create_courses
  WHERE organization_id = org_id;

  SELECT id INTO _tier_id FROM subscription_tiers WHERE tier_name = new_subscription_package LIMIT 1;
  IF _tier_id IS NOT NULL THEN
    UPDATE subscriptions SET subscription_tier = _tier_id
    WHERE organization_id = org_id;
  END IF;
END;
$$;

-- 90. get_summary_data_for_super_admin
CREATE OR REPLACE FUNCTION public.get_summary_data_for_super_admin()
RETURNS json
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT json_build_object(
    'total_organizations', (SELECT count(*) FROM organization),
    'total_users',         (SELECT count(*) FROM users),
    'total_courses',       (SELECT count(*) FROM courses),
    'total_enrollments',   (SELECT count(*) FROM user_courses)
  );
$$;

-- 91. get_subscription_tiers_with_org_count
CREATE OR REPLACE FUNCTION public.get_subscription_tiers_with_org_count()
RETURNS TABLE (
  id                      int,
  tier_name               text,
  max_user                int,
  max_courses             int,
  max_lms_managers        int,
  created_at              timestamptz,
  associated_organizations bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT st.id, st.tier_name, st.max_user, st.max_courses, st.max_lms_managers,
         st.created_at,
         count(s.id) AS associated_organizations
  FROM subscription_tiers st
  LEFT JOIN subscriptions s ON s.subscription_tier = st.id
  GROUP BY st.id
  ORDER BY st.tier_name;
$$;

-- 92. move_organizations_and_delete_tier
CREATE OR REPLACE FUNCTION public.move_organizations_and_delete_tier(new_tier_id int, old_tier_id int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE subscriptions SET subscription_tier = new_tier_id WHERE subscription_tier = old_tier_id;
  DELETE FROM subscription_tiers WHERE id = old_tier_id;
END;
$$;


-- ==========================================================================
--  SECTION 10: SUBSCRIPTION & MISC FUNCTIONS
-- ==========================================================================

-- 93. submit_subscription_request
CREATE OR REPLACE FUNCTION public.submit_subscription_request(
  users_count    int,
  courses_count  int,
  creators_count int,
  orgid          int
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO subscription_requests (organization_id, requester_id, number_of_users, number_of_courses, number_of_content_creators)
  VALUES (orgid, auth.uid(), users_count, courses_count, creators_count);
$$;

-- 94. get_user_role duplicate-safe alias
-- (already defined above, no action needed)

-- 95. Slider functions (read-only via get_organization_sliders above)
-- No additional slider RPCs needed; CRUD is via direct table queries.
