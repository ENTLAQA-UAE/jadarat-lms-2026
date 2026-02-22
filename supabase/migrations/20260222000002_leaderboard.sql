-- ============================================================
-- Migration: Leaderboard System (Phase 1, Task 4)
-- ============================================================
-- Adds:
--   1. Leaderboard configuration per organization
--   2. Leaderboard snapshots for historical rankings
--   3. RPC for fetching leaderboard rankings
--   4. RPC for fetching a learner's own rank

-- ============================================================
-- 1. Leaderboard Config (per organization)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard_config (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  enabled          BOOLEAN      NOT NULL DEFAULT true,
  show_top_n       INT          NOT NULL DEFAULT 50,
  anonymize_names  BOOLEAN      NOT NULL DEFAULT false,
  show_department  BOOLEAN      NOT NULL DEFAULT true,
  show_level       BOOLEAN      NOT NULL DEFAULT true,
  show_streak      BOOLEAN      NOT NULL DEFAULT true,
  reset_period     TEXT         NOT NULL DEFAULT 'none' CHECK (reset_period IN ('none', 'weekly', 'monthly', 'quarterly')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- ============================================================
-- 2. Leaderboard Snapshots (periodic captures)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rank             INT          NOT NULL,
  total_xp         INT          NOT NULL DEFAULT 0,
  level            INT          NOT NULL DEFAULT 1,
  period_label     TEXT         NOT NULL, -- e.g. '2026-W08', '2026-02', '2026-Q1'
  snapshot_date    DATE         NOT NULL DEFAULT current_date,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_leaderboard_snapshots_org_period
  ON public.leaderboard_snapshots(organization_id, period_label, rank);

CREATE INDEX idx_leaderboard_snapshots_user
  ON public.leaderboard_snapshots(user_id, snapshot_date DESC);

-- ============================================================
-- 3. RLS Policies
-- ============================================================
ALTER TABLE public.leaderboard_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- Org members can view their org's leaderboard config
CREATE POLICY "Org members view leaderboard config"
  ON public.leaderboard_config FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Org members can view their org's leaderboard snapshots
CREATE POLICY "Org members view leaderboard snapshots"
  ON public.leaderboard_snapshots FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================
-- 4. RPC: Get Leaderboard Rankings (live from learner_xp)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_limit   INT DEFAULT 50,
  p_offset  INT DEFAULT 0
)
RETURNS TABLE (
  rank         bigint,
  user_id      uuid,
  display_name text,
  total_xp     int,
  current_level int,
  level_name   text,
  level_color  text,
  current_streak int
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      ROW_NUMBER() OVER (ORDER BY lx.total_xp DESC, lx.updated_at ASC) AS rank,
      lx.user_id,
      COALESCE(u.first_name || ' ' || u.last_name, u.email) AS display_name,
      lx.total_xp,
      lx.current_level,
      COALESCE(ld.name, 'Newcomer') AS level_name,
      COALESCE(ld.color, 'bg-slate-400') AS level_color,
      COALESCE(ls.current_streak, 0) AS current_streak
    FROM learner_xp lx
    JOIN users u ON u.id = lx.user_id
    LEFT JOIN level_definitions ld
      ON ld.level = lx.current_level
      AND ld.organization_id = u.organization_id
    LEFT JOIN learner_streaks ls ON ls.user_id = lx.user_id
    WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  )
  SELECT * FROM ranked
  ORDER BY rank
  LIMIT p_limit OFFSET p_offset;
$$;

-- ============================================================
-- 5. RPC: Get My Rank
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_leaderboard_rank()
RETURNS TABLE (
  rank         bigint,
  total_xp     int,
  current_level int,
  level_name   text,
  total_learners bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH org_rankings AS (
    SELECT
      lx.user_id,
      lx.total_xp,
      lx.current_level,
      COALESCE(ld.name, 'Newcomer') AS level_name,
      ROW_NUMBER() OVER (ORDER BY lx.total_xp DESC, lx.updated_at ASC) AS rank
    FROM learner_xp lx
    JOIN users u ON u.id = lx.user_id
    LEFT JOIN level_definitions ld
      ON ld.level = lx.current_level
      AND ld.organization_id = u.organization_id
    WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  )
  SELECT
    r.rank,
    r.total_xp,
    r.current_level,
    r.level_name,
    (SELECT COUNT(*) FROM org_rankings) AS total_learners
  FROM org_rankings r
  WHERE r.user_id = auth.uid();
$$;

-- ============================================================
-- 6. RPC: Take Leaderboard Snapshot
-- ============================================================
CREATE OR REPLACE FUNCTION public.take_leaderboard_snapshot(p_period_label TEXT)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id   INT;
  _inserted INT;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  INSERT INTO leaderboard_snapshots (organization_id, user_id, rank, total_xp, level, period_label)
  SELECT
    _org_id,
    lx.user_id,
    ROW_NUMBER() OVER (ORDER BY lx.total_xp DESC, lx.updated_at ASC),
    lx.total_xp,
    lx.current_level,
    p_period_label
  FROM learner_xp lx
  JOIN users u ON u.id = lx.user_id
  WHERE u.organization_id = _org_id;

  GET DIAGNOSTICS _inserted = ROW_COUNT;
  RETURN _inserted;
END;
$$;
