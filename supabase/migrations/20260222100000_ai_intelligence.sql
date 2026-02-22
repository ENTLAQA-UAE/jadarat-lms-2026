-- ============================================================================
-- Jadarat LMS – Phase 2: AI & Intelligence
-- ============================================================================
-- Adds per-org AI configuration, conversation storage, course embeddings
-- for semantic search, and learner recommendation caching.
-- Requires pgvector extension (available on Supabase).
-- ============================================================================

-- ==========  EXTENSIONS  ==========

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- ==========  ENUMS  ==========

CREATE TYPE public.ai_provider AS ENUM (
  'anthropic',
  'openai',
  'google',
  'jais',
  'custom'
);

CREATE TYPE public.ai_conversation_role AS ENUM (
  'user',
  'assistant',
  'system'
);

-- ==========  TABLES  ==========

-- ----------  1. org_ai_config  ----------
-- Per-organization AI settings: which provider, model, keys, system prompt.
CREATE TABLE public.org_ai_config (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  provider          public.ai_provider NOT NULL DEFAULT 'anthropic',
  model             TEXT           NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  api_key_encrypted TEXT,                  -- encrypted via Supabase Vault or app-layer
  system_prompt     TEXT           NOT NULL DEFAULT 'You are a helpful learning assistant for the Jadarat LMS platform. Answer questions about courses, learning materials, and help learners succeed. Always respond in the same language as the question. You support both Arabic and English.',
  temperature       NUMERIC(3,2)  NOT NULL DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens        INT           NOT NULL DEFAULT 2048 CHECK (max_tokens > 0 AND max_tokens <= 16384),
  rate_limit_rpm    INT           NOT NULL DEFAULT 30 CHECK (rate_limit_rpm > 0),
  rate_limit_rpd    INT           NOT NULL DEFAULT 500 CHECK (rate_limit_rpd > 0),
  chat_enabled      BOOLEAN       NOT NULL DEFAULT true,
  search_enabled    BOOLEAN       NOT NULL DEFAULT true,
  recommendations_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (organization_id)
);

-- ----------  2. ai_conversations  ----------
-- Stores conversation history per user session.
CREATE TABLE public.ai_conversations (
  id                SERIAL         PRIMARY KEY,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  user_id           UUID           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id        UUID           NOT NULL DEFAULT gen_random_uuid(),
  title             TEXT,                   -- auto-generated from first message
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ----------  3. ai_messages  ----------
-- Individual messages within a conversation.
CREATE TABLE public.ai_messages (
  id                SERIAL         PRIMARY KEY,
  conversation_id   INT            NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role              public.ai_conversation_role NOT NULL,
  content           TEXT           NOT NULL,
  tokens_used       INT,
  model             TEXT,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ----------  4. course_embeddings  ----------
-- Vector embeddings for semantic search over course content.
CREATE TABLE public.course_embeddings (
  id                SERIAL         PRIMARY KEY,
  course_id         INT            NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  chunk_index       INT            NOT NULL DEFAULT 0,
  content           TEXT           NOT NULL,       -- the text chunk that was embedded
  content_type      TEXT           NOT NULL DEFAULT 'description',  -- 'title', 'description', 'outcome', 'content'
  language          TEXT           NOT NULL DEFAULT 'en',           -- 'en', 'ar'
  embedding         vector(1536),                  -- OpenAI ada-002 / text-embedding-3-small dimension
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),

  UNIQUE (course_id, chunk_index, content_type, language)
);

-- ----------  5. learner_recommendations  ----------
-- Cached AI-generated recommendations per learner.
CREATE TABLE public.learner_recommendations (
  id                SERIAL         PRIMARY KEY,
  user_id           UUID           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  organization_id   INT            NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
  course_id         INT            NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  score             NUMERIC(5,4)   NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 1),
  reason            TEXT,                  -- "Based on your role in Engineering..."
  algorithm         TEXT           NOT NULL DEFAULT 'hybrid',  -- 'collaborative', 'content_based', 'hybrid'
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  expires_at        TIMESTAMPTZ    NOT NULL DEFAULT now() + interval '7 days',

  UNIQUE (user_id, course_id)
);


-- ==========  INDEXES  ==========

-- org_ai_config
CREATE INDEX idx_org_ai_config_org ON public.org_ai_config (organization_id);

-- ai_conversations
CREATE INDEX idx_ai_conversations_user ON public.ai_conversations (user_id);
CREATE INDEX idx_ai_conversations_org  ON public.ai_conversations (organization_id);
CREATE INDEX idx_ai_conversations_session ON public.ai_conversations (session_id);

-- ai_messages
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages (conversation_id);

-- course_embeddings: IVFFlat index for fast vector similarity search
CREATE INDEX idx_course_embeddings_org ON public.course_embeddings (organization_id);
CREATE INDEX idx_course_embeddings_course ON public.course_embeddings (course_id);
-- Vector similarity index (using cosine distance)
CREATE INDEX idx_course_embeddings_vector ON public.course_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- learner_recommendations
CREATE INDEX idx_learner_recommendations_user ON public.learner_recommendations (user_id);
CREATE INDEX idx_learner_recommendations_org ON public.learner_recommendations (organization_id);
CREATE INDEX idx_learner_recommendations_expires ON public.learner_recommendations (expires_at);


-- ==========  RPC FUNCTIONS  ==========

-- 1. get_org_ai_config — Retrieve AI config for the current user's org.
CREATE OR REPLACE FUNCTION public.get_org_ai_config()
RETURNS TABLE (
  id                INT,
  organization_id   INT,
  provider          TEXT,
  model             TEXT,
  system_prompt     TEXT,
  temperature       NUMERIC,
  max_tokens        INT,
  rate_limit_rpm    INT,
  rate_limit_rpd    INT,
  chat_enabled      BOOLEAN,
  search_enabled    BOOLEAN,
  recommendations_enabled BOOLEAN,
  created_at        TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.organization_id, c.provider::text, c.model, c.system_prompt,
         c.temperature, c.max_tokens, c.rate_limit_rpm, c.rate_limit_rpd,
         c.chat_enabled, c.search_enabled, c.recommendations_enabled,
         c.created_at, c.updated_at
  FROM org_ai_config c
  WHERE c.organization_id = (SELECT organization_id FROM users WHERE id = auth.uid());
$$;


-- 2. upsert_org_ai_config — Create or update org AI configuration.
CREATE OR REPLACE FUNCTION public.upsert_org_ai_config(
  p_provider          TEXT DEFAULT 'anthropic',
  p_model             TEXT DEFAULT 'claude-sonnet-4-5-20250929',
  p_api_key           TEXT DEFAULT NULL,
  p_system_prompt     TEXT DEFAULT NULL,
  p_temperature       NUMERIC DEFAULT 0.7,
  p_max_tokens        INT DEFAULT 2048,
  p_rate_limit_rpm    INT DEFAULT 30,
  p_rate_limit_rpd    INT DEFAULT 500,
  p_chat_enabled      BOOLEAN DEFAULT true,
  p_search_enabled    BOOLEAN DEFAULT true,
  p_recommendations_enabled BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id INT;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  INSERT INTO org_ai_config (
    organization_id, provider, model, api_key_encrypted,
    system_prompt, temperature, max_tokens,
    rate_limit_rpm, rate_limit_rpd,
    chat_enabled, search_enabled, recommendations_enabled
  ) VALUES (
    _org_id, p_provider::public.ai_provider, p_model,
    CASE WHEN p_api_key IS NOT NULL THEN p_api_key ELSE NULL END,
    COALESCE(p_system_prompt, 'You are a helpful learning assistant for the Jadarat LMS platform. Answer questions about courses, learning materials, and help learners succeed. Always respond in the same language as the question. You support both Arabic and English.'),
    p_temperature, p_max_tokens,
    p_rate_limit_rpm, p_rate_limit_rpd,
    p_chat_enabled, p_search_enabled, p_recommendations_enabled
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    provider          = EXCLUDED.provider,
    model             = EXCLUDED.model,
    api_key_encrypted = COALESCE(EXCLUDED.api_key_encrypted, org_ai_config.api_key_encrypted),
    system_prompt     = EXCLUDED.system_prompt,
    temperature       = EXCLUDED.temperature,
    max_tokens        = EXCLUDED.max_tokens,
    rate_limit_rpm    = EXCLUDED.rate_limit_rpm,
    rate_limit_rpd    = EXCLUDED.rate_limit_rpd,
    chat_enabled      = EXCLUDED.chat_enabled,
    search_enabled    = EXCLUDED.search_enabled,
    recommendations_enabled = EXCLUDED.recommendations_enabled,
    updated_at        = now();
END;
$$;


-- 3. get_ai_conversations — List conversations for the current user.
CREATE OR REPLACE FUNCTION public.get_ai_conversations(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id              INT,
  session_id      UUID,
  title           TEXT,
  message_count   BIGINT,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.session_id, c.title,
         (SELECT count(*) FROM ai_messages m WHERE m.conversation_id = c.id) AS message_count,
         c.created_at, c.updated_at
  FROM ai_conversations c
  WHERE c.user_id = auth.uid()
  ORDER BY c.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;


-- 4. get_ai_messages — Get messages for a specific conversation.
CREATE OR REPLACE FUNCTION public.get_ai_messages(p_conversation_id INT)
RETURNS TABLE (
  id              INT,
  role            TEXT,
  content         TEXT,
  model           TEXT,
  tokens_used     INT,
  created_at      TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT m.id, m.role::text, m.content, m.model, m.tokens_used, m.created_at
  FROM ai_messages m
  JOIN ai_conversations c ON m.conversation_id = c.id
  WHERE c.id = p_conversation_id
    AND c.user_id = auth.uid()
  ORDER BY m.created_at ASC;
$$;


-- 5. create_ai_conversation — Start a new conversation.
CREATE OR REPLACE FUNCTION public.create_ai_conversation(
  p_title TEXT DEFAULT NULL
)
RETURNS TABLE (id INT, session_id UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id INT;
  _conv_id INT;
  _session_id UUID;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = auth.uid();

  INSERT INTO ai_conversations (organization_id, user_id, title)
  VALUES (_org_id, auth.uid(), p_title)
  RETURNING ai_conversations.id, ai_conversations.session_id
  INTO _conv_id, _session_id;

  RETURN QUERY SELECT _conv_id, _session_id;
END;
$$;


-- 6. save_ai_message — Persist a message in a conversation.
CREATE OR REPLACE FUNCTION public.save_ai_message(
  p_conversation_id INT,
  p_role            TEXT,
  p_content         TEXT,
  p_model           TEXT DEFAULT NULL,
  p_tokens_used     INT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _msg_id INT;
BEGIN
  -- Verify user owns conversation
  IF NOT EXISTS (
    SELECT 1 FROM ai_conversations
    WHERE id = p_conversation_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Conversation not found or access denied';
  END IF;

  INSERT INTO ai_messages (conversation_id, role, content, model, tokens_used)
  VALUES (p_conversation_id, p_role::public.ai_conversation_role, p_content, p_model, p_tokens_used)
  RETURNING ai_messages.id INTO _msg_id;

  -- Update conversation timestamp & title if first message
  UPDATE ai_conversations SET
    updated_at = now(),
    title = COALESCE(title, LEFT(p_content, 100))
  WHERE id = p_conversation_id;

  RETURN _msg_id;
END;
$$;


-- 7. delete_ai_conversation — Delete a conversation and all its messages.
CREATE OR REPLACE FUNCTION public.delete_ai_conversation(p_conversation_id INT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM ai_conversations
  WHERE id = p_conversation_id AND user_id = auth.uid();
END;
$$;


-- 8. semantic_search_courses — Vector similarity search for courses.
CREATE OR REPLACE FUNCTION public.semantic_search_courses(
  p_query_embedding vector(1536),
  p_org_id          INT,
  p_limit           INT DEFAULT 10,
  p_similarity_threshold NUMERIC DEFAULT 0.3
)
RETURNS TABLE (
  course_id       INT,
  title           TEXT,
  description     TEXT,
  thumbnail       TEXT,
  category_name   TEXT,
  level           TEXT,
  similarity      NUMERIC,
  matched_content TEXT,
  content_type    TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT ON (ce.course_id)
         ce.course_id,
         c.title,
         c.description,
         c.thumbnail,
         cat.name AS category_name,
         c.level::text,
         (1 - (ce.embedding <=> p_query_embedding))::numeric AS similarity,
         ce.content AS matched_content,
         ce.content_type
  FROM course_embeddings ce
  JOIN courses c ON ce.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE ce.organization_id = p_org_id
    AND ce.embedding IS NOT NULL
    AND (1 - (ce.embedding <=> p_query_embedding)) > p_similarity_threshold
  ORDER BY ce.course_id, (ce.embedding <=> p_query_embedding) ASC
  LIMIT p_limit;
$$;


-- 9. get_learner_recommendations — Get cached recommendations for current user.
CREATE OR REPLACE FUNCTION public.get_learner_recommendations(
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  course_id       INT,
  title           TEXT,
  description     TEXT,
  thumbnail       TEXT,
  category_name   TEXT,
  level           TEXT,
  score           NUMERIC,
  reason          TEXT,
  algorithm       TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT r.course_id, c.title, c.description, c.thumbnail,
         cat.name AS category_name, c.level::text,
         r.score, r.reason, r.algorithm
  FROM learner_recommendations r
  JOIN courses c ON r.course_id = c.id
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE r.user_id = auth.uid()
    AND r.expires_at > now()
    -- Exclude courses the learner has already completed
    AND NOT EXISTS (
      SELECT 1 FROM user_courses uc
      WHERE uc.user_id = auth.uid()
        AND uc.course_id = r.course_id
        AND uc.status = 'completed'
    )
  ORDER BY r.score DESC
  LIMIT p_limit;
$$;


-- 10. generate_recommendations — Compute recommendations using hybrid scoring.
-- Combines: role/department similarity + category affinity + popularity.
CREATE OR REPLACE FUNCTION public.generate_recommendations(
  p_user_id UUID
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id INT;
  _dept TEXT;
  _job_title TEXT;
BEGIN
  SELECT organization_id, department, job_title
    INTO _org_id, _dept, _job_title
    FROM users WHERE id = p_user_id;

  -- Clear expired recommendations
  DELETE FROM learner_recommendations
  WHERE user_id = p_user_id AND expires_at <= now();

  -- Insert new recommendations using hybrid scoring:
  -- 1. Category affinity (what categories did the user complete courses in?)
  -- 2. Popularity among similar roles
  -- 3. Enrollment count (popular courses)
  INSERT INTO learner_recommendations (user_id, organization_id, course_id, score, reason, algorithm, expires_at)
  SELECT
    p_user_id,
    _org_id,
    c.id,
    -- Hybrid score: weighted combination
    LEAST(1.0,
      -- Category affinity: 0.4 weight
      COALESCE(0.4 * (
        SELECT count(*)::numeric / GREATEST(1, (SELECT count(*) FROM user_courses WHERE user_id = p_user_id))
        FROM user_courses uc2
        JOIN courses c2 ON uc2.course_id = c2.id
        WHERE uc2.user_id = p_user_id AND c2.category_id = c.category_id
      ), 0)
      +
      -- Role popularity: 0.3 weight (how many same-dept users enrolled)
      COALESCE(0.3 * (
        SELECT count(DISTINCT uc3.user_id)::numeric
              / GREATEST(1, (SELECT count(*) FROM users WHERE organization_id = _org_id AND department = _dept))
        FROM user_courses uc3
        JOIN users u3 ON uc3.user_id = u3.id
        WHERE uc3.course_id = c.id AND u3.department = _dept AND u3.id != p_user_id
      ), 0)
      +
      -- General popularity: 0.3 weight
      COALESCE(0.3 * (
        SELECT count(*)::numeric
              / GREATEST(1, (SELECT count(*) FROM users WHERE organization_id = _org_id))
        FROM user_courses uc4
        WHERE uc4.course_id = c.id
      ), 0)
    )::numeric(5,4) AS score,
    CASE
      WHEN _dept IS NOT NULL THEN 'Recommended based on your ' || _dept || ' department peers'
      ELSE 'Popular course in your organization'
    END AS reason,
    'hybrid',
    now() + interval '7 days'
  FROM courses c
  WHERE c.organization_id = _org_id
    -- Exclude courses user is already enrolled in
    AND NOT EXISTS (
      SELECT 1 FROM user_courses uc WHERE uc.user_id = p_user_id AND uc.course_id = c.id
    )
  ORDER BY score DESC
  LIMIT 20
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    score = EXCLUDED.score,
    reason = EXCLUDED.reason,
    expires_at = EXCLUDED.expires_at;
END;
$$;


-- 11. get_ai_chat_context — Retrieves relevant course content for RAG.
-- Used by the chat API to inject context into the system prompt.
CREATE OR REPLACE FUNCTION public.get_ai_chat_context(
  p_user_id UUID,
  p_query_embedding vector(1536) DEFAULT NULL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  context_type TEXT,
  content      TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _org_id INT;
BEGIN
  SELECT organization_id INTO _org_id FROM users WHERE id = p_user_id;

  -- Return user's enrolled courses as context
  RETURN QUERY
  SELECT 'enrolled_course'::text AS context_type,
         ('Course: ' || c.title || ' | Progress: ' || uc.progress || '% | Status: ' || COALESCE(uc.status, 'in_progress'))::text AS content
  FROM user_courses uc
  JOIN courses c ON uc.course_id = c.id
  WHERE uc.user_id = p_user_id
  LIMIT 10;

  -- If embeddings exist, return semantically relevant course content
  IF p_query_embedding IS NOT NULL THEN
    RETURN QUERY
    SELECT 'relevant_content'::text AS context_type,
           ce.content
    FROM course_embeddings ce
    WHERE ce.organization_id = _org_id
      AND ce.embedding IS NOT NULL
    ORDER BY ce.embedding <=> p_query_embedding
    LIMIT p_limit;
  END IF;

  -- Return available courses in org
  RETURN QUERY
  SELECT 'available_course'::text AS context_type,
         ('Available Course: ' || c.title || ' | Category: ' || COALESCE(cat.name, 'Uncategorized') || ' | Level: ' || c.level::text || ' | Description: ' || LEFT(c.description, 200))::text AS content
  FROM courses c
  LEFT JOIN categories cat ON c.category_id = cat.id
  WHERE c.organization_id = _org_id
  LIMIT 20;
END;
$$;


-- ==========  RLS POLICIES  ==========

ALTER TABLE public.org_ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_recommendations ENABLE ROW LEVEL SECURITY;

-- org_ai_config: org admins + LMS admins can view and manage
CREATE POLICY "Org members can view AI config"
  ON public.org_ai_config FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Org admins can manage AI config"
  ON public.org_ai_config FOR ALL
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('organizationAdmin', 'LMSAdmin')
  );

-- ai_conversations: users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.ai_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON public.ai_conversations FOR DELETE
  USING (user_id = auth.uid());

-- ai_messages: users can see messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
  ON public.ai_messages FOR SELECT
  USING (
    conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert messages in own conversations"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = auth.uid())
  );

-- course_embeddings: org members can view
CREATE POLICY "Org members can view course embeddings"
  ON public.course_embeddings FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- learner_recommendations: users can view their own
CREATE POLICY "Users can view own recommendations"
  ON public.learner_recommendations FOR SELECT
  USING (user_id = auth.uid());
