-- Add feature flags to subscription_tiers so features are controlled at the tier level
ALTER TABLE public.subscription_tiers
  ADD COLUMN IF NOT EXISTS create_courses   BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_builder       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS document_builder BOOLEAN NOT NULL DEFAULT false;

-- Drop and recreate functions whose return type or parameters changed
DROP FUNCTION IF EXISTS public.get_subscription_tiers_with_org_count();
DROP FUNCTION IF EXISTS public.create_new_organization(text, text, text, boolean, boolean, boolean);
DROP FUNCTION IF EXISTS public.update_organization_details(int, text, text, text, boolean, boolean, boolean);

-- Recreate get_subscription_tiers_with_org_count with new feature columns
CREATE OR REPLACE FUNCTION public.get_subscription_tiers_with_org_count()
RETURNS TABLE (
  id                       int,
  tier_name                text,
  max_user                 int,
  max_courses              int,
  max_lms_managers         int,
  created_at               timestamptz,
  associated_organizations bigint,
  create_courses           boolean,
  ai_builder               boolean,
  document_builder         boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT st.id, st.tier_name, st.max_user, st.max_courses, st.max_lms_managers,
         st.created_at,
         count(s.id) AS associated_organizations,
         st.create_courses, st.ai_builder, st.document_builder
  FROM subscription_tiers st
  LEFT JOIN subscriptions s ON s.subscription_tier = st.id
  GROUP BY st.id
  ORDER BY st.tier_name;
$$;

-- Update create_new_organization: features are now inherited from the tier
CREATE OR REPLACE FUNCTION public.create_new_organization(
  org_domain        text,
  org_name          text,
  org_sub_tier_name text
)
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id  int;
  _tier    record;
BEGIN
  INSERT INTO organization (domain) VALUES (org_domain) RETURNING id INTO _org_id;

  SELECT id, create_courses, ai_builder, document_builder
  INTO _tier
  FROM subscription_tiers WHERE tier_name = org_sub_tier_name LIMIT 1;

  INSERT INTO organization_settings (
    organization_id, name, create_courses, ai_builder, document_builder,
    registeration_enabled, registeration_require_approval, registeration_require_specific_domain,
    course_expiration_enabled, course_self_entrollment_policy
  ) VALUES (
    _org_id, org_name,
    COALESCE(_tier.create_courses, true),
    COALESCE(_tier.ai_builder, false),
    COALESCE(_tier.document_builder, false),
    false, false, false, false, 'lms'
  );

  IF _tier.id IS NOT NULL THEN
    INSERT INTO subscriptions (organization_id, subscription_tier, start_date, expires_at)
    VALUES (_org_id, _tier.id, now()::text, (now() + interval '1 year')::text);
  END IF;

  RETURN _org_id;
END;
$$;

-- Update update_organization_details: features are inherited from the new tier
CREATE OR REPLACE FUNCTION public.update_organization_details(
  org_id                   int,
  new_domain               text,
  new_name                 text,
  new_subscription_package text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _tier record;
BEGIN
  UPDATE organization SET domain = new_domain WHERE id = org_id;

  SELECT id, create_courses, ai_builder, document_builder
  INTO _tier
  FROM subscription_tiers WHERE tier_name = new_subscription_package LIMIT 1;

  UPDATE organization_settings SET
    name             = new_name,
    ai_builder       = COALESCE(_tier.ai_builder, false),
    document_builder = COALESCE(_tier.document_builder, false),
    create_courses   = COALESCE(_tier.create_courses, true)
  WHERE organization_id = org_id;

  IF _tier.id IS NOT NULL THEN
    UPDATE subscriptions SET subscription_tier = _tier.id
    WHERE organization_id = org_id;
  END IF;
END;
$$;
