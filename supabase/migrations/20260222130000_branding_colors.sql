-- Add primary_color and secondary_color to update_organization_branding RPC
-- so org admins can control their tenant colors from the branding settings UI.
--
-- The original function had signature (new_logo text, new_auth text, new_name text, orgid int).
-- Adding params with defaults would create an overload rather than replacing it,
-- so we must drop the old version first.

DROP FUNCTION IF EXISTS public.update_organization_branding(text, text, text, int);
DROP FUNCTION IF EXISTS public.update_organization_branding(text, text, text, int, text, text);

CREATE OR REPLACE FUNCTION public.update_organization_branding(
  orgid int,
  new_logo text DEFAULT NULL,
  new_auth text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_primary_color text DEFAULT NULL,
  new_secondary_color text DEFAULT NULL
)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE organization_settings
  SET
    logo            = COALESCE(new_logo, logo),
    auth_bg         = COALESCE(new_auth, auth_bg),
    name            = COALESCE(new_name, name),
    primary_color   = COALESCE(new_primary_color, primary_color),
    secondary_color = COALESCE(new_secondary_color, secondary_color)
  WHERE organization_id = orgid;
$$;
