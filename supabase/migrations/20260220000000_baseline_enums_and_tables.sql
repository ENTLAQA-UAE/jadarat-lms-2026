-- ============================================================================
-- Jadarat LMS - Baseline Migration: Enums & Tables
-- ============================================================================
-- Reconstructed from auto-generated Supabase types + frontend code references.
-- courses.category normalized from TEXT → category_id INT FK.
-- SCORM columns (is_scorm, scorm_version, scorm_url, launch_path) and
-- org settings columns (ai_builder, document_builder, create_courses)
-- included based on code usage (added after types were last generated).
-- ============================================================================

-- ==========  ENUMS  ==========

CREATE TYPE public.roles AS ENUM (
  'superAdmin',
  'organizationAdmin',
  'LMSAdmin',
  'learningManager',
  'learner'
);

CREATE TYPE public.courselevel AS ENUM (
  'beginner',
  'medium',
  'advanced'
);

CREATE TYPE public.courseenrollementpolicy AS ENUM (
  'direct',
  'lms'
);


-- ==========  TABLES  ==========
-- Creation order respects FK dependencies. groups.created_by FK is deferred
-- until after users table exists (circular: groups ↔ users).

-- ----------  1. organization  ----------
CREATE TABLE public.organization (
  id          SERIAL       PRIMARY KEY,
  domain      TEXT         NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  2. global_certificates  ----------
CREATE TABLE public.global_certificates (
  id          SERIAL       PRIMARY KEY,
  name        TEXT         NOT NULL,
  placid      TEXT         NOT NULL,
  thumbnail   TEXT         NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  3. subscription_tiers  ----------
CREATE TABLE public.subscription_tiers (
  id                SERIAL       PRIMARY KEY,
  tier_name         TEXT         NOT NULL,
  max_user          INT          NOT NULL,
  max_courses       INT          NOT NULL,
  max_lms_managers  INT          NOT NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  4. subscriptions  ----------
CREATE TABLE public.subscriptions (
  id                 SERIAL       PRIMARY KEY,
  organization_id    INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  subscription_tier  INT          REFERENCES public.subscription_tiers(id) ON DELETE SET NULL,
  start_date         TEXT         NOT NULL,
  expires_at         TEXT         NOT NULL,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  5. organization_settings  ----------
CREATE TABLE public.organization_settings (
  id                                    SERIAL                      PRIMARY KEY,
  organization_id                       INT                         NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  name                                  TEXT                        NOT NULL,
  logo                                  TEXT,
  auth_bg                               TEXT,
  primary_color                         TEXT,
  secondary_color                       TEXT,
  registeration_enabled                 BOOLEAN                     NOT NULL DEFAULT false,
  registeration_require_approval        BOOLEAN                     NOT NULL DEFAULT false,
  registeration_require_specific_domain BOOLEAN                     NOT NULL DEFAULT false,
  registeration_domain                  TEXT,
  course_expiration_enabled             BOOLEAN                     NOT NULL DEFAULT false,
  course_expiration_period              INT,
  course_self_entrollment_policy        public.courseenrollementpolicy NOT NULL DEFAULT 'lms',
  lang                                  TEXT                        NOT NULL DEFAULT 'en',
  certificate_template                  INT                         REFERENCES public.global_certificates(id) ON DELETE SET NULL,
  certificate_logo                      TEXT,
  certificate_auth_title                TEXT,
  certificate_sign                      TEXT,
  certificate_bg_color                  TEXT,
  certificate_preview                   TEXT,
  -- Columns added after initial types generation (used in code)
  ai_builder                            BOOLEAN                     NOT NULL DEFAULT false,
  document_builder                      BOOLEAN                     NOT NULL DEFAULT false,
  create_courses                        BOOLEAN                     NOT NULL DEFAULT true,
  created_at                            TIMESTAMPTZ                 NOT NULL DEFAULT now()
);

-- ----------  6. categories  ----------
CREATE TABLE public.categories (
  id              SERIAL       PRIMARY KEY,
  name            TEXT         NOT NULL,
  ar_name         TEXT,
  image           TEXT,
  organization_id INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  7. groups (created_by FK added after users table)  ----------
CREATE TABLE public.groups (
  id              SERIAL       PRIMARY KEY,
  name            TEXT         NOT NULL,
  organization_id INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  created_by      UUID         NOT NULL,  -- FK added below
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  8. users  ----------
CREATE TABLE public.users (
  id                  UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT         NOT NULL,
  name                TEXT         NOT NULL,
  role                public.roles NOT NULL DEFAULT 'learner',
  is_active           BOOLEAN      NOT NULL DEFAULT true,
  organization_id     INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  organization_domain TEXT         NOT NULL REFERENCES public.organization(domain) ON UPDATE CASCADE,
  group_id            INT          REFERENCES public.groups(id) ON DELETE SET NULL,
  department          TEXT,
  job_title           TEXT,
  job_grade           TEXT,
  country             TEXT,
  city                TEXT,
  lang                TEXT         NOT NULL DEFAULT 'en',
  avatar_url          TEXT,
  last_login          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Now add the deferred FK on groups.created_by → users.id
ALTER TABLE public.groups
  ADD CONSTRAINT groups_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;

-- ----------  9. courses (category normalized to FK)  ----------
CREATE TABLE public.courses (
  id              SERIAL              PRIMARY KEY,
  title           TEXT                NOT NULL,
  description     TEXT                NOT NULL,
  category_id     INT                 NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  level           public.courselevel  NOT NULL DEFAULT 'beginner',
  timeline        TEXT                NOT NULL DEFAULT '',
  thumbnail       TEXT                NOT NULL DEFAULT '',
  languages       JSONB[]             NOT NULL DEFAULT '{}',
  slug            TEXT                UNIQUE,
  status          TEXT,
  coassemble_id   TEXT,
  created_by      UUID                REFERENCES public.users(id) ON DELETE SET NULL,
  organization_id INT                 REFERENCES public.organization(id) ON DELETE CASCADE,
  outcomes        JSONB               DEFAULT '[]'::jsonb,
  -- SCORM columns (used in code, added after types generation)
  is_scorm        BOOLEAN             NOT NULL DEFAULT false,
  scorm_version   TEXT,
  scorm_url       TEXT,
  launch_path     TEXT,
  created_at      TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- ----------  10. user_courses  ----------
CREATE TABLE public.user_courses (
  id           SERIAL       PRIMARY KEY,
  user_id      UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id    INT          NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress     TEXT         NOT NULL DEFAULT '0',
  status       TEXT,
  completed_at TIMESTAMPTZ,
  scorm_data   JSONB,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (user_id, course_id)
);

-- ----------  11. user_certificates  ----------
CREATE TABLE public.user_certificates (
  id          SERIAL       PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course_id   INT          NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate TEXT         NOT NULL,
  updated_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  UNIQUE (user_id, course_id)
);

-- ----------  12. certificates  ----------
CREATE TABLE public.certificates (
  id                SERIAL       PRIMARY KEY,
  uuid              TEXT         NOT NULL,
  "user"            UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  course            INT          NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_image TEXT         NOT NULL,
  certificate_pdf   TEXT         NOT NULL,
  organization_id   INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  13. slider  ----------
CREATE TABLE public.slider (
  id              SERIAL       PRIMARY KEY,
  image           TEXT         NOT NULL,
  link            TEXT,
  organization_id INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  created_by      UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------  14. subscription_requests  ----------
CREATE TABLE public.subscription_requests (
  id                         SERIAL       PRIMARY KEY,
  organization_id            INT          NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  requester_id               UUID         NOT NULL,
  number_of_users            INT          NOT NULL,
  number_of_courses          INT          NOT NULL,
  number_of_content_creators INT          NOT NULL,
  created_at                 TIMESTAMPTZ  NOT NULL DEFAULT now()
);


-- ==========  INDEXES  ==========

-- users
CREATE INDEX idx_users_organization_id     ON public.users (organization_id);
CREATE INDEX idx_users_organization_domain ON public.users (organization_domain);
CREATE INDEX idx_users_email               ON public.users (email);
CREATE INDEX idx_users_group_id            ON public.users (group_id);
CREATE INDEX idx_users_role                ON public.users (role);

-- courses
CREATE INDEX idx_courses_organization_id ON public.courses (organization_id);
CREATE INDEX idx_courses_category_id     ON public.courses (category_id);
CREATE INDEX idx_courses_created_by      ON public.courses (created_by);

-- user_courses
CREATE INDEX idx_user_courses_user_id    ON public.user_courses (user_id);
CREATE INDEX idx_user_courses_course_id  ON public.user_courses (course_id);

-- user_certificates
CREATE INDEX idx_user_certificates_user_id   ON public.user_certificates (user_id);
CREATE INDEX idx_user_certificates_course_id ON public.user_certificates (course_id);

-- certificates
CREATE INDEX idx_certificates_user            ON public.certificates ("user");
CREATE INDEX idx_certificates_course          ON public.certificates (course);
CREATE INDEX idx_certificates_organization_id ON public.certificates (organization_id);

-- categories
CREATE INDEX idx_categories_organization_id ON public.categories (organization_id);

-- groups
CREATE INDEX idx_groups_organization_id ON public.groups (organization_id);

-- subscriptions
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions (organization_id);

-- slider
CREATE INDEX idx_slider_organization_id ON public.slider (organization_id);

-- subscription_requests
CREATE INDEX idx_subscription_requests_organization_id ON public.subscription_requests (organization_id);
