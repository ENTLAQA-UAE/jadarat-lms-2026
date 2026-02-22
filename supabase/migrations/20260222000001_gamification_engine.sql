-- ============================================================
-- Migration: Gamification Engine (Phase 1, Task 3)
-- ============================================================
-- Adds:
--   1. Level definitions table
--   2. Learner XP + level tracking
--   3. Streak tracking table
--   4. Challenge templates + learner challenge instances
--   5. Gamification config per organization
--   6. RPCs for reading/updating gamification state

-- ============================================================
-- 1. Gamification Config (per organization)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gamification_config (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  levels_enabled   BOOLEAN      NOT NULL DEFAULT true,
  streaks_enabled  BOOLEAN      NOT NULL DEFAULT true,
  challenges_enabled BOOLEAN    NOT NULL DEFAULT true,
  streak_type      TEXT         NOT NULL DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly')),
  max_streak_freezes INT        NOT NULL DEFAULT 3,
  freeze_cost_points INT        NOT NULL DEFAULT 50,
  milestone_xp_bonus INT        NOT NULL DEFAULT 50,
  streak_milestones  INT[]      NOT NULL DEFAULT '{7,14,30,60,100}',
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- ============================================================
-- 2. Level Definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.level_definitions (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  level            INT          NOT NULL,
  name             TEXT         NOT NULL,
  xp_threshold     INT          NOT NULL DEFAULT 0,
  color            TEXT         NOT NULL DEFAULT 'bg-slate-400',
  enabled          BOOLEAN      NOT NULL DEFAULT true,
  UNIQUE(organization_id, level)
);

-- ============================================================
-- 3. Learner XP / Level Tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_xp (
  id               SERIAL       PRIMARY KEY,
  user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp         INT          NOT NULL DEFAULT 0,
  current_level    INT          NOT NULL DEFAULT 1,
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id               SERIAL       PRIMARY KEY,
  user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  xp_amount        INT          NOT NULL,
  source           TEXT         NOT NULL, -- 'course_completed', 'quiz_passed', 'challenge_bonus', etc.
  source_id        INT,                   -- optional reference to specific entity
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

-- ============================================================
-- 4. Streak Tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_streaks (
  id                SERIAL       PRIMARY KEY,
  user_id           UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak    INT          NOT NULL DEFAULT 0,
  longest_streak    INT          NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_freezes_remaining INT   NOT NULL DEFAULT 3,
  is_active         BOOLEAN      NOT NULL DEFAULT false,
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.streak_history (
  id               SERIAL       PRIMARY KEY,
  user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  streak_date      DATE         NOT NULL,
  was_freeze       BOOLEAN      NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_streak_history_user ON public.streak_history(user_id, streak_date DESC);

-- ============================================================
-- 5. Challenge Templates (admin-configured)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenge_templates (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  title            TEXT         NOT NULL,
  description      TEXT,
  type             TEXT         NOT NULL CHECK (type IN ('courses_completed', 'quizzes_passed', 'login_streak', 'points_earned', 'time_spent')),
  goal             INT          NOT NULL DEFAULT 1,
  duration_days    INT          NOT NULL DEFAULT 7,
  xp_reward        INT          NOT NULL DEFAULT 100,
  enabled          BOOLEAN      NOT NULL DEFAULT true,
  recurring        BOOLEAN      NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. Learner Challenge Instances
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_challenges (
  id                SERIAL       PRIMARY KEY,
  user_id           UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  template_id       INT          NOT NULL REFERENCES public.challenge_templates(id) ON DELETE CASCADE,
  progress          INT          NOT NULL DEFAULT 0,
  start_date        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  end_date          TIMESTAMPTZ  NOT NULL,
  is_completed      BOOLEAN      NOT NULL DEFAULT false,
  completed_at      TIMESTAMPTZ,
  xp_awarded        BOOLEAN      NOT NULL DEFAULT false
);

CREATE INDEX idx_learner_challenges_user ON public.learner_challenges(user_id, is_completed);

-- ============================================================
-- 7. RLS Policies
-- ============================================================
ALTER TABLE public.gamification_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_challenges ENABLE ROW LEVEL SECURITY;

-- Learners can read their own data
CREATE POLICY "Users can view own XP" ON public.learner_xp FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own XP transactions" ON public.xp_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own streaks" ON public.learner_streaks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own streak history" ON public.streak_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can view own challenges" ON public.learner_challenges FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Org-level data viewable by org members
CREATE POLICY "Org members view gamification config" ON public.gamification_config FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org members view level definitions" ON public.level_definitions FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org members view challenge templates" ON public.challenge_templates FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- ============================================================
-- 8. RPC: Get learner gamification profile
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_learner_gamification_profile()
RETURNS TABLE (
  total_xp         int,
  current_level    int,
  level_name       text,
  current_streak   int,
  longest_streak   int,
  streak_active    boolean,
  streak_freezes   int,
  active_challenges bigint,
  completed_challenges bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    COALESCE(lx.total_xp, 0) AS total_xp,
    COALESCE(lx.current_level, 1) AS current_level,
    COALESCE(ld.name, 'Newcomer') AS level_name,
    COALESCE(ls.current_streak, 0) AS current_streak,
    COALESCE(ls.longest_streak, 0) AS longest_streak,
    COALESCE(ls.is_active, false) AS streak_active,
    COALESCE(ls.streak_freezes_remaining, 0) AS streak_freezes,
    (SELECT count(*) FROM learner_challenges lc WHERE lc.user_id = auth.uid() AND NOT lc.is_completed AND lc.end_date > now()) AS active_challenges,
    (SELECT count(*) FROM learner_challenges lc WHERE lc.user_id = auth.uid() AND lc.is_completed) AS completed_challenges
  FROM (SELECT auth.uid() AS uid) AS u
  LEFT JOIN learner_xp lx ON lx.user_id = u.uid
  LEFT JOIN learner_streaks ls ON ls.user_id = u.uid
  LEFT JOIN level_definitions ld ON ld.level = COALESCE(lx.current_level, 1)
    AND ld.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  LIMIT 1;
$$;

-- ============================================================
-- 9. RPC: Award XP (with auto level-up check)
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id  uuid,
  p_amount   int,
  p_source   text,
  p_source_id int DEFAULT NULL
)
RETURNS TABLE (new_total_xp int, new_level int, leveled_up boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _old_level   int;
  _new_total   int;
  _new_level   int;
  _org_id      int;
BEGIN
  -- Get org
  SELECT organization_id INTO _org_id FROM users WHERE id = p_user_id;

  -- Upsert learner_xp
  INSERT INTO learner_xp (user_id, total_xp, current_level)
  VALUES (p_user_id, p_amount, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET total_xp = learner_xp.total_xp + p_amount, updated_at = now();

  -- Record transaction
  INSERT INTO xp_transactions (user_id, xp_amount, source, source_id)
  VALUES (p_user_id, p_amount, p_source, p_source_id);

  -- Get current state
  SELECT total_xp, current_level INTO _new_total, _old_level
  FROM learner_xp WHERE user_id = p_user_id;

  -- Compute new level
  SELECT COALESCE(MAX(ld.level), 1) INTO _new_level
  FROM level_definitions ld
  WHERE ld.organization_id = _org_id
    AND ld.enabled = true
    AND ld.xp_threshold <= _new_total;

  -- Update level
  UPDATE learner_xp SET current_level = _new_level WHERE user_id = p_user_id;

  RETURN QUERY SELECT _new_total, _new_level, (_new_level > _old_level);
END;
$$;

-- ============================================================
-- 10. RPC: Record streak activity
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_streak_activity(p_user_id uuid)
RETURNS TABLE (current_streak int, is_milestone boolean, milestone_value int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _today        date := current_date;
  _last_date    date;
  _streak       int;
  _longest      int;
  _is_milestone boolean := false;
  _milestone    int := 0;
  _org_id       int;
  _milestones   int[];
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = p_user_id;
  SELECT streak_milestones INTO _milestones FROM gamification_config WHERE organization_id = _org_id;
  IF _milestones IS NULL THEN _milestones := '{7,14,30,60,100}'; END IF;

  -- Upsert streak record
  INSERT INTO learner_streaks (user_id, current_streak, longest_streak, last_activity_date, is_active)
  VALUES (p_user_id, 1, 1, _today, true)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_activity_date, current_streak, longest_streak
  INTO _last_date, _streak, _longest
  FROM learner_streaks WHERE user_id = p_user_id;

  -- Already recorded today
  IF _last_date = _today THEN
    RETURN QUERY SELECT _streak, false, 0;
    RETURN;
  END IF;

  -- Check continuity
  IF _last_date = _today - 1 THEN
    _streak := _streak + 1;
  ELSE
    _streak := 1; -- streak broken
  END IF;

  IF _streak > _longest THEN _longest := _streak; END IF;

  -- Check milestone
  IF _streak = ANY(_milestones) THEN
    _is_milestone := true;
    _milestone := _streak;
  END IF;

  -- Update
  UPDATE learner_streaks
  SET current_streak = _streak, longest_streak = _longest,
      last_activity_date = _today, is_active = true, updated_at = now()
  WHERE user_id = p_user_id;

  -- Record history
  INSERT INTO streak_history (user_id, streak_date) VALUES (p_user_id, _today);

  RETURN QUERY SELECT _streak, _is_milestone, _milestone;
END;
$$;
