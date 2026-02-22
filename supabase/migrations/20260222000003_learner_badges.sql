-- ============================================================
-- Migration: Learner Badges System
-- ============================================================
-- Adds:
--   1. Badge definitions (admin-configured per organization)
--   2. Learner badge awards (tracking which badges each learner has earned)
--   3. RPCs for awarding badges and querying badge progress
--
-- Badge triggers:
--   - points_reached: Earn N total points
--   - courses_completed: Complete N courses
--   - quizzes_passed: Pass N quizzes
--   - streak_reached: Reach N-day streak
--   - perfect_quizzes: Score 100% on N quizzes
--   - certificates_earned: Earn N certificates
--   - challenges_completed: Complete N challenges
--   - level_reached: Reach level N

-- ============================================================
-- 1. Badge Definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id               SERIAL       PRIMARY KEY,
  organization_id  INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  name             TEXT         NOT NULL,
  description      TEXT,
  icon             TEXT         NOT NULL DEFAULT 'trophy',   -- icon key for frontend
  color            TEXT         NOT NULL DEFAULT 'bg-yellow-500',
  trigger_type     TEXT         NOT NULL CHECK (trigger_type IN (
    'points_reached', 'courses_completed', 'quizzes_passed', 'streak_reached',
    'perfect_quizzes', 'certificates_earned', 'challenges_completed', 'level_reached'
  )),
  trigger_value    INT          NOT NULL DEFAULT 1,         -- threshold to earn the badge
  points_reward    INT          NOT NULL DEFAULT 0,         -- bonus points awarded when badge is earned
  enabled          BOOLEAN      NOT NULL DEFAULT true,
  sort_order       INT          NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_badge_definitions_org ON public.badge_definitions(organization_id, enabled);

-- ============================================================
-- 2. Learner Badge Awards
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_badges (
  id               SERIAL       PRIMARY KEY,
  user_id          UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id         INT          NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  awarded_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_learner_badges_user ON public.learner_badges(user_id);

-- ============================================================
-- 3. RLS Policies
-- ============================================================
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_badges ENABLE ROW LEVEL SECURITY;

-- Badge definitions are visible to all org members
CREATE POLICY "Org members view badge definitions" ON public.badge_definitions
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Learners can see their own badges
CREATE POLICY "Users can view own badges" ON public.learner_badges
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Learners can also see other users' badges (for profile / leaderboard)
CREATE POLICY "Users can view all badges in org" ON public.learner_badges
  FOR SELECT TO authenticated
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    )
  );

-- ============================================================
-- 4. RPC: Award a badge to a learner
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_badge(
  p_user_id   uuid,
  p_badge_id  int
)
RETURNS TABLE (awarded boolean, points_rewarded int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _already_has boolean;
  _reward      int;
BEGIN
  -- Check if already earned
  SELECT EXISTS(
    SELECT 1 FROM learner_badges WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO _already_has;

  IF _already_has THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Get reward amount
  SELECT points_reward INTO _reward FROM badge_definitions WHERE id = p_badge_id;

  -- Award badge
  INSERT INTO learner_badges (user_id, badge_id) VALUES (p_user_id, p_badge_id);

  -- Award bonus points if configured
  IF _reward > 0 THEN
    PERFORM award_xp(p_user_id, _reward, 'badge_earned', p_badge_id);
  END IF;

  RETURN QUERY SELECT true, COALESCE(_reward, 0);
END;
$$;

-- ============================================================
-- 5. RPC: Get learner badge progress
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_learner_badges(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  badge_id      int,
  badge_name    text,
  description   text,
  icon          text,
  color         text,
  trigger_type  text,
  trigger_value int,
  points_reward int,
  sort_order    int,
  is_earned     boolean,
  awarded_at    timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    bd.id AS badge_id,
    bd.name AS badge_name,
    bd.description,
    bd.icon,
    bd.color,
    bd.trigger_type,
    bd.trigger_value,
    bd.points_reward,
    bd.sort_order,
    (lb.id IS NOT NULL) AS is_earned,
    lb.awarded_at
  FROM badge_definitions bd
  LEFT JOIN learner_badges lb ON lb.badge_id = bd.id AND lb.user_id = COALESCE(p_user_id, auth.uid())
  WHERE bd.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND bd.enabled = true
  ORDER BY bd.sort_order, bd.id;
$$;
