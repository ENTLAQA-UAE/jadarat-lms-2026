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
