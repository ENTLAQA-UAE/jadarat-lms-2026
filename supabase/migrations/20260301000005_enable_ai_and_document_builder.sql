-- Enable ai_builder and document_builder for all existing subscription tiers
-- and organization settings so that the features are available by default.
-- Previously these columns were added with DEFAULT false, leaving all existing
-- organisations locked out of AI and Document course creation.

UPDATE public.subscription_tiers
SET ai_builder       = true,
    document_builder = true;

UPDATE public.organization_settings
SET ai_builder       = true,
    document_builder = true;

-- Create a SECURITY DEFINER RPC to fetch org feature flags.
-- The previous code queried organization_settings directly with the anon key,
-- which can fail silently under RLS even for authenticated users.
CREATE OR REPLACE FUNCTION public.get_org_feature_flags(p_org_id int)
RETURNS TABLE (
  ai_builder       boolean,
  document_builder boolean,
  create_courses   boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT os.ai_builder, os.document_builder, os.create_courses
  FROM organization_settings os
  WHERE os.organization_id = p_org_id;
$$;
