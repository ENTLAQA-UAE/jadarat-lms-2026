-- ============================================================================
-- Jadarat LMS – Phase 2 Gap Fixes
-- ============================================================================
-- 1. get_org_ai_config_with_key — returns encrypted API key (server-side only)
-- 2. ai_usage_log — tracks per-request usage for rate limiting
-- 3. check_ai_rate_limit — enforces rpm/rpd limits
-- 4. log_ai_usage — records a usage event
-- ============================================================================


-- ==========  1. RPC: get_org_ai_config_with_key  ==========
-- Same as get_org_ai_config but INCLUDES the encrypted API key.
-- Used server-side by API routes (never exposed to client).

CREATE OR REPLACE FUNCTION public.get_org_ai_config_with_key()
RETURNS TABLE (
  id                      INT,
  organization_id         INT,
  provider                TEXT,
  model                   TEXT,
  api_key_encrypted       TEXT,
  system_prompt           TEXT,
  temperature             NUMERIC,
  max_tokens              INT,
  rate_limit_rpm          INT,
  rate_limit_rpd          INT,
  chat_enabled            BOOLEAN,
  search_enabled          BOOLEAN,
  recommendations_enabled BOOLEAN,
  created_at              TIMESTAMPTZ,
  updated_at              TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.organization_id, c.provider::text, c.model,
         c.api_key_encrypted,
         c.system_prompt, c.temperature, c.max_tokens,
         c.rate_limit_rpm, c.rate_limit_rpd,
         c.chat_enabled, c.search_enabled, c.recommendations_enabled,
         c.created_at, c.updated_at
  FROM org_ai_config c
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;


-- ==========  2. TABLE: ai_usage_log  ==========
-- One row per AI API call, used for rate limiting and usage tracking.

CREATE TABLE public.ai_usage_log (
  id                SERIAL        PRIMARY KEY,
  organization_id   INT           NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  user_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint          TEXT          NOT NULL,  -- 'chat', 'search', 'embeddings'
  tokens_used       INT           DEFAULT 0,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_usage_log_org_time ON public.ai_usage_log (organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_log_user_time ON public.ai_usage_log (user_id, created_at DESC);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage logs for their org
CREATE POLICY "Admins can view org usage logs"
  ON public.ai_usage_log FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('organizationAdmin', 'LMSAdmin', 'superAdmin')
  );

-- Any authenticated user can insert (server-side via SECURITY DEFINER functions)
CREATE POLICY "System can insert usage logs"
  ON public.ai_usage_log FOR INSERT
  WITH CHECK (true);


-- ==========  3. RPC: check_ai_rate_limit  ==========
-- Returns whether the user is within their org's rate limits.
-- Checks both per-minute (rpm) and per-day (rpd) limits.

CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  p_user_id   UUID,
  p_endpoint  TEXT DEFAULT 'chat'
)
RETURNS TABLE (
  allowed           BOOLEAN,
  requests_minute   BIGINT,
  limit_minute      INT,
  requests_day      BIGINT,
  limit_day         INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id       INT;
  _rpm_limit    INT;
  _rpd_limit    INT;
  _rpm_count    BIGINT;
  _rpd_count    BIGINT;
BEGIN
  -- Get org and limits
  SELECT u.organization_id INTO _org_id FROM users u WHERE u.id = p_user_id;

  SELECT c.rate_limit_rpm, c.rate_limit_rpd
    INTO _rpm_limit, _rpd_limit
    FROM org_ai_config c
    WHERE c.organization_id = _org_id;

  -- Default limits if no config exists
  _rpm_limit := COALESCE(_rpm_limit, 30);
  _rpd_limit := COALESCE(_rpd_limit, 500);

  -- Count requests in the last minute (per user)
  SELECT count(*) INTO _rpm_count
    FROM ai_usage_log l
    WHERE l.user_id = p_user_id
      AND l.endpoint = p_endpoint
      AND l.created_at > now() - interval '1 minute';

  -- Count requests in the last 24 hours (per org)
  SELECT count(*) INTO _rpd_count
    FROM ai_usage_log l
    WHERE l.organization_id = _org_id
      AND l.endpoint = p_endpoint
      AND l.created_at > now() - interval '1 day';

  RETURN QUERY SELECT
    (_rpm_count < _rpm_limit AND _rpd_count < _rpd_limit) AS allowed,
    _rpm_count  AS requests_minute,
    _rpm_limit  AS limit_minute,
    _rpd_count  AS requests_day,
    _rpd_limit  AS limit_day;
END;
$$;


-- ==========  4. RPC: log_ai_usage  ==========
-- Records a single usage event. Called after successful AI API calls.

CREATE OR REPLACE FUNCTION public.log_ai_usage(
  p_endpoint    TEXT,
  p_tokens_used INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id INT;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  INSERT INTO ai_usage_log (organization_id, user_id, endpoint, tokens_used)
  VALUES (_org_id, auth.uid(), p_endpoint, p_tokens_used);
END;
$$;


-- ==========  5. Cleanup: purge old usage logs  ==========
-- Optional: auto-purge logs older than 90 days (run via cron or pg_cron).
-- CREATE OR REPLACE FUNCTION public.purge_old_ai_usage_logs()
-- RETURNS void LANGUAGE sql AS $$
--   DELETE FROM ai_usage_log WHERE created_at < now() - interval '90 days';
-- $$;
