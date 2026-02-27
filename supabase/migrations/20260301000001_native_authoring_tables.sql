-- ============================================================
-- Migration: 20260301000001_native_authoring_tables.sql
-- Purpose: Create all tables for native block-based authoring
-- ============================================================

-- 1. Course content (block-based JSON storage)
CREATE TABLE public.course_content (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  content         JSONB NOT NULL DEFAULT '{"modules":[],"settings":{"theme":{"primary_color":"#1a73e8","secondary_color":"#f59e0b","background_color":"#ffffff","text_color":"#1f2937","font_family":"cairo","border_radius":"medium","cover_style":"gradient"},"navigation":"sequential","show_progress_bar":true,"show_lesson_list":true,"completion_criteria":"all_blocks","language":"ar","direction":"rtl"}}',
  version         INT NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  UNIQUE (course_id, version)
);

-- Index for fast lookups by course_id + status
CREATE INDEX idx_course_content_course_status
  ON course_content (course_id, status);

-- 2. Block templates library (reusable across courses within an org)
CREATE TABLE public.block_templates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL CHECK (category IN ('content', 'interactive', 'assessment', 'layout')),
  block_type      TEXT NOT NULL,
  template_data   JSONB NOT NULL,
  thumbnail_url   TEXT,
  is_global       BOOLEAN DEFAULT false,
  usage_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_block_templates_org ON block_templates (organization_id);

-- 3. AI generation audit trail
CREATE TABLE public.ai_generation_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE SET NULL,
  organization_id INT NOT NULL REFERENCES organization(id),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  operation       TEXT NOT NULL CHECK (operation IN (
    'generate_outline', 'generate_lesson', 'generate_quiz',
    'refine_block', 'extract_document', 'generate_image_prompt'
  )),
  model           TEXT NOT NULL,
  input_tokens    INT NOT NULL DEFAULT 0,
  output_tokens   INT NOT NULL DEFAULT 0,
  cost_usd        DECIMAL(10, 6) NOT NULL DEFAULT 0,
  input_summary   TEXT,
  output_summary  TEXT,
  duration_ms     INT,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_gen_log_org ON ai_generation_log (organization_id, created_at DESC);
CREATE INDEX idx_ai_gen_log_course ON ai_generation_log (course_id);

-- 4. Bunny.net video registry (tracks uploaded videos)
CREATE TABLE public.bunny_videos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organization(id),
  bunny_video_id  TEXT NOT NULL UNIQUE,
  bunny_library_id TEXT NOT NULL,
  title           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'uploading'
                    CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
  duration_seconds INT,
  resolutions     TEXT[],                   -- ['240p', '360p', '480p', '720p', '1080p']
  captions        JSONB DEFAULT '[]'::jsonb, -- [{srclang, label}]
  thumbnail_url   TEXT,
  file_size_bytes BIGINT,
  width           INT,
  height          INT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_bunny_videos_org ON bunny_videos (organization_id);

-- 5. Learner block-level progress tracking
CREATE TABLE public.learner_block_progress (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  course_id       INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id       TEXT NOT NULL,
  lesson_id       TEXT NOT NULL,
  block_id        TEXT NOT NULL,
  block_type      TEXT NOT NULL,
  completed       BOOLEAN NOT NULL DEFAULT false,
  score           DECIMAL(5, 2),             -- For assessment blocks (0-100)
  attempts        INT NOT NULL DEFAULT 0,
  time_spent_seconds INT NOT NULL DEFAULT 0,
  response_data   JSONB,                     -- Learner's quiz answers, interactions
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, block_id)
);

CREATE INDEX idx_block_progress_user_course
  ON learner_block_progress (user_id, course_id);

-- 6. Course media assets registry
CREATE TABLE public.course_media (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE CASCADE,
  organization_id INT NOT NULL REFERENCES organization(id),
  media_type      TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'audio', 'document')),
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('bunny_stream', 'bunny_storage', 'supabase')),
  external_id     TEXT,
  url             TEXT NOT NULL,
  title           TEXT,
  file_size_bytes BIGINT,
  mime_type       TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_course_media_course ON course_media (course_id);
CREATE INDEX idx_course_media_org ON course_media (organization_id);

-- 7. ALTER existing courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  authoring_type TEXT DEFAULT 'native' CHECK (authoring_type IN ('native', 'scorm'));

ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  content_id UUID REFERENCES course_content(id);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  bunny_scorm_package_id TEXT;

-- Migrate existing data
UPDATE courses SET authoring_type = 'scorm' WHERE is_scorm = true;
UPDATE courses SET authoring_type = 'native' WHERE is_scorm = false OR is_scorm IS NULL;

-- Deprecate coassemble_id
COMMENT ON COLUMN courses.coassemble_id IS
  'DEPRECATED 2026-03-01: Legacy Coassemble course ID. Do not use in new code.';

-- 8. RLS Policies
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bunny_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_block_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_media ENABLE ROW LEVEL SECURITY;

-- course_content: org admins can CRUD, learners can read published
CREATE POLICY "course_content_admin_all" ON course_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN users u ON u.organization_id = c.organization_id
      WHERE c.id = course_content.course_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

CREATE POLICY "course_content_learner_read" ON course_content
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM user_courses uc
      WHERE uc.course_id = course_content.course_id
        AND uc.user_id = auth.uid()
    )
  );

-- learner_block_progress: users can only access their own
CREATE POLICY "block_progress_own" ON learner_block_progress
  FOR ALL USING (user_id = auth.uid());

-- block_templates: org members can read, admins can write
CREATE POLICY "templates_read_org" ON block_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = block_templates.organization_id
        AND u.id = auth.uid()
    )
  );

CREATE POLICY "templates_admin_write" ON block_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = block_templates.organization_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- bunny_videos: org members can read, admins can write
CREATE POLICY "bunny_videos_read_org" ON bunny_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = bunny_videos.organization_id
        AND u.id = auth.uid()
    )
  );

CREATE POLICY "bunny_videos_admin_write" ON bunny_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = bunny_videos.organization_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- course_media: same pattern as bunny_videos
CREATE POLICY "course_media_read_org" ON course_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = course_media.organization_id
        AND u.id = auth.uid()
    )
  );

CREATE POLICY "course_media_admin_write" ON course_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = course_media.organization_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- ai_generation_log: users can see their own, admins can see all in org
CREATE POLICY "ai_log_own" ON ai_generation_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ai_log_admin" ON ai_generation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = ai_generation_log.organization_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- ============================================================
-- RPC Functions (Section 5.2)
-- ============================================================

-- ============================================================
-- RPC: save_course_content
-- Called by: EditorCanvas save button -> saveContent server action
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_course_content(
  p_course_id   INT,
  p_content     JSONB,
  p_user_id     UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_content_id  UUID;
  v_version     INT;
  v_org_id      INT;
BEGIN
  -- Verify user has access to this course's org
  SELECT c.organization_id INTO v_org_id
  FROM courses c
  JOIN users u ON u.organization_id = c.organization_id
  WHERE c.id = p_course_id
    AND u.id = p_user_id
    AND u.role IN ('LMSAdmin', 'organizationAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: user does not have admin access to this course';
  END IF;

  -- Check if a draft version already exists
  SELECT id, version INTO v_content_id, v_version
  FROM course_content
  WHERE course_id = p_course_id AND status = 'draft'
  ORDER BY version DESC LIMIT 1;

  IF v_content_id IS NOT NULL THEN
    -- Update existing draft
    UPDATE course_content
    SET content = p_content,
        updated_at = now()
    WHERE id = v_content_id;
  ELSE
    -- Get latest version number
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM course_content
    WHERE course_id = p_course_id;

    -- Create new draft
    INSERT INTO course_content (course_id, content, version, status, created_by)
    VALUES (p_course_id, p_content, v_version, 'draft', p_user_id)
    RETURNING id INTO v_content_id;
  END IF;

  -- Update courses table reference
  UPDATE courses SET content_id = v_content_id WHERE id = p_course_id;

  RETURN v_content_id;
END;
$$;

-- ============================================================
-- RPC: publish_course_content
-- Called by: EditorHeader publish button -> publishContent server action
-- ============================================================
CREATE OR REPLACE FUNCTION public.publish_course_content(
  p_course_id   INT,
  p_content_id  UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_org_id INT;
BEGIN
  -- Verify admin access
  SELECT c.organization_id INTO v_org_id
  FROM courses c
  JOIN users u ON u.organization_id = c.organization_id
  WHERE c.id = p_course_id
    AND u.id = auth.uid()
    AND u.role IN ('LMSAdmin', 'organizationAdmin');

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Archive current published version (if any)
  UPDATE course_content
  SET status = 'archived'
  WHERE course_id = p_course_id AND status = 'published';

  -- Publish the target version
  UPDATE course_content
  SET status = 'published',
      published_at = now(),
      updated_at = now()
  WHERE id = p_content_id AND course_id = p_course_id;

  -- Update courses table reference and status
  UPDATE courses
  SET content_id = p_content_id,
      status = 'published'
  WHERE id = p_course_id;
END;
$$;

-- ============================================================
-- RPC: get_course_with_content
-- Called by: Block editor page loader, course player page loader
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_course_with_content(p_course_id INT)
RETURNS TABLE (
  id              INT,
  title           TEXT,
  description     TEXT,
  slug            TEXT,
  category_id     INT,
  level           TEXT,
  timeline        TEXT,
  thumbnail       TEXT,
  status          TEXT,
  authoring_type  TEXT,
  is_scorm        BOOLEAN,
  launch_path     TEXT,
  outcomes        JSONB,
  organization_id INT,
  content_id      UUID,
  content         JSONB,
  content_version INT,
  content_status  TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT
      c.id, c.title, c.description, c.slug,
      c.category_id, c.level::TEXT, c.timeline, c.thumbnail,
      c.status, c.authoring_type, c.is_scorm, c.launch_path,
      c.outcomes, c.organization_id,
      cc.id AS content_id,
      cc.content,
      cc.version AS content_version,
      cc.status AS content_status
    FROM courses c
    LEFT JOIN course_content cc ON cc.id = c.content_id
    WHERE c.id = p_course_id;
END;
$$;

-- ============================================================
-- RPC: update_block_progress
-- Called by: CoursePlayer when learner completes/interacts with a block
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_block_progress(
  p_user_id       UUID,
  p_course_id     INT,
  p_module_id     TEXT,
  p_lesson_id     TEXT,
  p_block_id      TEXT,
  p_block_type    TEXT,
  p_completed     BOOLEAN,
  p_score         DECIMAL DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL,
  p_time_spent    INT DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_blocks    INT;
  v_completed_blocks INT;
  v_new_progress    INT;
BEGIN
  -- Upsert block progress
  INSERT INTO learner_block_progress (
    user_id, course_id, module_id, lesson_id, block_id,
    block_type, completed, score, response_data,
    time_spent_seconds, attempts, completed_at, updated_at
  ) VALUES (
    p_user_id, p_course_id, p_module_id, p_lesson_id, p_block_id,
    p_block_type, p_completed, p_score, p_response_data,
    p_time_spent, 1, CASE WHEN p_completed THEN now() ELSE NULL END, now()
  )
  ON CONFLICT (user_id, course_id, block_id) DO UPDATE SET
    completed = EXCLUDED.completed,
    score = COALESCE(EXCLUDED.score, learner_block_progress.score),
    response_data = COALESCE(EXCLUDED.response_data, learner_block_progress.response_data),
    time_spent_seconds = learner_block_progress.time_spent_seconds + EXCLUDED.time_spent_seconds,
    attempts = learner_block_progress.attempts + 1,
    completed_at = CASE WHEN EXCLUDED.completed AND learner_block_progress.completed_at IS NULL
                        THEN now()
                        ELSE learner_block_progress.completed_at END,
    updated_at = now();

  -- Recalculate overall course progress
  -- Count total blocks from the published course content JSON
  SELECT count(*) INTO v_total_blocks
  FROM course_content cc,
       jsonb_array_elements(cc.content->'modules') AS m,
       jsonb_array_elements(m->'lessons') AS l,
       jsonb_array_elements(l->'blocks') AS b
  WHERE cc.course_id = p_course_id AND cc.status = 'published';

  -- Count completed blocks
  SELECT count(*) INTO v_completed_blocks
  FROM learner_block_progress
  WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND completed = true;

  -- Calculate percentage
  IF v_total_blocks > 0 THEN
    v_new_progress := ROUND((v_completed_blocks::DECIMAL / v_total_blocks) * 100);
  ELSE
    v_new_progress := 0;
  END IF;

  -- Update user_courses progress
  UPDATE user_courses
  SET progress = v_new_progress::TEXT,
      status = CASE WHEN v_new_progress >= 100 THEN 'completed' ELSE status END,
      completed_at = CASE WHEN v_new_progress >= 100 AND completed_at IS NULL THEN now() ELSE completed_at END
  WHERE user_id = p_user_id AND course_id = p_course_id;
END;
$$;

-- ============================================================
-- RPC: get_learner_course_progress
-- Called by: CoursePlayer to restore progress on page load
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_learner_course_progress(
  p_user_id   UUID,
  p_course_id INT
)
RETURNS TABLE (
  block_id     TEXT,
  module_id    TEXT,
  lesson_id    TEXT,
  block_type   TEXT,
  completed    BOOLEAN,
  score        DECIMAL,
  attempts     INT,
  time_spent   INT,
  response_data JSONB
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    block_id, module_id, lesson_id, block_type,
    completed, score, attempts, time_spent_seconds AS time_spent,
    response_data
  FROM learner_block_progress
  WHERE user_id = p_user_id AND course_id = p_course_id;
$$;

-- ============================================================
-- RPC: get_course_modules_from_content (replaces Coassemble API call in ModulesCourseInfo.tsx)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_course_modules_from_content(p_course_id INT)
RETURNS TABLE (
  module_id    TEXT,
  module_title TEXT,
  module_order INT,
  lesson_count INT,
  block_count  INT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    m->>'id' AS module_id,
    m->>'title' AS module_title,
    (m->>'order')::INT AS module_order,
    jsonb_array_length(m->'lessons') AS lesson_count,
    (SELECT count(*)::INT
     FROM jsonb_array_elements(m->'lessons') AS l,
          jsonb_array_elements(l->'blocks') AS b
    ) AS block_count
  FROM course_content cc,
       jsonb_array_elements(cc.content->'modules') AS m
  WHERE cc.course_id = p_course_id
    AND cc.status = 'published'
  ORDER BY (m->>'order')::INT;
$$;

-- ============================================================
-- RPC: register_bunny_video
-- Called by: Video upload webhook handler
-- ============================================================
CREATE OR REPLACE FUNCTION public.register_bunny_video(
  p_organization_id  INT,
  p_bunny_video_id   TEXT,
  p_bunny_library_id TEXT,
  p_title            TEXT,
  p_user_id          UUID
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO bunny_videos (
    organization_id, bunny_video_id, bunny_library_id,
    title, status, created_by
  ) VALUES (
    p_organization_id, p_bunny_video_id, p_bunny_library_id,
    p_title, 'uploading', p_user_id
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- ============================================================
-- RPC: update_bunny_video_status
-- Called by: Bunny webhook handler when encoding finishes
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_bunny_video_status(
  p_bunny_video_id  TEXT,
  p_status          TEXT,
  p_duration        INT DEFAULT NULL,
  p_resolutions     TEXT[] DEFAULT NULL,
  p_thumbnail_url   TEXT DEFAULT NULL,
  p_width           INT DEFAULT NULL,
  p_height          INT DEFAULT NULL,
  p_file_size       BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE bunny_videos SET
    status = p_status,
    duration_seconds = COALESCE(p_duration, duration_seconds),
    resolutions = COALESCE(p_resolutions, resolutions),
    thumbnail_url = COALESCE(p_thumbnail_url, thumbnail_url),
    width = COALESCE(p_width, width),
    height = COALESCE(p_height, height),
    file_size_bytes = COALESCE(p_file_size, file_size_bytes)
  WHERE bunny_video_id = p_bunny_video_id;
END;
$$;
