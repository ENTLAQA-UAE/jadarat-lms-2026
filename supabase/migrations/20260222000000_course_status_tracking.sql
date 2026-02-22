-- ============================================================
-- Migration: Course Status Tracking (Phase 1, Task 2)
-- ============================================================
-- Adds:
--   1. Default 'draft' status for courses
--   2. Enrollment status derived column
--   3. Status audit trail table
--   4. Updated RPC: get_all_courses with _status_filter
--   5. Updated RPC: get_enrollment_activity with enrollment_status + _enrollment_status filter
--   6. New RPC: update_course_status with audit logging

-- ============================================================
-- 1. Set default status on courses table
-- ============================================================
ALTER TABLE public.courses
  ALTER COLUMN status SET DEFAULT 'draft';

-- Backfill: set any NULL statuses to 'draft'
UPDATE public.courses SET status = 'draft' WHERE status IS NULL;

-- ============================================================
-- 2. Status Audit Trail table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.status_audit_log (
  id            SERIAL        PRIMARY KEY,
  entity_type   TEXT          NOT NULL,  -- 'course' or 'enrollment'
  entity_id     INT           NOT NULL,
  old_status    TEXT,
  new_status    TEXT          NOT NULL,
  changed_by    UUID          REFERENCES public.users(id) ON DELETE SET NULL,
  changed_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_audit_entity ON public.status_audit_log(entity_type, entity_id);
CREATE INDEX idx_status_audit_changed_at ON public.status_audit_log(changed_at DESC);

-- RLS for status_audit_log
ALTER TABLE public.status_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs for their org"
  ON public.status_audit_log FOR SELECT
  TO authenticated
  USING (
    changed_by IN (
      SELECT id FROM public.users
      WHERE organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can insert audit logs"
  ON public.status_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (changed_by = auth.uid());

-- ============================================================
-- 3. Updated get_all_courses RPC (with _status_filter)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_all_courses(
  _name_filter     text DEFAULT NULL,
  _category_filter text DEFAULT NULL,
  _status_filter   text DEFAULT NULL
)
RETURNS TABLE (
  id              int,
  name            text,
  category        text,
  category_image  text,
  created_at      timestamptz,
  created_by_name text,
  enrollments     bigint,
  completions     bigint,
  status          text,
  thumbnail       text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.title AS name, cat.name AS category, cat.image AS category_image,
         c.created_at,
         COALESCE(u.name, '') AS created_by_name,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id) AS enrollments,
         (SELECT count(*) FROM user_courses uc WHERE uc.course_id = c.id AND uc.status = 'completed') AS completions,
         COALESCE(c.status, 'draft') AS status, c.thumbnail
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN users u ON c.created_by = u.id
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name_filter IS NULL OR c.title ILIKE '%' || _name_filter || '%')
    AND (_category_filter IS NULL OR cat.name ILIKE '%' || _category_filter || '%')
    AND (_status_filter IS NULL OR COALESCE(c.status, 'draft') = _status_filter)
  ORDER BY c.created_at DESC;
$$;

-- ============================================================
-- 4. Updated get_enrollment_activity RPC (with enrollment_status)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_enrollment_activity(
  _name              text DEFAULT NULL,
  _course            text DEFAULT NULL,
  _department        text DEFAULT NULL,
  _group_name        text DEFAULT NULL,
  _start_date        text DEFAULT NULL,
  _end_date          text DEFAULT NULL,
  _enrollment_status text DEFAULT NULL
)
RETURNS TABLE (
  enrollment_id       int,
  user_id             uuid,
  name                text,
  course              text,
  thumbnail           text,
  enrollment_date     timestamptz,
  progress_percentage numeric,
  completion_date     timestamptz,
  course_id           int,
  email               text,
  department          text,
  group_name          text,
  enrollment_status   text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT uc.id AS enrollment_id, u.id AS user_id, u.name,
         c.title AS course, c.thumbnail,
         uc.created_at AS enrollment_date,
         uc.progress::numeric AS progress_percentage,
         uc.completed_at AS completion_date,
         c.id AS course_id, u.email, u.department,
         g.name AS group_name,
         CASE
           WHEN uc.status = 'completed' OR uc.progress::numeric >= 100 THEN 'completed'
           WHEN uc.status = 'failed' THEN 'failed'
           WHEN uc.status = 'expired' THEN 'expired'
           WHEN uc.status = 'overdue' THEN 'overdue'
           WHEN uc.progress::numeric > 0 THEN 'in_progress'
           ELSE 'not_started'
         END AS enrollment_status
  FROM user_courses uc
  JOIN users u ON uc.user_id = u.id
  JOIN courses c ON uc.course_id = c.id
  LEFT JOIN groups g ON u.group_id = g.id
  WHERE u.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (_name IS NULL OR u.name ILIKE '%' || _name || '%')
    AND (_course IS NULL OR c.title ILIKE '%' || _course || '%')
    AND (_department IS NULL OR u.department ILIKE '%' || _department || '%')
    AND (_group_name IS NULL OR g.name ILIKE '%' || _group_name || '%')
    AND (_start_date IS NULL OR uc.created_at >= _start_date::timestamptz)
    AND (_end_date IS NULL OR uc.created_at <= _end_date::timestamptz)
    AND (_enrollment_status IS NULL OR
      CASE
        WHEN uc.status = 'completed' OR uc.progress::numeric >= 100 THEN 'completed'
        WHEN uc.status = 'failed' THEN 'failed'
        WHEN uc.status = 'expired' THEN 'expired'
        WHEN uc.status = 'overdue' THEN 'overdue'
        WHEN uc.progress::numeric > 0 THEN 'in_progress'
        ELSE 'not_started'
      END = _enrollment_status
    )
  ORDER BY uc.created_at DESC;
$$;

-- ============================================================
-- 5. New RPC: update_course_status (with audit logging)
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_course_status(
  p_course_id  int,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _old_status text;
  _user_id    uuid := auth.uid();
  _org_id     int;
BEGIN
  -- Verify the user is an LMSAdmin in the same org as the course
  SELECT organization_id INTO _org_id FROM users WHERE id = _user_id;

  IF NOT EXISTS (
    SELECT 1 FROM courses WHERE id = p_course_id AND organization_id = _org_id
  ) THEN
    RAISE EXCEPTION 'Course not found or access denied';
  END IF;

  -- Validate status value
  IF p_new_status NOT IN ('draft', 'private', 'published') THEN
    RAISE EXCEPTION 'Invalid status: %. Must be draft, private, or published', p_new_status;
  END IF;

  -- Get old status
  SELECT COALESCE(status, 'draft') INTO _old_status FROM courses WHERE id = p_course_id;

  -- Update the course status
  UPDATE courses SET status = p_new_status WHERE id = p_course_id;

  -- Log to audit trail
  INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by)
  VALUES ('course', p_course_id, _old_status, p_new_status, _user_id);
END;
$$;
