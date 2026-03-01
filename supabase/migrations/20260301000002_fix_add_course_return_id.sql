-- Fix: add_course should return the new course ID so the frontend can redirect properly
-- Previously returned void, causing courseId to be null/undefined after creation

-- Drop the void-returning version
DROP FUNCTION IF EXISTS public.add_course(int, text, text, int, text, text, text, text, text, boolean, text, text);

-- Drop any bigint overload that may exist from a previous attempted fix
DROP FUNCTION IF EXISTS public.add_course(bigint, text, text, bigint, text, bigint, text, text, jsonb, boolean, text, text);

-- Recreate with RETURNS bigint so the frontend receives the new course ID
CREATE OR REPLACE FUNCTION public.add_course(
  _organization_id int,
  _title           text,
  _description     text,
  _category_id     int,
  _level           text,
  _completion_time text,
  _slug            text,
  _image_preview   text,
  _outcomes        text DEFAULT '[]',
  _is_scorm        boolean DEFAULT false,
  _scorm_version   text DEFAULT NULL,
  _launch_path     text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_course_id bigint;
BEGIN
  INSERT INTO courses (
    organization_id, title, description, category_id, level, timeline,
    slug, thumbnail, outcomes, is_scorm, scorm_version, launch_path, created_by
  ) VALUES (
    _organization_id, _title, _description, _category_id,
    _level::public.courselevel, _completion_time,
    _slug, _image_preview, _outcomes::jsonb,
    _is_scorm, _scorm_version, _launch_path, auth.uid()
  )
  RETURNING id INTO new_course_id;

  RETURN new_course_id;
END;
$$;
