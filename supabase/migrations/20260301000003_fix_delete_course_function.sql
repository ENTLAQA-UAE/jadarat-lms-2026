-- Fix: Ensure delete_course_and_related_user_courses function exists
-- The baseline migration defined it but it may not have been created in the database

CREATE OR REPLACE FUNCTION public.delete_course_and_related_user_courses(p_course_id int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM user_certificates WHERE course_id = p_course_id;
  DELETE FROM user_courses      WHERE course_id = p_course_id;
  DELETE FROM certificates      WHERE course   = p_course_id;
  DELETE FROM courses           WHERE id       = p_course_id;
END;
$$;
