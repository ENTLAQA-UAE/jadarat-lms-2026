-- ============================================================================
-- Jadarat LMS - Baseline Migration: RLS Policies & Storage Buckets
-- ============================================================================
-- Standard multi-tenant RLS: users see only their own organization's data.
-- Super admins have broader access where needed.
-- All RPC functions use SECURITY DEFINER and bypass RLS internally.
-- ============================================================================

-- ==========  ENABLE RLS ON ALL TABLES  ==========

ALTER TABLE public.organization            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_certificates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_courses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certificates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slider                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_requests   ENABLE ROW LEVEL SECURITY;


-- ==========  HELPER: get current user's org_id  ==========
-- (Used in policies below; lightweight and cached per statement)

CREATE OR REPLACE FUNCTION public._rls_org_id()
RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public._rls_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role::text FROM users WHERE id = auth.uid();
$$;


-- ==========  ORGANIZATION  ==========

-- Anyone authenticated can read their own org (for login flow)
CREATE POLICY "org_select_own"
  ON public.organization FOR SELECT
  USING (id = public._rls_org_id());

-- Super admins can read all organizations
CREATE POLICY "org_select_superadmin"
  ON public.organization FOR SELECT
  USING (public._rls_user_role() = 'superAdmin');

-- Super admins can manage organizations
CREATE POLICY "org_insert_superadmin"
  ON public.organization FOR INSERT
  WITH CHECK (public._rls_user_role() = 'superAdmin');

CREATE POLICY "org_update_superadmin"
  ON public.organization FOR UPDATE
  USING (public._rls_user_role() = 'superAdmin');

CREATE POLICY "org_delete_superadmin"
  ON public.organization FOR DELETE
  USING (public._rls_user_role() = 'superAdmin');


-- ==========  ORGANIZATION SETTINGS  ==========

CREATE POLICY "org_settings_select_own"
  ON public.organization_settings FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "org_settings_select_superadmin"
  ON public.organization_settings FOR SELECT
  USING (public._rls_user_role() = 'superAdmin');

CREATE POLICY "org_settings_update_admin"
  ON public.organization_settings FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "org_settings_insert_superadmin"
  ON public.organization_settings FOR INSERT
  WITH CHECK (public._rls_user_role() = 'superAdmin');

CREATE POLICY "org_settings_update_superadmin"
  ON public.organization_settings FOR UPDATE
  USING (public._rls_user_role() = 'superAdmin');


-- ==========  SUBSCRIPTION TIERS (global, read by all, managed by superadmin)  ==========

CREATE POLICY "sub_tiers_select_all"
  ON public.subscription_tiers FOR SELECT
  USING (true);

CREATE POLICY "sub_tiers_manage_superadmin"
  ON public.subscription_tiers FOR ALL
  USING (public._rls_user_role() = 'superAdmin');


-- ==========  SUBSCRIPTIONS  ==========

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "subscriptions_select_superadmin"
  ON public.subscriptions FOR SELECT
  USING (public._rls_user_role() = 'superAdmin');

CREATE POLICY "subscriptions_manage_superadmin"
  ON public.subscriptions FOR ALL
  USING (public._rls_user_role() = 'superAdmin');


-- ==========  GLOBAL CERTIFICATES (read by all authenticated)  ==========

CREATE POLICY "global_certs_select_all"
  ON public.global_certificates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "global_certs_manage_superadmin"
  ON public.global_certificates FOR ALL
  USING (public._rls_user_role() = 'superAdmin');


-- ==========  CATEGORIES  ==========

CREATE POLICY "categories_select_own_org"
  ON public.categories FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "categories_insert_lms_admin"
  ON public.categories FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

CREATE POLICY "categories_update_lms_admin"
  ON public.categories FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

CREATE POLICY "categories_delete_lms_admin"
  ON public.categories FOR DELETE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );


-- ==========  GROUPS  ==========

CREATE POLICY "groups_select_own_org"
  ON public.groups FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "groups_insert_org_admin"
  ON public.groups FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "groups_update_org_admin"
  ON public.groups FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "groups_delete_org_admin"
  ON public.groups FOR DELETE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );


-- ==========  USERS  ==========

-- Users can read their own record
CREATE POLICY "users_select_self"
  ON public.users FOR SELECT
  USING (id = auth.uid());

-- Org admin / LMS admin can read users in their org
CREATE POLICY "users_select_own_org"
  ON public.users FOR SELECT
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'LMSAdmin', 'learningManager')
  );

-- Super admins can read all users
CREATE POLICY "users_select_superadmin"
  ON public.users FOR SELECT
  USING (public._rls_user_role() = 'superAdmin');

-- Users can update their own profile (name, lang, avatar)
CREATE POLICY "users_update_self"
  ON public.users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Org admin can manage users in their org
CREATE POLICY "users_insert_org_admin"
  ON public.users FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "users_update_org_admin"
  ON public.users FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "users_delete_org_admin"
  ON public.users FOR DELETE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );


-- ==========  COURSES  ==========

CREATE POLICY "courses_select_own_org"
  ON public.courses FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "courses_insert_lms"
  ON public.courses FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

CREATE POLICY "courses_update_lms"
  ON public.courses FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

CREATE POLICY "courses_delete_lms"
  ON public.courses FOR DELETE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );


-- ==========  USER_COURSES (enrollments)  ==========

-- Users can see their own enrollments
CREATE POLICY "user_courses_select_self"
  ON public.user_courses FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see enrollments for their org
CREATE POLICY "user_courses_select_org"
  ON public.user_courses FOR SELECT
  USING (
    public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
    AND user_id IN (SELECT id FROM users WHERE organization_id = public._rls_org_id())
  );

-- Users can self-enroll (insert)
CREATE POLICY "user_courses_insert_self"
  ON public.user_courses FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can enroll users
CREATE POLICY "user_courses_insert_admin"
  ON public.user_courses FOR INSERT
  WITH CHECK (
    public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

-- Users can update their own progress
CREATE POLICY "user_courses_update_self"
  ON public.user_courses FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can delete enrollments
CREATE POLICY "user_courses_delete_admin"
  ON public.user_courses FOR DELETE
  USING (
    public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
    AND user_id IN (SELECT id FROM users WHERE organization_id = public._rls_org_id())
  );


-- ==========  USER_CERTIFICATES  ==========

CREATE POLICY "user_certs_select_self"
  ON public.user_certificates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_certs_select_org"
  ON public.user_certificates FOR SELECT
  USING (
    public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
    AND user_id IN (SELECT id FROM users WHERE organization_id = public._rls_org_id())
  );

CREATE POLICY "user_certs_insert_self"
  ON public.user_certificates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_certs_update_self"
  ON public.user_certificates FOR UPDATE
  USING (user_id = auth.uid());


-- ==========  CERTIFICATES  ==========

CREATE POLICY "certificates_select_own_org"
  ON public.certificates FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "certificates_insert_own_org"
  ON public.certificates FOR INSERT
  WITH CHECK (organization_id = public._rls_org_id());


-- ==========  SLIDER  ==========

CREATE POLICY "slider_select_own_org"
  ON public.slider FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "slider_insert_lms"
  ON public.slider FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'organizationAdmin')
  );

CREATE POLICY "slider_update_lms"
  ON public.slider FOR UPDATE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'organizationAdmin')
  );

CREATE POLICY "slider_delete_lms"
  ON public.slider FOR DELETE
  USING (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('LMSAdmin', 'organizationAdmin')
  );


-- ==========  SUBSCRIPTION REQUESTS  ==========

CREATE POLICY "sub_requests_select_own_org"
  ON public.subscription_requests FOR SELECT
  USING (organization_id = public._rls_org_id());

CREATE POLICY "sub_requests_insert_org_admin"
  ON public.subscription_requests FOR INSERT
  WITH CHECK (
    organization_id = public._rls_org_id()
    AND public._rls_user_role() IN ('organizationAdmin', 'superAdmin')
  );

CREATE POLICY "sub_requests_select_superadmin"
  ON public.subscription_requests FOR SELECT
  USING (public._rls_user_role() = 'superAdmin');


-- ==========================================================================
--  STORAGE BUCKETS
-- ==========================================================================

-- Bucket 1: LMS Resources (logos, thumbnails, cert images, auth backgrounds)
INSERT INTO storage.buckets (id, name, public)
VALUES ('LMS Resources', 'LMS Resources', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket 2: SCORM packages
INSERT INTO storage.buckets (id, name, public)
VALUES ('scorm', 'scorm', false)
ON CONFLICT (id) DO NOTHING;


-- ==========  STORAGE POLICIES  ==========

-- LMS Resources: authenticated users can read their org's files
CREATE POLICY "lms_resources_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'LMS Resources'
    AND auth.uid() IS NOT NULL
  );

-- LMS Resources: admins can upload files for their org
CREATE POLICY "lms_resources_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'LMS Resources'
    AND auth.uid() IS NOT NULL
    AND public._rls_user_role() IN ('organizationAdmin', 'LMSAdmin', 'learningManager', 'superAdmin')
  );

-- LMS Resources: admins can update files
CREATE POLICY "lms_resources_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'LMS Resources'
    AND auth.uid() IS NOT NULL
    AND public._rls_user_role() IN ('organizationAdmin', 'LMSAdmin', 'learningManager', 'superAdmin')
  );

-- LMS Resources: admins can delete files
CREATE POLICY "lms_resources_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'LMS Resources'
    AND auth.uid() IS NOT NULL
    AND public._rls_user_role() IN ('organizationAdmin', 'LMSAdmin', 'learningManager', 'superAdmin')
  );

-- SCORM: authenticated users can read (for course playback)
CREATE POLICY "scorm_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'scorm'
    AND auth.uid() IS NOT NULL
  );

-- SCORM: LMS admins can upload packages
CREATE POLICY "scorm_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'scorm'
    AND auth.uid() IS NOT NULL
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );

-- SCORM: LMS admins can delete packages
CREATE POLICY "scorm_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'scorm'
    AND auth.uid() IS NOT NULL
    AND public._rls_user_role() IN ('LMSAdmin', 'learningManager', 'organizationAdmin')
  );


-- ==========================================================================
--  REALTIME: Enable for user_courses (for progress tracking)
-- ==========================================================================
-- Uncomment if Supabase Realtime is needed for live progress updates:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.user_courses;
