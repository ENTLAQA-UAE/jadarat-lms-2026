-- ============================================================
-- Migration: 20260308000001_question_banks.sql
-- Purpose: Create organization-wide question bank system
-- ============================================================

-- 1. Question banks (collections of reusable questions)
CREATE TABLE public.question_banks (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT,                          -- e.g., 'compliance', 'safety', 'onboarding'
  tags            TEXT[] DEFAULT '{}',            -- Searchable tags
  language        TEXT NOT NULL DEFAULT 'ar'
                    CHECK (language IN ('ar', 'en', 'bilingual')),
  question_count  INT NOT NULL DEFAULT 0,        -- Denormalized counter
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_question_banks_org ON question_banks (organization_id, is_archived);

-- 2. Question bank items (individual questions stored as block JSON)
CREATE TABLE public.question_bank_items (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id         UUID NOT NULL REFERENCES question_banks(id) ON DELETE CASCADE,
  block_type      TEXT NOT NULL CHECK (block_type IN (
    'multiple_choice', 'true_false', 'multiple_response',
    'fill_in_blank', 'matching', 'sorting'
  )),
  block_data      JSONB NOT NULL,                -- Full block data (same shape as Block.data)
  difficulty      TEXT DEFAULT 'medium'
                    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags            TEXT[] DEFAULT '{}',
  points          INT NOT NULL DEFAULT 1,
  usage_count     INT NOT NULL DEFAULT 0,        -- How many quizzes use this question
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_question_bank_items_bank ON question_bank_items (bank_id, is_archived);
CREATE INDEX idx_question_bank_items_type ON question_bank_items (block_type);
CREATE INDEX idx_question_bank_items_difficulty ON question_bank_items (difficulty);

-- 3. RLS Policies
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank_items ENABLE ROW LEVEL SECURITY;

-- question_banks: org members can read, admins can write
CREATE POLICY "qb_read_org" ON question_banks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = question_banks.organization_id
        AND u.id = auth.uid()
    )
  );

CREATE POLICY "qb_admin_write" ON question_banks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.organization_id = question_banks.organization_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- question_bank_items: inherit access from parent bank
CREATE POLICY "qbi_read_org" ON question_bank_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM question_banks qb
      JOIN users u ON u.organization_id = qb.organization_id
      WHERE qb.id = question_bank_items.bank_id
        AND u.id = auth.uid()
    )
  );

CREATE POLICY "qbi_admin_write" ON question_bank_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM question_banks qb
      JOIN users u ON u.organization_id = qb.organization_id
      WHERE qb.id = question_bank_items.bank_id
        AND u.id = auth.uid()
        AND u.role IN ('LMSAdmin', 'organizationAdmin')
    )
  );

-- 4. Trigger to maintain question_count on question_banks
CREATE OR REPLACE FUNCTION public.update_question_bank_count()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE question_banks SET question_count = question_count + 1, updated_at = now()
    WHERE id = NEW.bank_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE question_banks SET question_count = question_count - 1, updated_at = now()
    WHERE id = OLD.bank_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.bank_id <> NEW.bank_id THEN
    UPDATE question_banks SET question_count = question_count - 1, updated_at = now()
    WHERE id = OLD.bank_id;
    UPDATE question_banks SET question_count = question_count + 1, updated_at = now()
    WHERE id = NEW.bank_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_question_bank_count
  AFTER INSERT OR DELETE OR UPDATE OF bank_id ON question_bank_items
  FOR EACH ROW EXECUTE FUNCTION update_question_bank_count();

-- 5. RPC: Get question banks for org
CREATE OR REPLACE FUNCTION public.get_question_banks(p_organization_id INT)
RETURNS TABLE (
  id              UUID,
  name            TEXT,
  description     TEXT,
  category        TEXT,
  tags            TEXT[],
  language        TEXT,
  question_count  INT,
  created_at      TIMESTAMPTZ,
  created_by      UUID
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, name, description, category, tags, language,
         question_count, created_at, created_by
  FROM question_banks
  WHERE organization_id = p_organization_id
    AND is_archived = false
  ORDER BY updated_at DESC;
$$;

-- 6. RPC: Get questions from a bank with optional filters
CREATE OR REPLACE FUNCTION public.get_bank_questions(
  p_bank_id       UUID,
  p_block_type    TEXT DEFAULT NULL,
  p_difficulty    TEXT DEFAULT NULL,
  p_limit         INT DEFAULT 100,
  p_offset        INT DEFAULT 0
)
RETURNS TABLE (
  id              UUID,
  block_type      TEXT,
  block_data      JSONB,
  difficulty      TEXT,
  tags            TEXT[],
  points          INT,
  usage_count     INT,
  created_at      TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, block_type, block_data, difficulty, tags,
         points, usage_count, created_at
  FROM question_bank_items
  WHERE bank_id = p_bank_id
    AND is_archived = false
    AND (p_block_type IS NULL OR block_type = p_block_type)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

-- 7. RPC: Draw random questions from a bank (for quiz consumption)
CREATE OR REPLACE FUNCTION public.draw_random_questions(
  p_bank_id       UUID,
  p_count         INT,
  p_block_type    TEXT DEFAULT NULL,
  p_difficulty    TEXT DEFAULT NULL
)
RETURNS TABLE (
  id              UUID,
  block_type      TEXT,
  block_data      JSONB,
  difficulty      TEXT,
  points          INT
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT id, block_type, block_data, difficulty, points
  FROM question_bank_items
  WHERE bank_id = p_bank_id
    AND is_archived = false
    AND (p_block_type IS NULL OR block_type = p_block_type)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY random()
  LIMIT p_count;
$$;

-- 8. RPC: Increment usage count for drawn questions
CREATE OR REPLACE FUNCTION public.increment_question_usage(p_item_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE question_bank_items
  SET usage_count = usage_count + 1
  WHERE id = ANY(p_item_ids);
END;
$$;
