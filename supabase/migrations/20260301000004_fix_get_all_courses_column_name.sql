-- Fix: get_all_courses returns 'id' but the frontend expects 'course_id'
-- This causes edit links to go to /edit-course/undefined and delete to pass undefined

-- Drop the old 2-param overload from the baseline migration (avoids ambiguity)
DROP FUNCTION IF EXISTS public.get_all_courses(text, text);

-- Drop the 3-param version so we can recreate it with the correct return column name
DROP FUNCTION IF EXISTS public.get_all_courses(text, text, text);

-- Recreate with course_id in the return table to match the frontend type
CREATE OR REPLACE FUNCTION public.get_all_courses(
  _name_filter     text DEFAULT NULL,
  _category_filter text DEFAULT NULL,
  _status_filter   text DEFAULT NULL
)
RETURNS TABLE (
  course_id       int,
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
  SELECT c.id AS course_id, c.title AS name, cat.name AS category, cat.image AS category_image,
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
