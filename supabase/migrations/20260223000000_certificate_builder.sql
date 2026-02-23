-- Certificate Builder: Add JSONB column for custom certificate templates
-- Replaces the Placid-based template system (global_certificates + certificate_template FK)

ALTER TABLE organization_settings
  ADD COLUMN IF NOT EXISTS certificate_template_json JSONB;

COMMENT ON COLUMN organization_settings.certificate_template_json IS
  'JSONB certificate template created via the drag-and-drop builder. Schema version 1.';
