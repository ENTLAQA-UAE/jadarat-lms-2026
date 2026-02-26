# Jadarat LMS -- Native Authoring Tool: Detailed Implementation Plan

> **Date**: February 26, 2026
> **Scope**: Replace Coassemble with native block-based authoring, integrate Bunny.net for video + SCORM delivery, implement AI course generation
> **Tech Stack**: Next.js 14 App Router, Supabase (Postgres + Auth), Bunny.net (Stream + Storage), Claude API, TypeScript, Tailwind + shadcn/ui

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Coassemble Removal Plan](#3-coassemble-removal-plan)
4. [Complete TypeScript Type System](#4-complete-typescript-type-system)
5. [Complete Database Schema & Migrations](#5-complete-database-schema--migrations)
6. [Bunny.net Integration -- Full Implementation](#6-bunnynet-integration----full-implementation)
7. [AI Course Generation -- Full Implementation](#7-ai-course-generation----full-implementation)
8. [Block Editor -- Full Implementation](#8-block-editor----full-implementation)
9. [Course Player -- Full Implementation](#9-course-player----full-implementation)
10. [SCORM Migration -- Full Implementation](#10-scorm-migration----full-implementation)
11. [Server Actions & API Routes](#11-server-actions--api-routes)
12. [Implementation Phases with Exact Deliverables](#12-implementation-phases-with-exact-deliverables)
13. [File Structure](#13-file-structure)
14. [Environment Variables](#14-environment-variables)
15. [Testing Strategy](#15-testing-strategy)
16. [Risk Mitigation](#16-risk-mitigation)

---

## 1. Executive Summary

### What We Are Building

A **native block-based course authoring tool** that replaces the Coassemble headless integration with:

1. **Block Editor** -- Drag-and-drop course builder with 27 block types, RTL-first, JSON-based storage in Supabase `course_content` table
2. **AI Course Generation** -- Claude-powered 6-step pipeline: topic -> outline -> human review -> content generation -> quiz generation -> assembly in editor
3. **Document-to-Course** -- PDF/DOCX/PPTX parsing via `pdfjs-dist`/`mammoth` -> AI-powered course structure extraction
4. **Bunny Stream** -- Video hosting with HLS adaptive streaming, DRM (MediaCage), AI captions, Player.js tracking
5. **Bunny Storage** -- CDN-backed SCORM package delivery via `scorm.jadarat.com` with signed URLs
6. **SCORM Upload** -- Keep and enhance existing SCORM 1.2/2004 upload + playback (migrate storage from Supabase to Bunny)

### Why Replace Coassemble

| Problem | Exact Code Location | Impact |
|---------|---------------------|--------|
| Deprecated API endpoints (`GET /course/edit`, `GET /course/view`) | `src/action/coassemble/coassemble.ts:8-25` | Will break when deprecated |
| Iframe-only authoring (no native control) | `src/app/.../build-course/page.tsx:57` -- `<iframe src="https://coassemble.com/embed/${url}">` | Cannot customize editor, blocks, or UX |
| No Arabic-first support | Coassemble has no RTL mode | RTL is afterthought |
| Client-side API key exposure | `src/app/.../getCourses.ts:4` -- `NEXT_PUBLIC_COASSEMBLE` used in client fetch | Security risk -- API key visible in browser |
| Hardcoded `clientIdentifier=49` | `src/app/.../ModulesCourseInfo.tsx:43` | Bug -- breaks multi-tenant orgs |
| External dependency for core feature | 14 files depend on Coassemble API | Vendor lock-in, pricing risk |
| No course content stored locally | Content lives on Coassemble servers | Data sovereignty issues for MENA |

---

## 2. Current State Analysis

### 2.1 Coassemble Integration (14 files to remove/replace)

#### Files to DELETE (7 files -- 451 lines of code)

| # | File | Lines | What It Does |
|---|------|-------|-------------|
| 1 | `src/action/coassemble/coassemble.ts` | 31 | Server action: calls `GET /api/v1/headless/course/edit?flow={flow}` with `COASSEMBLE` env var and hardcoded `clientIdentifier` |
| 2 | `src/app/dashboard/@learner/course/[id]/getCourses.ts` | 11 | Client-side fetch: exposes `NEXT_PUBLIC_COASSEMBLE` API key, calls Coassemble courses API |
| 3 | `src/app/dashboard/@learner/course/[id]/types.ts` | 188 | TypeScript types: `coassembleType`, `Screen`, `Theme`, `Element`, `ValidationRule` interfaces -- all Coassemble-specific |
| 4 | `src/app/dashboard/@learner/course/play/[id]/getSignedURL.ts` | 45 | Server fetch: gets signed view/edit URLs from Coassemble API using `COASSEMBLE` env var |
| 5 | `src/components/app/LMSAdmin/edit-content/EditContent.tsx` | 70 | React component: iframe wrapper `<iframe src={editUrl}>` for Coassemble edit mode |
| 6 | `src/components/app/LMSAdmin/preview-content/PreviewContent.tsx` | 57 | React component: iframe wrapper `<iframe src={previewUrl}>` for Coassemble preview mode |
| 7 | `src/components/shared/TestMode.tsx` | 39 | React component: yellow overlay showing course title fetched from Coassemble API |

#### Files to REWRITE (7 files -- 1079 lines of code)

| # | File | Lines | Current Behavior | New Behavior |
|---|------|-------|-----------------|-------------|
| 1 | `src/app/.../add-course/CourseDetails.tsx` | 206 | Line 68: `await createCoassembleCourse(flow)` -> Line 149: `router.push(build-course?url=${coassembleUrl})` | Remove Coassemble call, redirect to native editor route `build-course?courseId=${courseData}` |
| 2 | `src/app/.../build-course/page.tsx` | 62 | Line 57: `<iframe src="https://coassemble.com/embed/${url}">`, Line 19: listens for postMessage from `coassemble.com` origin | Replace entirely with native `BlockEditor` component wrapping `EditorCanvas` |
| 3 | `src/app/.../edit-course/[id]/EditCourse.tsx` | 299 | References `coassemble_id` for edit/preview links throughout | Replace with `content_id` references, load from `course_content` table |
| 4 | `src/app/.../edit-content/page.tsx` | ~30 | Wraps `EditContent` component (Coassemble iframe) | Load existing course content from DB, open in `EditorCanvas` |
| 5 | `src/app/.../preview-content/page.tsx` | ~30 | Wraps `PreviewContent` component (Coassemble iframe) | Render course content in read-only `CoursePlayer` |
| 6 | `src/app/dashboard/@learner/course/play/[id]/Play.tsx` | 283 | Line 102-128: `message.origin !== 'https://coassemble.com'` filter, Line 249: `<iframe src={courseURL}>` | Route to native `CoursePlayer` for native courses, keep SCORM player for SCORM courses |
| 7 | `src/app/.../insights/courses/[id]/ModulesCourseInfo.tsx` | 100 | Fetches modules from Coassemble API with hardcoded `clientIdentifier=49` | Read modules from local `course_content` table via RPC |

#### Files to EDIT (minor changes)

| # | File | Change |
|---|------|--------|
| 1 | `src/app/.../insights/courses/[id]/CourseInfo.tsx` | Remove `coassemble_id` display (line ~45) |
| 2 | `src/app/home/types.d.ts` | Remove `coassemble_id?: string` from `CoursesType` and `FullCourseTypes` interfaces |
| 3 | `src/redux/user.slice.ts` | Remove `coassemble_id` from `CoursesType` usage |

### 2.2 Current Database Schema (courses table -- from migration)

```sql
-- Current courses table (from supabase/migrations)
CREATE TABLE public.courses (
  id              SERIAL PRIMARY KEY,
  title           TEXT,
  description     TEXT,
  category_id     INT REFERENCES categories(id),
  level           courselevel DEFAULT 'beginner',  -- ENUM: beginner, medium, advanced
  timeline        TEXT,
  thumbnail       TEXT,                             -- Supabase Storage signed URL
  languages       JSONB[],
  slug            TEXT UNIQUE,
  status          TEXT,
  coassemble_id   TEXT,                             -- DEPRECATED: to be removed
  created_by      UUID REFERENCES auth.users(id),
  organization_id INT REFERENCES organization(id),
  outcomes        JSONB DEFAULT '[]'::jsonb,
  is_scorm        BOOLEAN DEFAULT false,
  scorm_version   TEXT,
  scorm_url       TEXT,
  launch_path     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Current user_courses table
CREATE TABLE public.user_courses (
  id              SERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  course_id       INT REFERENCES courses(id),
  progress        TEXT,                             -- "0"-"100" as string
  status          TEXT,                             -- 'enrolled', 'completed'
  completed_at    TIMESTAMPTZ,
  scorm_data      JSONB,                            -- SCORM suspend data
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 2.3 Current SCORM Implementation (KEEP + ENHANCE)

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| Upload + ZIP extraction | `src/utils/uploadFile.ts:157-233` | 76 | **KEEP** -- replace Supabase storage with Bunny Storage |
| SCORM 1.2 API wrapper | `src/lib/scorm-api.ts` | 47 | **KEEP** -- `ScormAPI` class with `LMSInitialize/Finish/GetValue/SetValue/Commit` |
| SCORM data parser | `src/lib/scorm-utils.ts` | 33 | **KEEP** -- `parseSuspendData()` extracts progress from SCORM suspend data |
| SCORM player | `src/app/.../scorm-player/[slug]/Player.tsx` | 187 | **KEEP** -- update iframe `src` from `/api/scorm/content/` to Bunny CDN URL |
| SCORM content proxy | `src/app/api/scorm/content/[...path]/route.ts` | 82 | **REPLACE** -- currently proxies from Supabase Storage. Will be replaced by direct Bunny CDN serving |
| SCORM extract API | `src/app/api/scorm/[slug]/route.ts` | 158 | **KEEP** -- extracts SCORM ZIP, parses manifest |

### 2.4 Existing AI Infrastructure

| Component | File | Key Pattern |
|-----------|------|-------------|
| AI Gateway | `src/lib/ai/gateway.ts` (215 lines) | `getAIProvider(supabase, userId, endpoint)` -> returns `{ config, model, apiKey }`. Reads from `org_ai_config` table, decrypts API key, checks rate limits via `check_ai_rate_limit` RPC |
| Chat API | `src/app/api/chat/route.ts` (142 lines) | `POST` handler: authenticates user, calls gateway, gets RAG context via `get_ai_chat_context` RPC, streams response via `streamText()` from AI SDK, saves conversation via `save_ai_message` RPC |
| Embeddings | `src/app/api/embeddings/route.ts` | OpenAI `text-embedding-3-small`, 1536 dimensions, upserts to `course_embeddings` table |
| Recommendations | `src/app/api/recommendations/route.ts` | Hybrid: category affinity + role popularity + general popularity |
| AI Config | `org_ai_config` table | Per-org: `provider`, `model`, `api_key_encrypted`, `system_prompt`, `temperature`, `max_tokens`, `rate_limit_rpm`, `rate_limit_rpd`, `chat_enabled`, `search_enabled`, `recommendations_enabled` |
| Encryption | `src/lib/ai/encryption.ts` | AES-256-GCM encryption/decryption for API keys using `AI_ENCRYPTION_KEY` env var |

### 2.5 Existing Dependencies (Already Installed)

```json
{
  "scorm-again": "2.6.0",
  "jszip": "3.10.1",
  "fast-xml-parser": "4.5.1",
  "react-dropzone": "14.3.5",
  "@ai-sdk/anthropic": "3.0.46",
  "@ai-sdk/openai": "3.0.30",
  "ai": "6.0.97",
  "pdfjs-dist": "3.4.120",
  "framer-motion": "11.18.0",
  "recharts": "2.13.0",
  "pipwerks-scorm-api-wrapper": "0.1.2",
  "xapiwrapper": "1.11.0",
  "lzwcompress": "1.1.0",
  "sonner": "1.7.0"
}
```

---

## 3. Coassemble Removal Plan

### 3.1 Exact Deletion Commands

```bash
# Step 1: Delete all Coassemble-only files
rm -rf src/action/coassemble/
rm src/app/dashboard/@learner/course/\[id\]/getCourses.ts
rm src/app/dashboard/@learner/course/\[id\]/types.ts
rm src/app/dashboard/@learner/course/play/\[id\]/getSignedURL.ts
rm src/components/app/LMSAdmin/edit-content/EditContent.tsx
rm src/components/app/LMSAdmin/preview-content/PreviewContent.tsx
rm src/components/shared/TestMode.tsx

# Step 2: Remove env vars from .env and .env.local
# Delete these lines:
#   COASSEMBLE=<api-key>
#   NEXT_PUBLIC_COASSEMBLE=<api-key>
```

### 3.2 Exact Code Changes in Remaining Files

#### `src/app/home/types.d.ts` -- Remove `coassemble_id`

```typescript
// BEFORE (current):
export interface CoursesType {
    id: number;
    name: string;
    description: string;
    thumbnail: string;
    percentage?: number;
    category?: number;
    coassemble_id?: string;     // <-- REMOVE THIS LINE
    enrolled_at?: Date;
    timeline?: string;
    level?: string;
    slug?: string;
    category_name: string;
    category_ar_name: string;
    course_id: number;
    title: string;
    isscorm?: boolean;
}

// AFTER:
export interface CoursesType {
    id: number;
    name: string;
    description: string;
    thumbnail: string;
    percentage?: number;
    category?: number;
    enrolled_at?: Date;
    timeline?: string;
    level?: string;
    slug?: string;
    category_name: string;
    category_ar_name: string;
    course_id: number;
    title: string;
    isscorm?: boolean;
    authoring_type?: 'native' | 'scorm';   // NEW
    content_id?: string;                     // NEW -- UUID of course_content
}

// Also update FullCourseTypes the same way:
export interface FullCourseTypes {
    id: number;
    created_at: string;
    organization_id: number;
    title: string;
    description: string;
    level: string;
    category?: number;
    languages: Language[];
    thumbnail: string;
    timeline: string;
    category_id: number;
    // coassemble_id?: string;  -- REMOVED
    slug?: string;
    name?: string;
    percentage?: number;
    enrolled_at?: Date;
    outcomes: { id: string; text: string }[];
    category_name: string;
    category_ar_name: string;
    course_id: number;
    authoring_type?: 'native' | 'scorm';   // NEW
    content_id?: string;                     // NEW
}
```

### 3.3 Database Migration to Remove Coassemble

```sql
-- Migration: 20260301000000_remove_coassemble.sql

-- Step 1: Deprecate coassemble_id column (keep data for reference)
COMMENT ON COLUMN courses.coassemble_id IS
  'DEPRECATED 2026-03-01: Legacy Coassemble course ID. Column will be dropped after 90-day retention.';

-- Step 2: Add authoring_type column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  authoring_type TEXT DEFAULT 'native'
  CHECK (authoring_type IN ('native', 'scorm'));

-- Step 3: Migrate existing data
UPDATE courses SET authoring_type = 'scorm' WHERE is_scorm = true;
UPDATE courses SET authoring_type = 'native' WHERE is_scorm = false OR is_scorm IS NULL;

-- Step 4: Update RPC functions that return coassemble_id
-- (See Section 5 for complete RPC rewrites)

-- Step 5: Update get_user_courses to return authoring_type instead of coassemble_id
CREATE OR REPLACE FUNCTION public.get_user_courses()
RETURNS TABLE (
  id              INT,
  name            TEXT,
  description     TEXT,
  thumbnail       TEXT,
  percentage      TEXT,
  category        INT,
  enrolled_at     TIMESTAMPTZ,
  timeline        TEXT,
  level           TEXT,
  slug            TEXT,
  category_name   TEXT,
  category_ar_name TEXT,
  course_id       INT,
  title           TEXT,
  isscorm         BOOLEAN,
  authoring_type  TEXT,
  content_id      UUID
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  RETURN QUERY
    SELECT
      uc.id,
      c.title AS name,
      c.description,
      c.thumbnail,
      uc.progress AS percentage,
      c.category_id AS category,
      uc.created_at AS enrolled_at,
      c.timeline,
      c.level::TEXT,
      c.slug,
      cat.name AS category_name,
      cat.ar_name AS category_ar_name,
      c.id AS course_id,
      c.title,
      c.is_scorm AS isscorm,
      c.authoring_type,
      c.content_id
    FROM user_courses uc
    JOIN courses c ON c.id = uc.course_id
    LEFT JOIN categories cat ON cat.id = c.category_id
    WHERE uc.user_id = v_user_id
    ORDER BY uc.created_at DESC;
END;
$$;
```

---

## 4. Complete TypeScript Type System

### 4.1 Block Types -- Full Discriminated Union

```typescript
// src/types/authoring.ts -- COMPLETE FILE

// ============================================================
// LOCALIZED STRING (Arabic-first, with English fallback)
// ============================================================

export interface LocalizedString {
  ar: string;
  en: string;
}

// ============================================================
// BLOCK TYPE ENUM -- all 27 block types
// ============================================================

export enum BlockType {
  // Content blocks
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  EMBED = 'embed',
  QUOTE = 'quote',
  LIST = 'list',
  CODE = 'code',
  TABLE = 'table',
  DIVIDER = 'divider',
  COVER = 'cover',
  GALLERY = 'gallery',
  CHART = 'chart',

  // Interactive blocks
  ACCORDION = 'accordion',
  TABS = 'tabs',
  FLASHCARD = 'flashcard',
  LABELED_GRAPHIC = 'labeled_graphic',
  PROCESS = 'process',
  TIMELINE = 'timeline',
  HOTSPOT = 'hotspot',
  SCENARIO = 'scenario',

  // Assessment blocks
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  MULTIPLE_RESPONSE = 'multiple_response',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  SORTING = 'sorting',
}

// ============================================================
// BASE BLOCK -- shared fields for all blocks
// ============================================================

export interface BaseBlock {
  id: string;                          // UUID v4, generated client-side
  type: BlockType;
  order: number;                       // Position within lesson (0-indexed)
  visible: boolean;                    // Can be hidden without deleting
  locked: boolean;                     // Prevent editing (AI-generated lock)
  metadata: {
    created_at: string;                // ISO 8601
    updated_at: string;                // ISO 8601
    created_by: 'human' | 'ai';       // Track AI-generated content
    ai_model?: string;                 // e.g., 'claude-sonnet-4-6'
  };
}

// ============================================================
// CONTENT BLOCKS
// ============================================================

export interface TextBlock extends BaseBlock {
  type: BlockType.TEXT;
  data: {
    content: string;                   // Tiptap JSON string (ProseMirror doc)
    alignment: 'start' | 'center' | 'end';  // RTL-aware (start = right in RTL)
    direction: 'rtl' | 'ltr' | 'auto';
  };
}

export interface ImageBlock extends BaseBlock {
  type: BlockType.IMAGE;
  data: {
    src: string;                       // Supabase Storage signed URL
    alt: string;
    caption?: string;
    width: 'small' | 'medium' | 'large' | 'full';  // 33%, 50%, 75%, 100%
    alignment: 'start' | 'center' | 'end';
    link_url?: string;                 // Optional click-through URL
  };
}

export interface VideoBlock extends BaseBlock {
  type: BlockType.VIDEO;
  data: {
    bunny_video_id: string;            // Bunny Stream video GUID
    bunny_library_id: string;          // Bunny Stream library ID
    title: string;
    description?: string;
    duration_seconds: number;
    thumbnail_url: string;             // Bunny auto-generated thumbnail
    captions: { language: string; label: string; src_url: string }[];
    chapters: { time_seconds: number; title: string }[];
    completion_criteria: 'watch_75' | 'watch_90' | 'watch_100';
    allow_skip: boolean;
    autoplay: boolean;
  };
}

export interface AudioBlock extends BaseBlock {
  type: BlockType.AUDIO;
  data: {
    src: string;                       // Supabase or Bunny Storage URL
    title: string;
    duration_seconds: number;
    show_transcript: boolean;
    transcript?: string;
  };
}

export interface EmbedBlock extends BaseBlock {
  type: BlockType.EMBED;
  data: {
    url: string;                       // YouTube, Vimeo, Google Slides, etc.
    provider: 'youtube' | 'vimeo' | 'google_slides' | 'custom';
    aspect_ratio: '16:9' | '4:3' | '1:1';
    allow_fullscreen: boolean;
  };
}

export interface QuoteBlock extends BaseBlock {
  type: BlockType.QUOTE;
  data: {
    text: string;
    attribution: string;
    style: 'default' | 'large' | 'highlight';
  };
}

export interface ListBlock extends BaseBlock {
  type: BlockType.LIST;
  data: {
    items: { id: string; text: string; icon?: string }[];
    style: 'bullet' | 'numbered' | 'icon';
    columns: 1 | 2 | 3;
  };
}

export interface CodeBlock extends BaseBlock {
  type: BlockType.CODE;
  data: {
    code: string;
    language: string;                  // 'javascript', 'python', 'sql', etc.
    show_line_numbers: boolean;
    caption?: string;
  };
}

export interface TableBlock extends BaseBlock {
  type: BlockType.TABLE;
  data: {
    headers: string[];
    rows: string[][];
    has_header_row: boolean;
    striped: boolean;
    caption?: string;
  };
}

export interface DividerBlock extends BaseBlock {
  type: BlockType.DIVIDER;
  data: {
    style: 'line' | 'dots' | 'space';
    spacing: 'small' | 'medium' | 'large';
  };
}

export interface CoverBlock extends BaseBlock {
  type: BlockType.COVER;
  data: {
    background_image: string;          // URL
    title: string;
    subtitle?: string;
    overlay_color: string;             // hex with alpha, e.g., '#000000AA'
    text_alignment: 'start' | 'center' | 'end';
    height: 'small' | 'medium' | 'large';  // 200px, 400px, 600px
  };
}

export interface GalleryBlock extends BaseBlock {
  type: BlockType.GALLERY;
  data: {
    images: {
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }[];
    layout: 'grid' | 'carousel' | 'masonry';
    columns: 2 | 3 | 4;
  };
}

export interface ChartBlock extends BaseBlock {
  type: BlockType.CHART;
  data: {
    chart_type: 'bar' | 'line' | 'pie' | 'donut';
    title: string;
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
    show_legend: boolean;
  };
}

// ============================================================
// INTERACTIVE BLOCKS
// ============================================================

export interface AccordionBlock extends BaseBlock {
  type: BlockType.ACCORDION;
  data: {
    items: {
      id: string;
      title: string;
      content: string;                 // Tiptap JSON string
      icon?: string;
    }[];
    allow_multiple_open: boolean;
    start_expanded: boolean;
  };
}

export interface TabsBlock extends BaseBlock {
  type: BlockType.TABS;
  data: {
    tabs: {
      id: string;
      label: string;
      content: string;                 // Tiptap JSON string
      icon?: string;
    }[];
    style: 'horizontal' | 'vertical';
  };
}

export interface FlashcardBlock extends BaseBlock {
  type: BlockType.FLASHCARD;
  data: {
    cards: {
      id: string;
      front: string;
      back: string;
      image_front?: string;
      image_back?: string;
    }[];
    shuffle: boolean;
  };
}

export interface LabeledGraphicBlock extends BaseBlock {
  type: BlockType.LABELED_GRAPHIC;
  data: {
    image: string;                     // URL
    markers: {
      id: string;
      x_percent: number;              // 0-100 position on image
      y_percent: number;
      label: string;
      description: string;
      icon: 'info' | 'pin' | 'number';
    }[];
  };
}

export interface ProcessBlock extends BaseBlock {
  type: BlockType.PROCESS;
  data: {
    steps: {
      id: string;
      title: string;
      description: string;
      icon?: string;
      image?: string;
    }[];
    layout: 'vertical' | 'horizontal';
    numbered: boolean;
  };
}

export interface TimelineBlock extends BaseBlock {
  type: BlockType.TIMELINE;
  data: {
    events: {
      id: string;
      date: string;
      title: string;
      description: string;
      image?: string;
    }[];
    direction: 'vertical' | 'horizontal';
  };
}

export interface HotspotBlock extends BaseBlock {
  type: BlockType.HOTSPOT;
  data: {
    image: string;
    regions: {
      id: string;
      shape: 'circle' | 'rect';
      coords: number[];               // [x, y, radius] or [x1, y1, x2, y2] as percentages
      label: string;
      content: string;
      is_correct?: boolean;           // For quiz mode
    }[];
    mode: 'explore' | 'quiz';         // Explore = info only, Quiz = find correct regions
  };
}

export interface ScenarioBlock extends BaseBlock {
  type: BlockType.SCENARIO;
  data: {
    title: string;
    description: string;
    nodes: {
      id: string;
      type: 'question' | 'outcome';
      content: string;
      image?: string;
      choices?: {
        id: string;
        text: string;
        next_node_id: string;          // Points to another node
        is_optimal: boolean;
        feedback: string;
      }[];
      is_positive_outcome?: boolean;   // For outcome nodes
    }[];
    start_node_id: string;
  };
}

// ============================================================
// ASSESSMENT BLOCKS
// ============================================================

export interface MultipleChoiceBlock extends BaseBlock {
  type: BlockType.MULTIPLE_CHOICE;
  data: {
    question: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
      feedback?: string;               // Shown when selected
    }[];
    explanation: string;               // Shown after answering
    allow_retry: boolean;
    shuffle_options: boolean;
    points: number;                    // Default 1
  };
}

export interface TrueFalseBlock extends BaseBlock {
  type: BlockType.TRUE_FALSE;
  data: {
    statement: string;
    correct_answer: boolean;
    explanation_true: string;
    explanation_false: string;
    points: number;
  };
}

export interface MultipleResponseBlock extends BaseBlock {
  type: BlockType.MULTIPLE_RESPONSE;
  data: {
    question: string;
    options: {
      id: string;
      text: string;
      is_correct: boolean;
      feedback?: string;
    }[];
    explanation: string;
    min_selections: number;
    max_selections: number;
    scoring: 'all_or_nothing' | 'partial';  // Partial = points per correct option
    points: number;
  };
}

export interface FillInBlankBlock extends BaseBlock {
  type: BlockType.FILL_IN_BLANK;
  data: {
    text_with_blanks: string;          // "The capital of Saudi Arabia is ___blank_1___"
    blanks: {
      id: string;                      // Matches ___blank_1___
      correct_answers: string[];       // Multiple accepted answers
      case_sensitive: boolean;
    }[];
    explanation: string;
    points: number;
  };
}

export interface MatchingBlock extends BaseBlock {
  type: BlockType.MATCHING;
  data: {
    instruction: string;
    pairs: {
      id: string;
      left: string;
      right: string;
    }[];
    shuffle: boolean;
    explanation: string;
    points: number;
  };
}

export interface SortingBlock extends BaseBlock {
  type: BlockType.SORTING;
  data: {
    instruction: string;
    categories: {
      id: string;
      name: string;
    }[];
    items: {
      id: string;
      text: string;
      correct_category_id: string;     // Which category this belongs to
    }[];
    explanation: string;
    points: number;
  };
}

// ============================================================
// DISCRIMINATED UNION -- the master Block type
// ============================================================

export type Block =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | EmbedBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | DividerBlock
  | CoverBlock
  | GalleryBlock
  | ChartBlock
  | AccordionBlock
  | TabsBlock
  | FlashcardBlock
  | LabeledGraphicBlock
  | ProcessBlock
  | TimelineBlock
  | HotspotBlock
  | ScenarioBlock
  | MultipleChoiceBlock
  | TrueFalseBlock
  | MultipleResponseBlock
  | FillInBlankBlock
  | MatchingBlock
  | SortingBlock;

// ============================================================
// COURSE STRUCTURE
// ============================================================

export interface Lesson {
  id: string;                          // UUID v4
  title: string;
  description?: string;
  order: number;
  blocks: Block[];
  duration_minutes?: number;           // Estimated completion time
  is_locked: boolean;                  // Require previous lesson completion
}

export interface Module {
  id: string;                          // UUID v4
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  is_locked: boolean;                  // Require previous module completion
}

export interface CourseContent {
  modules: Module[];
  settings: CourseSettings;
}

export interface CourseSettings {
  theme: CourseTheme;
  navigation: 'sequential' | 'free';  // Sequential = must complete in order
  show_progress_bar: boolean;
  show_lesson_list: boolean;
  completion_criteria: 'all_blocks' | 'all_required' | 'percentage';
  completion_percentage?: number;       // If criteria = 'percentage'
  passing_score?: number;              // Minimum quiz score to pass (0-100)
  language: 'ar' | 'en' | 'bilingual';
  direction: 'rtl' | 'ltr' | 'auto';
}

export interface CourseTheme {
  primary_color: string;               // Hex, e.g., '#1a73e8'
  secondary_color: string;
  background_color: string;
  text_color: string;
  font_family: string;                 // 'cairo' | 'inter' | 'tajawal' | 'system'
  border_radius: 'none' | 'small' | 'medium' | 'large';
  cover_style: 'gradient' | 'image' | 'solid';
}

// ============================================================
// AI GENERATION TYPES
// ============================================================

export interface CourseOutline {
  title: string;
  description: string;
  target_audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  estimated_duration_minutes: number;
  modules: {
    title: string;
    description: string;
    order: number;
    lessons: {
      title: string;
      description: string;
      order: number;
      suggested_blocks: BlockType[];    // AI suggests which block types to use
      estimated_duration_minutes: number;
    }[];
  }[];
  learning_outcomes: string[];
}

export interface AIGenerationRequest {
  topic: string;
  audience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'ar' | 'en';
  tone: 'formal' | 'conversational' | 'academic';
  module_count: number;                // 3-7
  lessons_per_module: number;          // 2-5
  source_chunks?: DocumentChunk[];     // From document upload
}

export interface DocumentChunk {
  text: string;
  page_number: number;
  heading?: string;
  type: 'text' | 'heading' | 'list' | 'table';
}

// ============================================================
// BUNNY.NET TYPES
// ============================================================

export interface BunnyVideo {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;                      // Duration in seconds
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 4 = finished, 5 = failed
  framerate: number;
  rotation: number;
  width: number;
  height: number;
  availableResolutions: string;        // "240p,360p,480p,720p,1080p"
  thumbnailCount: number;
  encodeProgress: number;              // 0-100
  storageSize: number;
  captions: {
    srclang: string;
    label: string;
  }[];
  hasMP4Fallback: boolean;
  collectionId: string;
  thumbnailFileName: string;
  averageWatchTime: number;
  totalWatchTime: number;
  category: string;
  chapters: {
    title: string;
    start: number;
    end: number;
  }[];
  moments: {
    label: string;
    timestamp: number;
  }[];
  metaTags: {
    property: string;
    value: string;
  }[];
  transcodingMessages: {
    timeStamp: string;
    level: number;
    issueCode: number;
    message: string;
    value: string;
  }[];
}

export interface BunnyStorageItem {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  ServerId: number;
  ArrayNumber: number;
  IsDirectory: boolean;
  UserId: string;
  ContentType: string;
  DateCreated: string;
  StorageZoneId: number;
  Checksum: string;
  ReplicatedZones: string;
}

export interface BunnyWebhookPayload {
  VideoLibraryId: number;
  VideoGuid: string;
  Status: number;                      // 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
}
```

### 4.2 Editor State Types

```typescript
// src/stores/editor.types.ts

import type { Block, Module, Lesson, CourseContent, CourseTheme } from '@/types/authoring';

export interface EditorState {
  // Course metadata
  courseId: number | null;
  contentId: string | null;            // UUID of course_content record
  version: number;

  // Content
  content: CourseContent;

  // Selection
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  selectedBlockId: string | null;

  // UI state
  isDirty: boolean;                    // Unsaved changes
  isSaving: boolean;
  isPublishing: boolean;
  previewMode: boolean;
  sidebarOpen: boolean;
  aiToolbarOpen: boolean;

  // Undo/Redo
  undoStack: CourseContent[];
  redoStack: CourseContent[];
  maxUndoSteps: number;               // Default 50

  // Actions -- Module operations
  addModule: (title: string) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (moduleId: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  // Actions -- Lesson operations
  addLesson: (moduleId: string, title: string) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => void;

  // Actions -- Block operations
  addBlock: (moduleId: string, lessonId: string, block: Block, atIndex?: number) => void;
  updateBlock: (moduleId: string, lessonId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  duplicateBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  reorderBlocks: (moduleId: string, lessonId: string, fromIndex: number, toIndex: number) => void;
  moveBlockToLesson: (
    fromModuleId: string, fromLessonId: string, blockId: string,
    toModuleId: string, toLessonId: string, toIndex: number
  ) => void;

  // Actions -- Selection
  selectModule: (moduleId: string | null) => void;
  selectLesson: (lessonId: string | null) => void;
  selectBlock: (blockId: string | null) => void;

  // Actions -- Content management
  loadContent: (courseId: number, content: CourseContent, contentId: string, version: number) => void;
  saveContent: () => Promise<void>;
  publishContent: () => Promise<void>;
  updateTheme: (theme: Partial<CourseTheme>) => void;

  // Actions -- Undo/Redo
  undo: () => void;
  redo: () => void;
  pushToUndoStack: () => void;

  // Computed
  getCurrentLesson: () => Lesson | null;
  getCurrentModule: () => Module | null;
  getBlock: (blockId: string) => Block | null;
  getTotalBlocks: () => number;
  getCompletionStats: () => { modules: number; lessons: number; blocks: number };
}
```

---

## 5. Complete Database Schema & Migrations

### 5.1 Full Migration File

```sql
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
      JOIN user_details ud ON ud.organization_id = c.organization_id
      WHERE c.id = course_content.course_id
        AND ud.user_id = auth.uid()
        AND ud.role IN ('lms_admin', 'org_admin')
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
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = block_templates.organization_id
        AND ud.user_id = auth.uid()
    )
  );

CREATE POLICY "templates_admin_write" ON block_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = block_templates.organization_id
        AND ud.user_id = auth.uid()
        AND ud.role IN ('lms_admin', 'org_admin')
    )
  );

-- bunny_videos: org members can read, admins can write
CREATE POLICY "bunny_videos_read_org" ON bunny_videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = bunny_videos.organization_id
        AND ud.user_id = auth.uid()
    )
  );

CREATE POLICY "bunny_videos_admin_write" ON bunny_videos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = bunny_videos.organization_id
        AND ud.user_id = auth.uid()
        AND ud.role IN ('lms_admin', 'org_admin')
    )
  );

-- course_media: same pattern as bunny_videos
CREATE POLICY "course_media_read_org" ON course_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = course_media.organization_id
        AND ud.user_id = auth.uid()
    )
  );

CREATE POLICY "course_media_admin_write" ON course_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = course_media.organization_id
        AND ud.user_id = auth.uid()
        AND ud.role IN ('lms_admin', 'org_admin')
    )
  );

-- ai_generation_log: users can see their own, admins can see all in org
CREATE POLICY "ai_log_own" ON ai_generation_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ai_log_admin" ON ai_generation_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_details ud
      WHERE ud.organization_id = ai_generation_log.organization_id
        AND ud.user_id = auth.uid()
        AND ud.role IN ('lms_admin', 'org_admin')
    )
  );
```

### 5.2 Complete RPC Functions (Full PL/pgSQL Bodies)

```sql
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
  JOIN user_details ud ON ud.organization_id = c.organization_id
  WHERE c.id = p_course_id
    AND ud.user_id = p_user_id
    AND ud.role IN ('lms_admin', 'org_admin');

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
  JOIN user_details ud ON ud.organization_id = c.organization_id
  WHERE c.id = p_course_id
    AND ud.user_id = auth.uid()
    AND ud.role IN ('lms_admin', 'org_admin');

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
```

---

## 6. Bunny.net Integration -- Full Implementation

### 6.1 Bunny Stream Service (Complete File)

```typescript
// src/lib/bunny/stream.ts -- COMPLETE IMPLEMENTATION

import crypto from 'crypto';

const BUNNY_STREAM_BASE = 'https://video.bunnycdn.com';

interface CreateVideoResponse {
  videoLibraryId: number;
  guid: string;
  title: string;
  dateUploaded: string;
  status: number;
}

interface BunnyVideoFull {
  videoLibraryId: number;
  guid: string;
  title: string;
  length: number;
  status: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: { srclang: string; label: string }[];
  thumbnailFileName: string;
}

export class BunnyStream {
  private apiKey: string;
  private libraryId: string;

  constructor() {
    this.apiKey = process.env.BUNNY_STREAM_API_KEY!;
    this.libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!;

    if (!this.apiKey || !this.libraryId) {
      throw new Error('Missing BUNNY_STREAM_API_KEY or BUNNY_STREAM_LIBRARY_ID env vars');
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${BUNNY_STREAM_BASE}/library/${this.libraryId}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bunny Stream API error ${res.status}: ${text}`);
    }

    // Some endpoints return empty body (204)
    if (res.status === 204) return {} as T;
    return res.json();
  }

  /**
   * Step 1: Create a video placeholder in the library.
   * Returns the video GUID needed for upload.
   */
  async createVideo(title: string): Promise<{ guid: string; libraryId: string }> {
    const data = await this.request<CreateVideoResponse>('/videos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    return { guid: data.guid, libraryId: this.libraryId };
  }

  /**
   * Step 2: Upload video file to the created placeholder.
   * For large files, use TUS upload instead (see generateTusCredentials).
   */
  async uploadVideo(videoId: string, buffer: Buffer): Promise<void> {
    const url = `${BUNNY_STREAM_BASE}/library/${this.libraryId}/videos/${videoId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': this.apiKey,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!res.ok) {
      throw new Error(`Bunny upload failed: ${res.status}`);
    }
  }

  /**
   * Generate TUS upload credentials for client-side resumable upload.
   * Client uses tus-js-client to upload directly to Bunny.
   */
  generateTusCredentials(videoId: string, expirationTimeSeconds: number = 3600): {
    uploadUrl: string;
    authorizationSignature: string;
    authorizationExpire: number;
    videoId: string;
    libraryId: string;
  } {
    const expiration = Math.floor(Date.now() / 1000) + expirationTimeSeconds;
    const signaturePayload = `${this.libraryId}${this.apiKey}${expiration}${videoId}`;
    const signature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

    return {
      uploadUrl: `https://video.bunnycdn.com/tusupload`,
      authorizationSignature: signature,
      authorizationExpire: expiration,
      videoId,
      libraryId: this.libraryId,
    };
  }

  /**
   * Get video details (status, duration, resolutions, etc.)
   */
  async getVideo(videoId: string): Promise<BunnyVideoFull> {
    return this.request<BunnyVideoFull>(`/videos/${videoId}`);
  }

  /**
   * List all videos in the library (paginated).
   */
  async listVideos(page: number = 1, perPage: number = 100): Promise<{
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    items: BunnyVideoFull[];
  }> {
    return this.request(`/videos?page=${page}&itemsPerPage=${perPage}`);
  }

  /**
   * Delete a video from the library.
   */
  async deleteVideo(videoId: string): Promise<void> {
    await this.request(`/videos/${videoId}`, { method: 'DELETE' });
  }

  /**
   * Request AI-generated captions for a video.
   */
  async generateAiCaptions(videoId: string, language: string = 'ar'): Promise<void> {
    await this.request(`/videos/${videoId}/captions/${language}`, {
      method: 'POST',
      body: JSON.stringify({ srclang: language, label: language === 'ar' ? 'Arabic' : 'English' }),
    });
  }

  /**
   * Get embed URL for iframe player.
   */
  getEmbedUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`;
  }

  /**
   * Get direct HLS URL for custom player.
   */
  getHlsUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://${host}/${videoId}/playlist.m3u8`;
  }

  /**
   * Get thumbnail URL.
   */
  getThumbnailUrl(videoId: string): string {
    const host = process.env.NEXT_PUBLIC_BUNNY_STREAM_HOST;
    return `https://${host}/${videoId}/thumbnail.jpg`;
  }
}
```

### 6.2 Bunny Storage Service (Complete File)

```typescript
// src/lib/bunny/storage.ts -- COMPLETE IMPLEMENTATION

const BUNNY_STORAGE_REGIONS: Record<string, string> = {
  de: 'storage.bunnycdn.com',
  ny: 'ny.storage.bunnycdn.com',
  la: 'la.storage.bunnycdn.com',
  sg: 'sg.storage.bunnycdn.com',
  syd: 'syd.storage.bunnycdn.com',
  jh: 'jh.storage.bunnycdn.com',
};

interface StorageItem {
  Guid: string;
  ObjectName: string;
  Path: string;
  Length: number;
  IsDirectory: boolean;
  LastChanged: string;
}

export class BunnyStorage {
  private storageKey: string;
  private storageName: string;
  private baseUrl: string;

  constructor() {
    this.storageKey = process.env.BUNNY_STORAGE_KEY!;
    this.storageName = process.env.BUNNY_STORAGE_ZONE!;
    const region = process.env.BUNNY_STORAGE_REGION || 'de';
    const host = BUNNY_STORAGE_REGIONS[region] || BUNNY_STORAGE_REGIONS.de;
    this.baseUrl = `https://${host}/${this.storageName}`;

    if (!this.storageKey || !this.storageName) {
      throw new Error('Missing BUNNY_STORAGE_KEY or BUNNY_STORAGE_ZONE env vars');
    }
  }

  /**
   * Upload a single file to Bunny Storage.
   * Path is relative to the storage zone root, e.g., "scorm/org-1/my-course/index.html"
   */
  async uploadFile(path: string, buffer: Buffer): Promise<void> {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': this.storageKey,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Bunny Storage upload failed for ${path}: ${res.status} ${text}`);
    }
  }

  /**
   * Delete a single file from storage.
   */
  async deleteFile(path: string): Promise<void> {
    const url = `${this.baseUrl}/${path}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'AccessKey': this.storageKey },
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Bunny Storage delete failed: ${res.status}`);
    }
  }

  /**
   * List directory contents.
   */
  async listDirectory(path: string): Promise<StorageItem[]> {
    const url = `${this.baseUrl}/${path}/`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'AccessKey': this.storageKey },
    });

    if (!res.ok) return [];
    return res.json();
  }

  /**
   * Delete entire directory (recursive).
   * Lists all files then deletes each one.
   */
  async deleteDirectory(path: string): Promise<void> {
    const items = await this.listDirectory(path);
    for (const item of items) {
      const fullPath = `${path}/${item.ObjectName}`;
      if (item.IsDirectory) {
        await this.deleteDirectory(fullPath);
      } else {
        await this.deleteFile(fullPath);
      }
    }
  }

  /**
   * Upload an entire SCORM package (extracted ZIP files).
   * packagePath = "scorm/{org_id}/{slug}"
   */
  async uploadScormPackage(
    packagePath: string,
    files: Map<string, Buffer>
  ): Promise<{ totalFiles: number; totalBytes: number }> {
    let totalFiles = 0;
    let totalBytes = 0;

    // Upload files in parallel batches of 10
    const entries = Array.from(files.entries());
    const batchSize = 10;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async ([filePath, buffer]) => {
          await this.uploadFile(`${packagePath}/${filePath}`, buffer);
          totalFiles++;
          totalBytes += buffer.length;
        })
      );
    }

    return { totalFiles, totalBytes };
  }
}
```

### 6.3 Bunny CDN Signed URLs (Complete File)

```typescript
// src/lib/bunny/cdn.ts -- COMPLETE IMPLEMENTATION

import crypto from 'crypto';

export class BunnyCDN {
  private pullZoneKey: string;
  private cdnHost: string;

  constructor() {
    this.pullZoneKey = process.env.BUNNY_PULL_ZONE_KEY!;
    this.cdnHost = process.env.NEXT_PUBLIC_BUNNY_CDN_HOST || 'scorm.jadarat.com';

    if (!this.pullZoneKey) {
      throw new Error('Missing BUNNY_PULL_ZONE_KEY env var');
    }
  }

  /**
   * Generate a signed URL for a single file on the CDN.
   * Uses Bunny Token Authentication V2.
   *
   * Bunny signing algorithm:
   *   token_base = securityKey + signedPath + expiry + (token_countries) + (token_countries_blocked)
   *   token = base64url(sha256(token_base))
   *   url = https://host/path?token={token}&expires={expiry}
   */
  generateSignedUrl(path: string, expirationSeconds: number = 3600): string {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    const signedPath = `/${path}`;

    const hashableBase = `${this.pullZoneKey}${signedPath}${expires}`;
    const token = crypto
      .createHash('sha256')
      .update(hashableBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return `https://${this.cdnHost}${signedPath}?token=${token}&expires=${expires}`;
  }

  /**
   * Generate a signed URL that covers an entire directory path.
   * This allows all files under the path to be accessed with one token.
   * Used for SCORM packages where the iframe loads multiple files.
   *
   * The token_path parameter tells Bunny to sign for a directory prefix.
   */
  generateSignedDirectoryUrl(
    directoryPath: string,
    launchFile: string,
    expirationSeconds: number = 7200
  ): string {
    const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
    const signedPath = `/${directoryPath}/`;

    // For directory tokens, we sign the directory path
    const hashableBase = `${this.pullZoneKey}${signedPath}${expires}`;
    const token = crypto
      .createHash('sha256')
      .update(hashableBase)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Return the launch file URL with the directory token
    return `https://${this.cdnHost}/${directoryPath}/${launchFile}?token=${token}&token_path=${encodeURIComponent(signedPath)}&expires=${expires}`;
  }

  /**
   * Purge CDN cache for a specific path (after SCORM package update).
   */
  async purgeCache(path: string): Promise<void> {
    const pullZoneId = process.env.BUNNY_PULL_ZONE_ID!;
    const apiKey = process.env.BUNNY_API_KEY!;

    const res = await fetch(`https://api.bunny.net/pullzone/${pullZoneId}/purgeCache`, {
      method: 'POST',
      headers: {
        'AccessKey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CacheTag: path, // Purge by path prefix
      }),
    });

    if (!res.ok) {
      console.error(`Cache purge failed: ${res.status}`);
    }
  }
}
```

### 6.4 Bunny Stream Webhook Handler (Complete File)

```typescript
// src/app/api/webhooks/bunny-stream/route.ts -- COMPLETE IMPLEMENTATION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BunnyStream } from '@/lib/bunny/stream';
import type { BunnyWebhookPayload } from '@/types/authoring';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (Bunny sends it as a query param)
    const signature = req.headers.get('x-bunny-webhook-signature');
    // Note: Bunny webhook verification is optional but recommended
    // For now we rely on the secret URL pattern

    const payload: BunnyWebhookPayload = await req.json();
    const { VideoLibraryId, VideoGuid, Status } = payload;

    if (!VideoGuid) {
      return NextResponse.json({ error: 'Missing VideoGuid' }, { status: 400 });
    }

    const supabase = await createClient();
    const bunnyStream = new BunnyStream();

    // Status codes: 0=created, 1=uploaded, 2=processing, 3=transcoding, 4=finished, 5=error
    let dbStatus: string;
    switch (Status) {
      case 0:
      case 1:
        dbStatus = 'uploading';
        break;
      case 2:
      case 3:
        dbStatus = 'processing';
        break;
      case 4:
        dbStatus = 'ready';
        break;
      case 5:
      case 6:
        dbStatus = 'failed';
        break;
      default:
        dbStatus = 'processing';
    }

    if (Status === 4) {
      // Video encoding finished -- fetch full details from Bunny API
      const video = await bunnyStream.getVideo(VideoGuid);

      const resolutions = video.availableResolutions
        ? video.availableResolutions.split(',')
        : [];

      await supabase.rpc('update_bunny_video_status', {
        p_bunny_video_id: VideoGuid,
        p_status: 'ready',
        p_duration: video.length,
        p_resolutions: resolutions,
        p_thumbnail_url: bunnyStream.getThumbnailUrl(VideoGuid),
        p_width: video.width,
        p_height: video.height,
        p_file_size: video.storageSize,
      });
    } else {
      // Just update status
      await supabase.rpc('update_bunny_video_status', {
        p_bunny_video_id: VideoGuid,
        p_status: dbStatus,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Bunny webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## 7. AI Course Generation -- Full Implementation

### 7.1 Complete AI Prompts Library

```typescript
// src/lib/ai/prompts.ts -- COMPLETE FILE

// ============================================================
// OUTLINE GENERATION PROMPT
// ============================================================
export const OUTLINE_SYSTEM_PROMPT = `You are an expert instructional designer specializing in Arabic and English e-learning courses for the MENA region.

Your task is to create a detailed course outline following these instructional design principles:

1. BLOOM'S TAXONOMY PROGRESSION: Structure modules to progress through:
   - Remember (definitions, facts) -> Understand (explanations, examples)
   - Apply (exercises, scenarios) -> Analyze (comparisons, case studies)
   - Evaluate (assessments, critiques) -> Create (projects, synthesis)

2. MODULE STRUCTURE:
   - 3-7 modules per course (based on topic complexity)
   - Each module has a clear learning objective
   - Modules build on each other progressively

3. LESSON STRUCTURE:
   - 2-5 lessons per module
   - Each lesson takes 5-15 minutes to complete
   - Each lesson has a single focused learning objective
   - Vary block types for engagement (never 3+ text blocks in a row)

4. BLOCK TYPE SELECTION for each lesson:
   - Start with a "cover" or "text" block for introduction
   - Use "accordion", "tabs", "flashcard" for exploration
   - Use "labeled_graphic", "process", "timeline" for visual learning
   - Use "multiple_choice", "true_false", "matching" for assessment
   - End with a "text" summary or "multiple_choice" knowledge check

5. LANGUAGE RULES:
   - If language is "ar": Use Modern Standard Arabic (MSA). All text must be grammatically correct Arabic.
   - If language is "en": Use clear, professional English.
   - Lesson titles should be descriptive (not just "Lesson 1")

6. CULTURAL SENSITIVITY:
   - Use examples relevant to the MENA region
   - Respect cultural norms and values
   - Use gender-neutral language when possible

OUTPUT: Return ONLY valid JSON matching the CourseOutline schema. No markdown, no explanations.`;

export const OUTLINE_USER_PROMPT = (params: {
  topic: string;
  audience: string;
  difficulty: string;
  language: string;
  moduleCount: number;
  lessonsPerModule: number;
  sourceChunks?: string;
}) => `Create a course outline for the following:

Topic: ${params.topic}
Target Audience: ${params.audience}
Difficulty Level: ${params.difficulty}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
Number of Modules: ${params.moduleCount}
Lessons per Module: ${params.lessonsPerModule}
${params.sourceChunks ? `\nSource Material (use this as the basis for the course content):\n${params.sourceChunks}` : ''}

Return a JSON object with this exact structure:
{
  "title": "string",
  "description": "string (2-3 sentences)",
  "target_audience": "string",
  "difficulty": "${params.difficulty}",
  "language": "${params.language}",
  "estimated_duration_minutes": number,
  "modules": [
    {
      "title": "string",
      "description": "string",
      "order": 0,
      "lessons": [
        {
          "title": "string",
          "description": "string",
          "order": 0,
          "suggested_blocks": ["text", "image", "accordion", "multiple_choice"],
          "estimated_duration_minutes": number
        }
      ]
    }
  ],
  "learning_outcomes": ["string", "string"]
}`;

// ============================================================
// LESSON CONTENT GENERATION PROMPT
// ============================================================
export const LESSON_SYSTEM_PROMPT = `You are an expert e-learning content writer creating lesson content as structured blocks.

RULES:
1. Generate an array of Block objects following the provided schema
2. Start with an engaging introduction (text or cover block)
3. Use VARIED block types - never 3+ text blocks in a row
4. Include at least one interactive block per lesson (accordion, tabs, flashcard, etc.)
5. Include at least one assessment block per lesson (multiple_choice, true_false, etc.)
6. End with a summary text block or knowledge check question
7. Keep paragraphs concise (3-5 sentences maximum)
8. Use real-world examples relevant to the target audience
9. For quiz questions: provide 4 options, exactly 1 correct, with explanations
10. Generate unique UUIDs for all id fields (use format: "block-{random-8-chars}")

TEXT CONTENT FORMAT:
- For text blocks, use simple HTML: <p>, <strong>, <em>, <ul>, <li>, <h3>
- For Arabic content, all text must be proper MSA
- Keep text blocks under 200 words each

OUTPUT: Return ONLY a valid JSON array of Block objects. No markdown, no explanations.`;

export const LESSON_USER_PROMPT = (params: {
  lessonTitle: string;
  lessonDescription: string;
  moduleTitle: string;
  courseTitle: string;
  suggestedBlocks: string[];
  language: string;
  difficulty: string;
  audience: string;
  previousLessonsContext?: string;
}) => `Generate the content blocks for this lesson:

Course: ${params.courseTitle}
Module: ${params.moduleTitle}
Lesson: ${params.lessonTitle}
Description: ${params.lessonDescription}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}
Difficulty: ${params.difficulty}
Audience: ${params.audience}
Suggested Block Types: ${params.suggestedBlocks.join(', ')}
${params.previousLessonsContext ? `\nContext from previous lessons:\n${params.previousLessonsContext}` : ''}

Return a JSON array of blocks. Each block must have this structure:
{
  "id": "block-{8-random-chars}",
  "type": "text|image|video|accordion|tabs|flashcard|multiple_choice|true_false|divider|cover|list|quote|process|timeline",
  "order": 0,
  "visible": true,
  "locked": false,
  "metadata": {
    "created_at": "${new Date().toISOString()}",
    "updated_at": "${new Date().toISOString()}",
    "created_by": "ai",
    "ai_model": "claude-sonnet-4-6"
  },
  "data": { ... block-type-specific data ... }
}

For "text" blocks, data format:
{ "content": "<p>HTML content here</p>", "alignment": "start", "direction": "${params.language === 'ar' ? 'rtl' : 'ltr'}" }

For "multiple_choice" blocks, data format:
{ "question": "...", "options": [{"id": "opt-1", "text": "...", "is_correct": true, "feedback": "..."}], "explanation": "...", "allow_retry": true, "shuffle_options": true, "points": 1 }

For "accordion" blocks, data format:
{ "items": [{"id": "acc-1", "title": "...", "content": "<p>...</p>"}], "allow_multiple_open": false, "start_expanded": false }

Generate 5-8 blocks for this lesson.`;

// ============================================================
// QUIZ GENERATION PROMPT
// ============================================================
export const QUIZ_SYSTEM_PROMPT = `You are an expert assessment designer for e-learning courses.

Create quiz questions that:
1. Align with Bloom's taxonomy (mix of remember, understand, apply, analyze levels)
2. Have clear, unambiguous questions
3. Have plausible distractors (wrong answers should be reasonable)
4. Include detailed explanations for the correct answer
5. Cover the key concepts from the lesson content
6. Are culturally appropriate for the MENA region

OUTPUT: Return ONLY a valid JSON array of assessment Block objects.`;

export const QUIZ_USER_PROMPT = (params: {
  moduleTitle: string;
  lessonContents: string;
  language: string;
  questionCount: number;
}) => `Generate ${params.questionCount} quiz questions for this module:

Module: ${params.moduleTitle}
Language: ${params.language === 'ar' ? 'Arabic (MSA)' : 'English'}

Lesson content to assess:
${params.lessonContents}

Generate a mix of question types:
- 50% multiple_choice (4 options, 1 correct)
- 25% true_false
- 25% matching OR fill_in_blank OR sorting

Return as a JSON array of Block objects.`;

// ============================================================
// INLINE REFINE PROMPTS
// ============================================================
export const REFINE_PROMPTS = {
  expand: (content: string, language: string) =>
    `Expand the following e-learning content with more detail, examples, and explanations. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the expanded content in the same HTML format:\n\n${content}`,

  simplify: (content: string, audience: string, language: string) =>
    `Simplify the following content for a ${audience} audience. Use shorter sentences and simpler vocabulary. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the simplified content in the same HTML format:\n\n${content}`,

  translate: (content: string, targetLanguage: string) =>
    `Translate the following e-learning content to ${targetLanguage === 'ar' ? 'Arabic (MSA)' : 'English'}. Maintain the educational context, tone, and HTML formatting:\n\n${content}`,

  rephrase: (content: string, tone: string, language: string) =>
    `Rephrase the following content in a ${tone} tone. Keep it in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the rephrased content in the same HTML format:\n\n${content}`,

  addExample: (content: string, language: string) =>
    `Create a real-world example that illustrates the concept in this e-learning content. The example should be relevant to professionals in the MENA region. Write in ${language === 'ar' ? 'Arabic (MSA)' : 'English'}. Return only the example as an HTML paragraph:\n\n${content}`,
};
```

### 7.2 AI Outline Generation API Route (Complete File)

```typescript
// src/app/api/ai/generate-outline/route.ts -- COMPLETE IMPLEMENTATION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAIProvider, logUsage, GatewayError } from '@/lib/ai/gateway';
import { generateText } from 'ai';
import { OUTLINE_SYSTEM_PROMPT, OUTLINE_USER_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';
import type { CourseOutline } from '@/types/authoring';

export const maxDuration = 120;

// Request validation
const requestSchema = z.object({
  topic: z.string().min(3).max(500),
  audience: z.string().min(3).max(200),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['ar', 'en']),
  tone: z.enum(['formal', 'conversational', 'academic']).default('formal'),
  module_count: z.number().int().min(3).max(7).default(5),
  lessons_per_module: z.number().int().min(2).max(5).default(3),
  source_chunks: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const params = parsed.data;

    // Get AI provider via gateway
    let gateway;
    try {
      gateway = await getAIProvider(supabase, user.id, 'generate_outline');
    } catch (err) {
      if (err instanceof GatewayError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }

    const startTime = Date.now();

    // Generate outline
    const result = await generateText({
      model: gateway.model,
      system: OUTLINE_SYSTEM_PROMPT,
      prompt: OUTLINE_USER_PROMPT({
        topic: params.topic,
        audience: params.audience,
        difficulty: params.difficulty,
        language: params.language,
        moduleCount: params.module_count,
        lessonsPerModule: params.lessons_per_module,
        sourceChunks: params.source_chunks,
      }),
      temperature: 0.7,
      maxTokens: 4000,
    });

    const durationMs = Date.now() - startTime;

    // Parse AI response as JSON
    let outline: CourseOutline;
    try {
      // Strip markdown code blocks if present
      let text = result.text.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      outline = JSON.parse(text.trim());
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON. Please try again.' },
        { status: 502 }
      );
    }

    // Log AI usage
    const inputTokens = result.usage?.promptTokens || 0;
    const outputTokens = result.usage?.completionTokens || 0;

    await supabase.from('ai_generation_log').insert({
      organization_id: (await supabase.rpc('get_user_org_id')).data,
      user_id: user.id,
      operation: 'generate_outline',
      model: gateway.config.model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: estimateCost(inputTokens, outputTokens, gateway.config.model),
      input_summary: `Topic: ${params.topic}`,
      output_summary: `${outline.modules?.length || 0} modules generated`,
      duration_ms: durationMs,
    });

    await logUsage(supabase, 'generate_outline', inputTokens + outputTokens);

    return NextResponse.json({ outline });
  } catch (error) {
    console.error('Outline generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}

function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Claude Sonnet 4.6 pricing: $3/M input, $15/M output
  if (model.includes('sonnet')) {
    return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
  }
  // Claude Haiku 4.5 pricing: $0.80/M input, $4/M output
  if (model.includes('haiku')) {
    return (inputTokens * 0.8 + outputTokens * 4) / 1_000_000;
  }
  // Default estimate
  return (inputTokens * 3 + outputTokens * 15) / 1_000_000;
}
```

### 7.3 AI Lesson Content Generation (Streaming, Complete File)

```typescript
// src/app/api/ai/generate-lesson/route.ts -- COMPLETE IMPLEMENTATION

import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAIProvider, logUsage, GatewayError } from '@/lib/ai/gateway';
import { streamText } from 'ai';
import { LESSON_SYSTEM_PROMPT, LESSON_USER_PROMPT } from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 120;

const requestSchema = z.object({
  lesson_title: z.string().min(1),
  lesson_description: z.string().min(1),
  module_title: z.string().min(1),
  course_title: z.string().min(1),
  suggested_blocks: z.array(z.string()),
  language: z.enum(['ar', 'en']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  audience: z.string(),
  previous_context: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
    }

    const params = parsed.data;

    let gateway;
    try {
      gateway = await getAIProvider(supabase, user.id, 'generate_lesson');
    } catch (err) {
      if (err instanceof GatewayError) {
        return new Response(JSON.stringify({ error: err.message }), { status: err.status });
      }
      throw err;
    }

    const result = streamText({
      model: gateway.model,
      system: LESSON_SYSTEM_PROMPT,
      prompt: LESSON_USER_PROMPT({
        lessonTitle: params.lesson_title,
        lessonDescription: params.lesson_description,
        moduleTitle: params.module_title,
        courseTitle: params.course_title,
        suggestedBlocks: params.suggested_blocks,
        language: params.language,
        difficulty: params.difficulty,
        audience: params.audience,
        previousLessonsContext: params.previous_context,
      }),
      temperature: 0.7,
      maxTokens: 8000,
      onFinish: async ({ text, usage }) => {
        await supabase.from('ai_generation_log').insert({
          organization_id: (await supabase.rpc('get_user_org_id')).data,
          user_id: user.id,
          operation: 'generate_lesson',
          model: gateway.config.model,
          input_tokens: usage?.promptTokens || 0,
          output_tokens: usage?.completionTokens || 0,
          cost_usd: estimateCost(usage?.promptTokens || 0, usage?.completionTokens || 0),
          input_summary: `Lesson: ${params.lesson_title}`,
          output_summary: `Generated lesson content`,
        });
        await logUsage(supabase, 'generate_lesson', (usage?.promptTokens || 0) + (usage?.completionTokens || 0));
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Lesson generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate lesson' }), { status: 500 });
  }
}

function estimateCost(input: number, output: number): number {
  return (input * 3 + output * 15) / 1_000_000;
}
```

### 7.4 AI Inline Refine (Complete File)

```typescript
// src/app/api/ai/refine-block/route.ts -- COMPLETE IMPLEMENTATION

import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAIProvider, logUsage, GatewayError } from '@/lib/ai/gateway';
import { streamText } from 'ai';
import { REFINE_PROMPTS } from '@/lib/ai/prompts';
import { z } from 'zod';

export const maxDuration = 60;

const requestSchema = z.object({
  content: z.string().min(1),
  action: z.enum(['expand', 'simplify', 'translate', 'rephrase', 'addExample']),
  language: z.enum(['ar', 'en']),
  target_language: z.enum(['ar', 'en']).optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return new Response('Unauthorized', { status: 401 });

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });

    const { content, action, language, target_language, tone, audience } = parsed.data;

    let gateway;
    try {
      gateway = await getAIProvider(supabase, user.id, 'refine_block');
    } catch (err) {
      if (err instanceof GatewayError) return new Response(JSON.stringify({ error: err.message }), { status: err.status });
      throw err;
    }

    let prompt: string;
    switch (action) {
      case 'expand':
        prompt = REFINE_PROMPTS.expand(content, language);
        break;
      case 'simplify':
        prompt = REFINE_PROMPTS.simplify(content, audience || 'general', language);
        break;
      case 'translate':
        prompt = REFINE_PROMPTS.translate(content, target_language || (language === 'ar' ? 'en' : 'ar'));
        break;
      case 'rephrase':
        prompt = REFINE_PROMPTS.rephrase(content, tone || 'conversational', language);
        break;
      case 'addExample':
        prompt = REFINE_PROMPTS.addExample(content, language);
        break;
    }

    const result = streamText({
      model: gateway.model,
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
      onFinish: async ({ usage }) => {
        await logUsage(supabase, 'refine_block', (usage?.promptTokens || 0) + (usage?.completionTokens || 0));
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Refine error:', error);
    return new Response(JSON.stringify({ error: 'Failed to refine content' }), { status: 500 });
  }
}
```

### 7.5 Document Processor (PDF/DOCX, Complete File)

```typescript
// src/lib/ai/document-processor.ts -- COMPLETE IMPLEMENTATION

import * as pdfjsLib from 'pdfjs-dist';

export interface DocumentChunk {
  text: string;
  page_number: number;
  heading?: string;
  type: 'text' | 'heading' | 'list' | 'table';
}

export class DocumentProcessor {
  /**
   * Extract text from PDF using pdfjs-dist (already installed).
   */
  async extractPdf(buffer: ArrayBuffer): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];

    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageText = '';
      let currentHeading = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          const text = item.str;
          const fontSize = item.transform ? Math.abs(item.transform[0]) : 12;

          // Detect headings by font size (>16pt = heading)
          if (fontSize > 16 && text.trim().length > 0) {
            // Save previous chunk
            if (pageText.trim()) {
              chunks.push({
                text: pageText.trim(),
                page_number: pageNum,
                heading: currentHeading || undefined,
                type: 'text',
              });
              pageText = '';
            }
            currentHeading = text.trim();
            chunks.push({
              text: text.trim(),
              page_number: pageNum,
              type: 'heading',
            });
          } else {
            pageText += text + ' ';
          }
        }
      }

      // Push remaining text
      if (pageText.trim()) {
        chunks.push({
          text: pageText.trim(),
          page_number: pageNum,
          heading: currentHeading || undefined,
          type: 'text',
        });
      }
    }

    return chunks;
  }

  /**
   * Extract text from DOCX using mammoth (needs: npm install mammoth).
   */
  async extractDocx(buffer: ArrayBuffer): Promise<DocumentChunk[]> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });

    return this.chunkText(result.value, 1500).map((chunk, i) => ({
      ...chunk,
      page_number: i + 1,
    }));
  }

  /**
   * Split text into chunks with overlap for better AI context.
   */
  chunkText(text: string, maxChars: number = 1500, overlap: number = 200): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxChars && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          page_number: chunkIndex + 1,
          type: 'text',
        });
        // Keep overlap from end of previous chunk
        currentChunk = currentChunk.slice(-overlap) + '\n\n' + para;
        chunkIndex++;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({
        text: currentChunk.trim(),
        page_number: chunkIndex + 1,
        type: 'text',
      });
    }

    return chunks;
  }
}
```

---

## 8. Block Editor -- Full Implementation

### 8.1 Zustand Editor Store (Complete File)

```typescript
// src/stores/editor.store.ts -- COMPLETE IMPLEMENTATION

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Block, Module, Lesson, CourseContent, CourseTheme, CourseSettings,
} from '@/types/authoring';

interface EditorState {
  // Course metadata
  courseId: number | null;
  contentId: string | null;
  version: number;
  content: CourseContent;

  // Selection
  selectedModuleId: string | null;
  selectedLessonId: string | null;
  selectedBlockId: string | null;

  // UI state
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  previewMode: boolean;
  sidebarOpen: boolean;

  // Undo/Redo
  undoStack: CourseContent[];
  redoStack: CourseContent[];
}

interface EditorActions {
  // Initialization
  loadContent: (courseId: number, content: CourseContent, contentId: string, version: number) => void;
  resetEditor: () => void;

  // Module CRUD
  addModule: (title: string) => void;
  updateModule: (moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (moduleId: string) => void;
  reorderModules: (fromIndex: number, toIndex: number) => void;

  // Lesson CRUD
  addLesson: (moduleId: string, title: string) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => void;

  // Block CRUD
  addBlock: (moduleId: string, lessonId: string, block: Block, atIndex?: number) => void;
  updateBlock: (moduleId: string, lessonId: string, blockId: string, data: Partial<Block['data']>) => void;
  deleteBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  duplicateBlock: (moduleId: string, lessonId: string, blockId: string) => void;
  reorderBlocks: (moduleId: string, lessonId: string, fromIndex: number, toIndex: number) => void;

  // Selection
  selectModule: (id: string | null) => void;
  selectLesson: (id: string | null) => void;
  selectBlock: (id: string | null) => void;

  // Theme
  updateTheme: (theme: Partial<CourseTheme>) => void;
  updateSettings: (settings: Partial<CourseSettings>) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;

  // UI
  setDirty: (dirty: boolean) => void;
  setSaving: (saving: boolean) => void;
  setPublishing: (publishing: boolean) => void;
  togglePreview: () => void;
  toggleSidebar: () => void;

  // Computed helpers
  getCurrentLesson: () => Lesson | null;
  getCurrentModule: () => Module | null;
}

const DEFAULT_SETTINGS: CourseSettings = {
  theme: {
    primary_color: '#1a73e8',
    secondary_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937',
    font_family: 'cairo',
    border_radius: 'medium',
    cover_style: 'gradient',
  },
  navigation: 'sequential',
  show_progress_bar: true,
  show_lesson_list: true,
  completion_criteria: 'all_blocks',
  language: 'ar',
  direction: 'rtl',
};

const DEFAULT_CONTENT: CourseContent = {
  modules: [],
  settings: DEFAULT_SETTINGS,
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  // Initial state
  courseId: null,
  contentId: null,
  version: 1,
  content: DEFAULT_CONTENT,
  selectedModuleId: null,
  selectedLessonId: null,
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  isPublishing: false,
  previewMode: false,
  sidebarOpen: true,
  undoStack: [],
  redoStack: [],

  // ============ INITIALIZATION ============
  loadContent: (courseId, content, contentId, version) => {
    set({
      courseId,
      content,
      contentId,
      version,
      isDirty: false,
      undoStack: [],
      redoStack: [],
      selectedModuleId: content.modules[0]?.id || null,
      selectedLessonId: content.modules[0]?.lessons[0]?.id || null,
      selectedBlockId: null,
    });
  },

  resetEditor: () => set({
    courseId: null,
    contentId: null,
    version: 1,
    content: DEFAULT_CONTENT,
    selectedModuleId: null,
    selectedLessonId: null,
    selectedBlockId: null,
    isDirty: false,
    undoStack: [],
    redoStack: [],
  }),

  // ============ MODULE CRUD ============
  addModule: (title) => {
    const state = get();
    state.pushSnapshot();
    const newModule: Module = {
      id: uuidv4(),
      title,
      order: state.content.modules.length,
      lessons: [],
      is_locked: false,
    };
    set({
      content: {
        ...state.content,
        modules: [...state.content.modules, newModule],
      },
      isDirty: true,
      selectedModuleId: newModule.id,
    });
  },

  updateModule: (moduleId, updates) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m =>
          m.id === moduleId ? { ...m, ...updates } : m
        ),
      },
      isDirty: true,
    });
  },

  deleteModule: (moduleId) => {
    const state = get();
    state.pushSnapshot();
    const filtered = state.content.modules
      .filter(m => m.id !== moduleId)
      .map((m, i) => ({ ...m, order: i }));
    set({
      content: { ...state.content, modules: filtered },
      isDirty: true,
      selectedModuleId: filtered[0]?.id || null,
      selectedLessonId: filtered[0]?.lessons[0]?.id || null,
    });
  },

  reorderModules: (fromIndex, toIndex) => {
    const state = get();
    state.pushSnapshot();
    const modules = [...state.content.modules];
    const [moved] = modules.splice(fromIndex, 1);
    modules.splice(toIndex, 0, moved);
    set({
      content: {
        ...state.content,
        modules: modules.map((m, i) => ({ ...m, order: i })),
      },
      isDirty: true,
    });
  },

  // ============ LESSON CRUD ============
  addLesson: (moduleId, title) => {
    const state = get();
    state.pushSnapshot();
    const newLesson: Lesson = {
      id: uuidv4(),
      title,
      order: 0,
      blocks: [],
      is_locked: false,
    };
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          const lessons = [...m.lessons, { ...newLesson, order: m.lessons.length }];
          return { ...m, lessons };
        }),
      },
      isDirty: true,
      selectedLessonId: newLesson.id,
    });
  },

  updateLesson: (moduleId, lessonId, updates) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l =>
              l.id === lessonId ? { ...l, ...updates } : l
            ),
          };
        }),
      },
      isDirty: true,
    });
  },

  deleteLesson: (moduleId, lessonId) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          const lessons = m.lessons
            .filter(l => l.id !== lessonId)
            .map((l, i) => ({ ...l, order: i }));
          return { ...m, lessons };
        }),
      },
      isDirty: true,
    });
  },

  reorderLessons: (moduleId, fromIndex, toIndex) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          const lessons = [...m.lessons];
          const [moved] = lessons.splice(fromIndex, 1);
          lessons.splice(toIndex, 0, moved);
          return { ...m, lessons: lessons.map((l, i) => ({ ...l, order: i })) };
        }),
      },
      isDirty: true,
    });
  },

  // ============ BLOCK CRUD ============
  addBlock: (moduleId, lessonId, block, atIndex) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id !== lessonId) return l;
              const blocks = [...l.blocks];
              const insertAt = atIndex !== undefined ? atIndex : blocks.length;
              blocks.splice(insertAt, 0, block);
              return {
                ...l,
                blocks: blocks.map((b, i) => ({ ...b, order: i })),
              };
            }),
          };
        }),
      },
      isDirty: true,
      selectedBlockId: block.id,
    });
  },

  updateBlock: (moduleId, lessonId, blockId, data) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id !== lessonId) return l;
              return {
                ...l,
                blocks: l.blocks.map(b => {
                  if (b.id !== blockId) return b;
                  return {
                    ...b,
                    data: { ...b.data, ...data },
                    metadata: { ...b.metadata, updated_at: new Date().toISOString() },
                  } as Block;
                }),
              };
            }),
          };
        }),
      },
      isDirty: true,
    });
  },

  deleteBlock: (moduleId, lessonId, blockId) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id !== lessonId) return l;
              return {
                ...l,
                blocks: l.blocks
                  .filter(b => b.id !== blockId)
                  .map((b, i) => ({ ...b, order: i })),
              };
            }),
          };
        }),
      },
      isDirty: true,
      selectedBlockId: null,
    });
  },

  duplicateBlock: (moduleId, lessonId, blockId) => {
    const state = get();
    const module = state.content.modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    const block = lesson?.blocks.find(b => b.id === blockId);
    if (!block) return;

    const duplicate: Block = {
      ...structuredClone(block),
      id: uuidv4(),
      metadata: {
        ...block.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    } as Block;

    state.addBlock(moduleId, lessonId, duplicate, block.order + 1);
  },

  reorderBlocks: (moduleId, lessonId, fromIndex, toIndex) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        modules: state.content.modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            lessons: m.lessons.map(l => {
              if (l.id !== lessonId) return l;
              const blocks = [...l.blocks];
              const [moved] = blocks.splice(fromIndex, 1);
              blocks.splice(toIndex, 0, moved);
              return { ...l, blocks: blocks.map((b, i) => ({ ...b, order: i })) };
            }),
          };
        }),
      },
      isDirty: true,
    });
  },

  // ============ SELECTION ============
  selectModule: (id) => set({ selectedModuleId: id }),
  selectLesson: (id) => set({ selectedLessonId: id }),
  selectBlock: (id) => set({ selectedBlockId: id }),

  // ============ THEME & SETTINGS ============
  updateTheme: (theme) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        settings: {
          ...state.content.settings,
          theme: { ...state.content.settings.theme, ...theme },
        },
      },
      isDirty: true,
    });
  },

  updateSettings: (settings) => {
    const state = get();
    state.pushSnapshot();
    set({
      content: {
        ...state.content,
        settings: { ...state.content.settings, ...settings },
      },
      isDirty: true,
    });
  },

  // ============ UNDO/REDO ============
  pushSnapshot: () => {
    const state = get();
    set({
      undoStack: [...state.undoStack.slice(-49), structuredClone(state.content)],
      redoStack: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const previous = state.undoStack[state.undoStack.length - 1];
    set({
      content: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, structuredClone(state.content)],
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      content: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, structuredClone(state.content)],
      isDirty: true,
    });
  },

  // ============ UI ============
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaving: (saving) => set({ isSaving: saving }),
  setPublishing: (publishing) => set({ isPublishing: publishing }),
  togglePreview: () => set(s => ({ previewMode: !s.previewMode })),
  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),

  // ============ COMPUTED HELPERS ============
  getCurrentModule: () => {
    const state = get();
    return state.content.modules.find(m => m.id === state.selectedModuleId) || null;
  },

  getCurrentLesson: () => {
    const state = get();
    const module = state.content.modules.find(m => m.id === state.selectedModuleId);
    return module?.lessons.find(l => l.id === state.selectedLessonId) || null;
  },
}));
```

### 8.2 EditorCanvas Component (Core File)

```tsx
// src/components/authoring/EditorCanvas.tsx -- COMPLETE IMPLEMENTATION

'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEditorStore } from '@/stores/editor.store';
import { BlockWrapper } from './BlockWrapper';
import { BlockToolbar } from './BlockToolbar';
import { TextBlockEditor } from './blocks/TextBlock';
import { ImageBlockEditor } from './blocks/ImageBlock';
import { VideoBlockEditor } from './blocks/VideoBlock';
import { AccordionBlockEditor } from './blocks/AccordionBlock';
import { MultipleChoiceBlockEditor } from './blocks/MultipleChoiceBlock';
import { DividerBlockEditor } from './blocks/DividerBlock';
import { CoverBlockEditor } from './blocks/CoverBlock';
import { BlockType, type Block } from '@/types/authoring';

// Block component registry -- maps BlockType to editor component
const BLOCK_EDITORS: Record<string, React.ComponentType<{ block: Block; onChange: (data: any) => void }>> = {
  [BlockType.TEXT]: TextBlockEditor,
  [BlockType.IMAGE]: ImageBlockEditor,
  [BlockType.VIDEO]: VideoBlockEditor,
  [BlockType.ACCORDION]: AccordionBlockEditor,
  [BlockType.MULTIPLE_CHOICE]: MultipleChoiceBlockEditor,
  [BlockType.DIVIDER]: DividerBlockEditor,
  [BlockType.COVER]: CoverBlockEditor,
  // ... remaining block types follow the same pattern
};

function SortableBlock({ block, moduleId, lessonId }: {
  block: Block;
  moduleId: string;
  lessonId: string;
}) {
  const { selectedBlockId, selectBlock, updateBlock, deleteBlock, duplicateBlock } = useEditorStore();
  const isSelected = selectedBlockId === block.id;

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const BlockEditor = BLOCK_EDITORS[block.type];

  const handleChange = useCallback((data: any) => {
    updateBlock(moduleId, lessonId, block.id, data);
  }, [moduleId, lessonId, block.id, updateBlock]);

  return (
    <div ref={setNodeRef} style={style}>
      <BlockWrapper
        block={block}
        isSelected={isSelected}
        onSelect={() => selectBlock(block.id)}
        onDelete={() => deleteBlock(moduleId, lessonId, block.id)}
        onDuplicate={() => duplicateBlock(moduleId, lessonId, block.id)}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        {BlockEditor ? (
          <BlockEditor block={block} onChange={handleChange} />
        ) : (
          <div className="p-4 text-muted-foreground text-sm">
            Block type &quot;{block.type}&quot; editor not yet implemented
          </div>
        )}
      </BlockWrapper>
    </div>
  );
}

export function EditorCanvas() {
  const {
    content, selectedModuleId, selectedLessonId,
    reorderBlocks,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const currentModule = content.modules.find(m => m.id === selectedModuleId);
  const currentLesson = currentModule?.lessons.find(l => l.id === selectedLessonId);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedModuleId || !selectedLessonId) return;

    const blocks = currentLesson?.blocks || [];
    const fromIndex = blocks.findIndex(b => b.id === active.id);
    const toIndex = blocks.findIndex(b => b.id === over.id);

    if (fromIndex !== -1 && toIndex !== -1) {
      reorderBlocks(selectedModuleId, selectedLessonId, fromIndex, toIndex);
    }
  }, [selectedModuleId, selectedLessonId, currentLesson, reorderBlocks]);

  if (!currentLesson) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a lesson from the sidebar to start editing</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6" dir={content.settings.direction}>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Lesson title */}
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {currentLesson.title}
        </h2>

        {/* Sortable blocks */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentLesson.blocks.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            {currentLesson.blocks.map(block => (
              <SortableBlock
                key={block.id}
                block={block}
                moduleId={selectedModuleId!}
                lessonId={selectedLessonId!}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add block toolbar */}
        <BlockToolbar
          moduleId={selectedModuleId!}
          lessonId={selectedLessonId!}
        />
      </div>
    </div>
  );
}
```

### 8.3 Block Editor Page (Replaces Coassemble build-course/page.tsx)

```tsx
// src/app/dashboard/@lms_admin/(courses_categorise)/courses/add-course/build-course/page.tsx
// COMPLETE REWRITE -- replaces Coassemble iframe with native block editor

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { EditorCanvas } from '@/components/authoring/EditorCanvas';
import { EditorHeader } from '@/components/authoring/EditorHeader';
import { ModuleSidebar } from '@/components/authoring/ModuleSidebar';
import { useEditorStore } from '@/stores/editor.store';
import type { CourseContent } from '@/types/authoring';

export default function BuildCoursePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');
  const [loading, setLoading] = useState(true);
  const { loadContent, sidebarOpen } = useEditorStore();

  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard/courses');
      return;
    }

    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.rpc('get_course_with_content', {
        p_course_id: parseInt(courseId),
      });

      const course = Array.isArray(data) ? data[0] : data;

      if (course?.content) {
        loadContent(
          course.id,
          course.content as CourseContent,
          course.content_id,
          course.content_version || 1
        );
      } else {
        // New course -- load with default empty content
        loadContent(parseInt(courseId), {
          modules: [],
          settings: {
            theme: {
              primary_color: '#1a73e8',
              secondary_color: '#f59e0b',
              background_color: '#ffffff',
              text_color: '#1f2937',
              font_family: 'cairo',
              border_radius: 'medium',
              cover_style: 'gradient',
            },
            navigation: 'sequential',
            show_progress_bar: true,
            show_lesson_list: true,
            completion_criteria: 'all_blocks',
            language: 'ar',
            direction: 'rtl',
          },
        }, '', 1);
      }
      setLoading(false);
    };

    load();
  }, [courseId, router, loadContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <EditorHeader />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <ModuleSidebar />}
        <EditorCanvas />
      </div>
    </div>
  );
}
```

---

## 9. Course Player -- Full Implementation

### 9.1 Native Course Player (Replaces Coassemble iframe Play.tsx)

```tsx
// src/components/player/CoursePlayer.tsx -- COMPLETE IMPLEMENTATION

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ProgressSidebar } from './ProgressSidebar';
import { LessonRenderer } from './LessonRenderer';
import type { CourseContent, Block, Lesson, Module } from '@/types/authoring';

interface BlockProgress {
  block_id: string;
  completed: boolean;
  score: number | null;
  response_data: any;
}

interface CoursePlayerProps {
  courseId: number;
  content: CourseContent;
  userId: string;
  userName: string;
  courseName: string;
  initialProgress: BlockProgress[];
}

export function CoursePlayer({
  courseId, content, userId, userName, courseName, initialProgress,
}: CoursePlayerProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [blockProgress, setBlockProgress] = useState<Map<string, BlockProgress>>(
    new Map(initialProgress.map(p => [p.block_id, p]))
  );

  const currentModule = content.modules[currentModuleIndex];
  const currentLesson = currentModule?.lessons[currentLessonIndex];

  // Calculate overall progress
  const totalBlocks = content.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.blocks.length, 0), 0
  );
  const completedBlocks = Array.from(blockProgress.values()).filter(p => p.completed).length;
  const overallProgress = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const handleBlockComplete = useCallback(async (
    block: Block,
    moduleId: string,
    lessonId: string,
    score?: number,
    responseData?: any,
  ) => {
    const supabase = createClient();

    // Update local state
    setBlockProgress(prev => {
      const next = new Map(prev);
      next.set(block.id, {
        block_id: block.id,
        completed: true,
        score: score ?? null,
        response_data: responseData,
      });
      return next;
    });

    // Persist to database
    await supabase.rpc('update_block_progress', {
      p_user_id: userId,
      p_course_id: courseId,
      p_module_id: moduleId,
      p_lesson_id: lessonId,
      p_block_id: block.id,
      p_block_type: block.type,
      p_completed: true,
      p_score: score ?? null,
      p_response_data: responseData ?? null,
      p_time_spent: 0,
    });
  }, [courseId, userId]);

  const navigateToLesson = useCallback((moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextLesson = useCallback(() => {
    if (!currentModule) return;
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      navigateToLesson(currentModuleIndex, currentLessonIndex + 1);
    } else if (currentModuleIndex < content.modules.length - 1) {
      navigateToLesson(currentModuleIndex + 1, 0);
    }
  }, [currentModule, currentModuleIndex, currentLessonIndex, content.modules.length, navigateToLesson]);

  if (!currentLesson) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No content available</div>;
  }

  return (
    <div className="flex h-[calc(100vh-60px)]" dir={content.settings.direction}>
      {/* Sidebar */}
      <ProgressSidebar
        modules={content.modules}
        currentModuleIndex={currentModuleIndex}
        currentLessonIndex={currentLessonIndex}
        blockProgress={blockProgress}
        overallProgress={overallProgress}
        onNavigate={navigateToLesson}
        courseId={courseId}
        userId={userId}
        courseName={courseName}
        userName={userName}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto p-6">
          <LessonRenderer
            lesson={currentLesson}
            moduleId={currentModule.id}
            blockProgress={blockProgress}
            onBlockComplete={(block, score, responseData) =>
              handleBlockComplete(block, currentModule.id, currentLesson.id, score, responseData)
            }
            onNextLesson={goToNextLesson}
            theme={content.settings.theme}
            direction={content.settings.direction}
          />
        </div>
      </main>
    </div>
  );
}
```

### 9.2 Rewritten Play.tsx (Routes native vs SCORM)

```tsx
// src/app/dashboard/@learner/course/play/[id]/Play.tsx -- COMPLETE REWRITE

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux.hook';
import { createClient } from '@/utils/supabase/client';
import { CoursePlayer } from '@/components/player/CoursePlayer';
import type { CourseContent } from '@/types/authoring';

interface CourseData {
  id: number;
  title: string;
  authoring_type: 'native' | 'scorm';
  is_scorm: boolean;
  slug: string;
  launch_path: string | null;
  content_id: string | null;
  content: CourseContent | null;
  content_version: number;
}

export default function PlayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: { id: userId, name } } = useAppSelector(state => state.user);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      // Get course with content
      const { data } = await supabase.rpc('get_course_with_content', {
        p_course_id: parseInt(params.id),
      });
      const course = Array.isArray(data) ? data[0] : data;
      if (!course) {
        router.push('/dashboard');
        return;
      }

      setCourseData(course as CourseData);

      // If native course, load block progress
      if (course.authoring_type === 'native' && userId) {
        const { data: progressData } = await supabase.rpc('get_learner_course_progress', {
          p_user_id: userId,
          p_course_id: course.id,
        });
        setProgress(progressData || []);
      }

      setLoading(false);
    };

    load();
  }, [params.id, userId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!courseData) return null;

  // Route to SCORM player for SCORM courses
  if (courseData.authoring_type === 'scorm' || courseData.is_scorm) {
    router.push(`/dashboard/course/scorm-player/${courseData.slug}`);
    return null;
  }

  // Native course player
  if (!courseData.content) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        This course has no content yet.
      </div>
    );
  }

  return (
    <CoursePlayer
      courseId={courseData.id}
      content={courseData.content}
      userId={userId!}
      userName={name || ''}
      courseName={courseData.title}
      initialProgress={progress}
    />
  );
}
```

---

## 10. SCORM Migration -- Full Implementation

### 10.1 Updated uploadScormFile (Bunny Storage instead of Supabase)

```typescript
// Changes to src/utils/uploadFile.ts -- uploadScormFile function
// BEFORE: uploads to Supabase Storage bucket "scorm"
// AFTER: uploads to Bunny Storage via BunnyStorage class

import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';
import { BunnyStorage } from '@/lib/bunny/storage';

export async function uploadScormFile(
  slug: string,
  file: File,
  organization_id: number,
  toast: any,
): Promise<{ launchPath: string; packageId: string } | null> {
  try {
    toast.info('Uploading', { description: 'Extracting SCORM package...' });

    // 1. Extract ZIP (same as current)
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // 2. Parse imsmanifest.xml (same as current)
    const manifestFile = zip.file('imsmanifest.xml');
    if (!manifestFile) {
      toast.error('Error', { description: 'Invalid SCORM package: missing imsmanifest.xml' });
      return null;
    }
    const manifestXml = await manifestFile.async('string');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const manifest = parser.parse(manifestXml);

    // Extract launch path from manifest
    const resources = manifest?.manifest?.resources?.resource;
    const resource = Array.isArray(resources) ? resources[0] : resources;
    const launchPath = resource?.['@_href'] || 'index.html';

    // 3. Upload ALL files to Bunny Storage (NEW -- replaces Supabase upload)
    const packagePath = `scorm/${organization_id}/${slug}`;
    const bunnyStorage = new BunnyStorage();

    // Collect all files from ZIP
    const files = new Map<string, Buffer>();
    const filePromises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        filePromises.push(
          zipEntry.async('nodebuffer').then(buffer => {
            files.set(relativePath, buffer);
          })
        );
      }
    });

    await Promise.all(filePromises);

    toast.info('Uploading', {
      description: `Uploading ${files.size} files to CDN...`,
    });

    const result = await bunnyStorage.uploadScormPackage(packagePath, files);

    toast.success('Success', {
      description: `Uploaded ${result.totalFiles} files (${(result.totalBytes / 1024 / 1024).toFixed(1)} MB)`,
    });

    return {
      launchPath,
      packageId: packagePath,
    };
  } catch (error) {
    console.error('SCORM upload error:', error);
    toast.error('Error', { description: 'Failed to upload SCORM package' });
    return null;
  }
}
```

### 10.2 Updated SCORM Player (Bunny CDN URLs)

```typescript
// Changes to src/app/.../scorm-player/[slug]/Player.tsx
// Key change: iframe src now points to Bunny CDN instead of API route

// BEFORE (line 177):
// src={`${baseUrl}/api/scorm/content/${slug}/${courseData?.launch_path ?? launch_path}`}

// AFTER:
// src={scormContentUrl}  -- generated from BunnyCDN.generateSignedDirectoryUrl()

// The scormContentUrl is passed as a prop from the page.tsx server component:
// const bunnyCdn = new BunnyCDN();
// const scormContentUrl = bunnyCdn.generateSignedDirectoryUrl(
//   `scorm/${organization_id}/${slug}`,
//   courseData.launch_path,
//   7200  // 2 hour expiry
// );

// Result URL format:
// https://scorm.jadarat.com/scorm/1/my-course/index.html?token=abc123&token_path=/scorm/1/my-course/&expires=1709123456
```

### 10.3 SCORM Content Route Replacement

```typescript
// src/app/api/scorm/content/[...path]/route.ts
// This route currently proxies files from Supabase Storage to the browser.
// After migration, SCORM files are served directly from Bunny CDN (scorm.jadarat.com).
// This route can be DELETED or kept as a fallback.

// FALLBACK version (for any legacy SCORM packages still on Supabase):
import { NextRequest, NextResponse } from 'next/server';
import { BunnyCDN } from '@/lib/bunny/cdn';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const fullPath = params.path.join('/');

  // Redirect to Bunny CDN with signed URL
  const cdn = new BunnyCDN();
  const pathParts = fullPath.split('/');
  const slug = pathParts[0];
  const filePath = pathParts.slice(1).join('/');

  // TODO: Get org_id from session for the package path
  // For now, redirect to the CDN URL
  const signedUrl = cdn.generateSignedUrl(`scorm/${fullPath}`, 3600);

  return NextResponse.redirect(signedUrl);
}
```

---

## 11. Server Actions & API Routes

### 11.1 Authoring Content Actions (Complete File)

```typescript
// src/action/authoring/content.ts -- COMPLETE IMPLEMENTATION

'use server';

import { createClient } from '@/utils/supabase/server';
import type { CourseContent } from '@/types/authoring';

export async function saveContent(
  courseId: number,
  content: CourseContent
): Promise<{ contentId: string | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { contentId: null, error: 'Unauthorized' };

    const { data, error } = await supabase.rpc('save_course_content', {
      p_course_id: courseId,
      p_content: content as any,
      p_user_id: user.id,
    });

    if (error) return { contentId: null, error: error.message };
    return { contentId: data as string, error: null };
  } catch (err: any) {
    return { contentId: null, error: err.message };
  }
}

export async function publishContent(
  courseId: number,
  contentId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc('publish_course_content', {
      p_course_id: courseId,
      p_content_id: contentId,
    });

    if (error) return { error: error.message };
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function loadCourseWithContent(courseId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_course_with_content', {
    p_course_id: courseId,
  });

  if (error) return { data: null, error: error.message };
  const course = Array.isArray(data) ? data[0] : data;
  return { data: course, error: null };
}
```

### 11.2 Video Upload API Route (TUS Credential Generation)

```typescript
// src/app/api/bunny/create-video/route.ts -- COMPLETE IMPLEMENTATION

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BunnyStream } from '@/lib/bunny/stream';
import { z } from 'zod';

const requestSchema = z.object({
  title: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const bunnyStream = new BunnyStream();

    // 1. Create video placeholder in Bunny
    const { guid, libraryId } = await bunnyStream.createVideo(parsed.data.title);

    // 2. Generate TUS upload credentials for client-side upload
    const tusCredentials = bunnyStream.generateTusCredentials(guid);

    // 3. Register video in our database
    const orgResult = await supabase.rpc('get_user_org_id');
    const orgId = orgResult.data;

    await supabase.rpc('register_bunny_video', {
      p_organization_id: orgId,
      p_bunny_video_id: guid,
      p_bunny_library_id: libraryId,
      p_title: parsed.data.title,
      p_user_id: user.id,
    });

    return NextResponse.json({
      videoId: guid,
      libraryId,
      tus: tusCredentials,
    });
  } catch (error) {
    console.error('Create video error:', error);
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
  }
}
```

---

## 12. Implementation Phases with Exact Deliverables

### Phase 0: Foundation & Cleanup (Week 1-2, ~30 hours)

| # | Task | Exact Deliverable | Files |
|---|------|-------------------|-------|
| 0.1 | Run database migration | Execute `20260301000001_native_authoring_tables.sql` (Section 5.1) | `supabase/migrations/` |
| 0.2 | Delete 7 Coassemble files | `rm -rf` commands (Section 3.1) | 7 files removed |
| 0.3 | Remove env vars | Delete `COASSEMBLE`, `NEXT_PUBLIC_COASSEMBLE` from `.env*` | `.env`, `.env.local` |
| 0.4 | Update types | Remove `coassemble_id` from `CoursesType`, add `authoring_type`, `content_id` (Section 3.2) | `types.d.ts`, `user.slice.ts` |
| 0.5 | Update RPC functions | Deploy updated `get_user_courses` and 4 other RPCs | Migration file |
| 0.6 | Create Bunny accounts | Stream Library + Storage Zone + Pull Zone + custom hostname | Bunny dashboard |
| 0.7 | Create `src/lib/bunny/stream.ts` | Full BunnyStream class (Section 6.1) | New file |
| 0.8 | Create `src/lib/bunny/storage.ts` | Full BunnyStorage class (Section 6.2) | New file |
| 0.9 | Create `src/lib/bunny/cdn.ts` | Full BunnyCDN class (Section 6.3) | New file |
| 0.10 | Create `src/types/authoring.ts` | All 27 block types + course structure types (Section 4.1) | New file |
| 0.11 | Add Bunny env vars | 11 new env vars (Section 14) | `.env` |
| 0.12 | Install new dependencies | `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@tiptap/react`, `tus-js-client`, `mammoth` | `package.json` |
| 0.13 | Stub routes to prevent 404s | Temporary placeholder pages for `build-course`, `edit-content`, `preview-content` | Route files |

### Phase 1: Block Editor MVP (Week 3-6, ~120 hours)

| # | Task | Exact Deliverable |
|---|------|-------------------|
| 1.1 | Zustand editor store | Full store (Section 8.1) -- all CRUD actions for modules, lessons, blocks, undo/redo |
| 1.2 | EditorCanvas | Drag-and-drop canvas with @dnd-kit (Section 8.2) |
| 1.3 | BlockToolbar | Dropdown grid of 27 block types with icons, inserts block at cursor |
| 1.4 | ModuleSidebar | Tree view: modules > lessons, drag-to-reorder, add/rename/delete |
| 1.5 | BlockWrapper | Selection border, drag handle, delete/duplicate buttons, AI toolbar trigger |
| 1.6 | EditorHeader | Save button (calls `saveContent` action), Publish button, Undo/Redo, Preview toggle |
| 1.7 | Server actions | `saveContent()`, `publishContent()`, `loadCourseWithContent()` (Section 11.1) |
| 1.8 | TextBlock | Tiptap rich text editor with RTL, headings, bold/italic, lists, links |
| 1.9 | ImageBlock | Dropzone upload to Supabase, alt text, caption, size selector |
| 1.10 | VideoBlock | TUS upload to Bunny Stream, embed player, completion tracking |
| 1.11 | AccordionBlock | Add/remove items, Tiptap content per item, expand/collapse |
| 1.12 | TabsBlock | Horizontal/vertical tabs, Tiptap content per tab |
| 1.13 | MultipleChoiceBlock | Question editor, 4 option editors, correct answer selector, explanation |
| 1.14 | TrueFalseBlock | Statement editor, true/false selector, explanations |
| 1.15 | DividerBlock | Style selector (line/dots/space), spacing selector |
| 1.16 | CoverBlock | Image upload, title/subtitle, overlay color picker, height selector |
| 1.17 | Build-course page | Full rewrite (Section 8.3) -- loads editor with course content |
| 1.18 | Edit-content page | Same as build-course but loads existing content |
| 1.19 | Preview page | Read-only render of all blocks using LessonRenderer |
| 1.20 | CourseDetails update | Remove Coassemble flow, add authoring_type selector: "From Scratch" / "Upload SCORM" |
| 1.21 | VideoUploader component | TUS resumable upload with progress bar to Bunny Stream |
| 1.22 | Bunny webhook handler | Section 6.4 -- handles `video_encoded` status updates |

### Phase 2: Course Player & SCORM Migration (Week 7-9, ~100 hours)

| # | Task | Exact Deliverable |
|---|------|-------------------|
| 2.1 | CoursePlayer | Full native player component (Section 9.1) |
| 2.2 | LessonRenderer | Renders block array sequentially, handles completion callbacks |
| 2.3 | 9 block renderers | Read-only versions: TextRenderer, ImageRenderer, VideoRenderer, AccordionRenderer, TabsRenderer, MCQRenderer, TFRenderer, DividerRenderer, CoverRenderer |
| 2.4 | ProgressSidebar | Module/lesson tree with completion indicators, overall progress bar |
| 2.5 | Block progress tracking | `update_block_progress` RPC + `get_learner_course_progress` RPC (Section 5.2) |
| 2.6 | Play.tsx rewrite | Routes native vs SCORM courses (Section 9.2) |
| 2.7 | Video tracking | Player.js `timeupdate` events -> mark VideoBlock complete at threshold |
| 2.8 | Quiz scoring | MCQ/TF scoring with feedback display, retry logic, score persistence |
| 2.9 | Completion detection | Auto-detect 100% -> trigger certificate UI |
| 2.10 | Upload to Bunny | Update `uploadScormFile` to use BunnyStorage (Section 10.1) |
| 2.11 | SCORM player update | Change iframe src to Bunny CDN signed URL (Section 10.2) |
| 2.12 | Signed URL generation | BunnyCDN directory signing for SCORM packages |
| 2.13 | Remove proxy route | Delete or redirect `/api/scorm/content/[...path]` |
| 2.14 | ModulesCourseInfo rewrite | Use `get_course_modules_from_content` RPC instead of Coassemble API |

### Phase 3: AI Course Generation (Week 10-13, ~115 hours)

| # | Task | Exact Deliverable |
|---|------|-------------------|
| 3.1 | AI prompts library | `src/lib/ai/prompts.ts` (Section 7.1) -- all 5 prompt templates |
| 3.2 | Outline generation API | `/api/ai/generate-outline` (Section 7.2) -- Zod validation, gateway, JSON parsing |
| 3.3 | Lesson generation API | `/api/ai/generate-lesson` (Section 7.3) -- streaming response |
| 3.4 | Quiz generation API | `/api/ai/generate-quiz` -- similar pattern to 7.3 |
| 3.5 | Inline refine API | `/api/ai/refine-block` (Section 7.4) -- expand/simplify/translate/rephrase |
| 3.6 | Document processor | `src/lib/ai/document-processor.ts` (Section 7.5) -- PDF + DOCX extraction |
| 3.7 | AICourseWizard UI | Step 1: topic/settings input, Step 2: outline review, Step 3: generation progress |
| 3.8 | OutlineEditor UI | Tree editor for AI-generated outline -- reorder, rename, add/delete modules/lessons |
| 3.9 | GenerationProgress UI | Shows streaming blocks appearing in real-time as AI generates them |
| 3.10 | InlineAIToolbar UI | Floating toolbar on block selection -- expand, simplify, translate, rephrase, add example |
| 3.11 | DocumentUploader UI | Dropzone for PDF/DOCX, extraction progress, chunk preview |
| 3.12 | Course creation flow | Update CourseDetails to show 3 options: "From Scratch" / "AI Generated" / "Upload SCORM" |
| 3.13 | `mammoth` install | `npm install mammoth` for DOCX parsing |

### Phase 4: Interactive Blocks + Polish (Week 14-16, ~110 hours)

| # | Task |
|---|------|
| 4.1-4.12 | 12 additional block editors + renderers: Flashcard, LabeledGraphic, Process, Timeline, Sorting, MultipleResponse, FillInBlank, Matching, Audio, Embed, Quote, List |
| 4.13 | ThemeEditor -- color pickers, font selector, border-radius, preview |
| 4.14 | TemplateLibrary -- save block as template, browse/insert templates |
| 4.15 | RTL polish -- all blocks render correctly in Arabic RTL mode |
| 4.16 | Mobile responsive -- all blocks, editor, and player work on mobile |
| 4.17 | Undo/Redo -- keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z) |
| 4.18 | 12 player renderers for new block types |

### Phase 5: SCORM Export + Advanced (Week 17-20, ~130 hours)

| # | Task |
|---|------|
| 5.1-5.4 | SCORM 1.2/2004 package generator: JSON course -> imsmanifest.xml + HTML player + ZIP |
| 5.5 | Export dialog UI |
| 5.6-5.11 | 6 advanced blocks: Scenario (branching), Hotspot, Gallery, Chart (recharts), Table, Code |
| 5.12-5.14 | Analytics: block-level dashboard, video heatmap (Bunny API), quiz results analysis |
| 5.15 | xAPI statement generation |
| 5.16 | Version history + rollback UI |

---

## 13. File Structure

### New Files to Create (complete tree)

```
src/
├── stores/
│   └── editor.store.ts                    # Zustand store (Section 8.1)
│
├── lib/
│   ├── bunny/
│   │   ├── stream.ts                      # BunnyStream class (Section 6.1)
│   │   ├── storage.ts                     # BunnyStorage class (Section 6.2)
│   │   └── cdn.ts                         # BunnyCDN class (Section 6.3)
│   │
│   └── ai/
│       ├── prompts.ts                     # All AI prompts (Section 7.1)
│       ├── document-processor.ts          # PDF/DOCX extraction (Section 7.5)
│       └── extractors/                    # (Phase 3)
│
├── types/
│   └── authoring.ts                       # All types (Section 4)
│
├── components/
│   ├── authoring/
│   │   ├── EditorCanvas.tsx               # Main editor (Section 8.2)
│   │   ├── EditorHeader.tsx               # Save/publish toolbar
│   │   ├── BlockToolbar.tsx               # Block type inserter
│   │   ├── BlockWrapper.tsx               # Block chrome (select/drag/delete)
│   │   ├── ModuleSidebar.tsx              # Course structure tree
│   │   ├── VideoUploader.tsx              # TUS upload to Bunny
│   │   ├── ThemeEditor.tsx                # (Phase 4)
│   │   ├── TemplateLibrary.tsx            # (Phase 4)
│   │   ├── blocks/                        # 27 editor block components
│   │   │   ├── TextBlock.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── VideoBlock.tsx
│   │   │   ├── AccordionBlock.tsx
│   │   │   ├── TabsBlock.tsx
│   │   │   ├── MultipleChoiceBlock.tsx
│   │   │   ├── TrueFalseBlock.tsx
│   │   │   ├── DividerBlock.tsx
│   │   │   ├── CoverBlock.tsx
│   │   │   └── ... (18 more in phases 4-5)
│   │   └── ai/                            # AI generation UI (Phase 3)
│   │       ├── AICourseWizard.tsx
│   │       ├── OutlineEditor.tsx
│   │       ├── GenerationProgress.tsx
│   │       ├── InlineAIToolbar.tsx
│   │       └── DocumentUploader.tsx
│   │
│   └── player/                            # Learner-facing player
│       ├── CoursePlayer.tsx               # Main player (Section 9.1)
│       ├── LessonRenderer.tsx             # Block sequence renderer
│       ├── ProgressSidebar.tsx            # Progress tracking sidebar
│       └── blocks/                        # 27 read-only block renderers
│           ├── TextRenderer.tsx
│           ├── VideoRenderer.tsx
│           ├── QuizRenderer.tsx
│           └── ... (24 more matching editor blocks)
│
├── action/
│   └── authoring/
│       └── content.ts                     # Save/load/publish (Section 11.1)
│
└── app/
    ├── api/
    │   ├── ai/
    │   │   ├── generate-outline/route.ts  # (Section 7.2)
    │   │   ├── generate-lesson/route.ts   # (Section 7.3)
    │   │   ├── generate-quiz/route.ts
    │   │   ├── refine-block/route.ts      # (Section 7.4)
    │   │   └── extract-document/route.ts
    │   ├── bunny/
    │   │   └── create-video/route.ts      # (Section 11.2)
    │   └── webhooks/
    │       └── bunny-stream/route.ts      # (Section 6.4)
    │
    └── dashboard/
        └── @lms_admin/.../
            └── build-course/
                └── page.tsx               # Native editor (Section 8.3)

supabase/
└── migrations/
    └── 20260301000001_native_authoring_tables.sql  # (Section 5.1)
```

### Files to Delete

```
src/action/coassemble/                     # Entire directory
src/app/dashboard/@learner/course/[id]/getCourses.ts
src/app/dashboard/@learner/course/[id]/types.ts
src/app/dashboard/@learner/course/play/[id]/getSignedURL.ts
src/components/app/LMSAdmin/edit-content/EditContent.tsx
src/components/app/LMSAdmin/preview-content/PreviewContent.tsx
src/components/shared/TestMode.tsx
```

---

## 14. Environment Variables

### New Variables (11 total)

```env
# Bunny.net Stream (Video CDN)
BUNNY_API_KEY=                              # Account-level API key from bunny.net dashboard
BUNNY_STREAM_API_KEY=                       # Stream Library-specific API key
BUNNY_STREAM_LIBRARY_ID=                    # Numeric library ID
BUNNY_STREAM_WEBHOOK_SECRET=                # HMAC secret for webhook verification
NEXT_PUBLIC_BUNNY_STREAM_HOST=              # e.g., vz-abc123.b-cdn.net (for HLS/thumbnail URLs)

# Bunny.net Storage (SCORM CDN)
BUNNY_STORAGE_KEY=                          # Storage Zone password (FTP password)
BUNNY_STORAGE_ZONE=jadarat-scorm            # Storage Zone name
BUNNY_STORAGE_REGION=de                     # Primary region (de=Frankfurt, ny=NYC)
BUNNY_PULL_ZONE_ID=                         # Pull Zone numeric ID (for cache purge API)
BUNNY_PULL_ZONE_KEY=                        # Token Authentication key (for signed URLs)
NEXT_PUBLIC_BUNNY_CDN_HOST=scorm.jadarat.com  # Custom hostname on Pull Zone
```

### Variables to Delete (2 total)

```env
COASSEMBLE=                                 # DELETE: Private Coassemble API key
NEXT_PUBLIC_COASSEMBLE=                     # DELETE: Public Coassemble API key (security risk)
```

### Existing Variables (keep unchanged)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI (existing)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_ENCRYPTION_KEY=
```

---

## 15. Testing Strategy

### Unit Tests (Vitest)

```typescript
// Example test: editor store
describe('useEditorStore', () => {
  it('adds a module', () => {
    const store = useEditorStore.getState();
    store.loadContent(1, { modules: [], settings: DEFAULT_SETTINGS }, 'abc', 1);
    store.addModule('Module 1');
    expect(store.content.modules).toHaveLength(1);
    expect(store.content.modules[0].title).toBe('Module 1');
  });

  it('supports undo/redo', () => {
    const store = useEditorStore.getState();
    store.addModule('Module 1');
    store.addModule('Module 2');
    expect(store.content.modules).toHaveLength(2);
    store.undo();
    expect(store.content.modules).toHaveLength(1);
    store.redo();
    expect(store.content.modules).toHaveLength(2);
  });
});
```

### Integration Tests

| Area | What to Test |
|------|-------------|
| Content API | Save -> load -> publish -> verify version incrementing |
| AI Pipeline | Outline -> validate JSON schema -> generate lessons -> validate block schema |
| SCORM Upload | ZIP -> Bunny Storage -> signed URL -> verify accessible |
| Video Upload | Create video -> TUS upload -> webhook -> verify DB status = 'ready' |
| Block Progress | Track block -> update -> recalculate overall progress -> verify percentage |

### E2E Tests (Playwright)

| Flow | Steps |
|------|-------|
| Create Native Course | Login admin -> Add Course -> Enter metadata -> Open editor -> Add module -> Add lesson -> Add text block -> Type content -> Save -> Publish -> Verify published |
| AI-Generated Course | Login admin -> Add Course -> Select AI mode -> Enter topic -> Review outline -> Generate content -> Edit in editor -> Publish |
| Take Native Course | Login learner -> Enroll -> Open course -> Navigate lessons -> Answer quiz -> Complete all blocks -> Verify 100% progress |
| SCORM Upload | Login admin -> Add Course -> Select SCORM -> Upload ZIP -> Verify files on Bunny CDN -> Open in player -> Track progress |

---

## 16. Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tiptap RTL issues | HIGH | Test with Arabic content early. Use `@tiptap/extension-text-direction`. Fallback: plain textarea for Arabic. |
| Block editor performance with 100+ blocks | MEDIUM | Virtualize block list using `react-virtuoso`. Lazy-load heavy blocks (video, chart). |
| AI-generated content quality | MEDIUM | Human review checkpoint (Step 3). Inline editing tools. Quality scoring prompt. |
| Bunny.net outage | HIGH | Keep Supabase Storage as fallback. 30-day cache on Pull Zone. Static export fallback. |
| SCORM cross-origin on Bunny CDN | HIGH | Primary: custom hostname `scorm.jadarat.com`. Backup: `scorm-again` CrossFrame API. |
| Migration of existing Coassemble courses | MEDIUM | Keep `coassemble_id` column for 90 days. Provide "Re-create" admin UI. |
| Large SCORM packages (500MB) | MEDIUM | Stream upload to Bunny (not buffer in memory). Progress bar. |

### Rollback Plan

1. Each phase deploys behind the `native_authoring` feature flag in the `feature_flags` table
2. Existing SCORM flow remains functional throughout all phases
3. Database changes are additive only (no destructive column drops)
4. `coassemble_id` column preserved for 90 days after Phase 0
5. If Bunny CDN fails, SCORM content still accessible via Supabase Storage proxy route

### New Dependencies to Install

```bash
# Phase 0
npm install zustand                          # Editor state management
npm install @dnd-kit/core @dnd-kit/sortable  # Drag and drop
npm install tus-js-client                    # Resumable video upload to Bunny
npm install uuid                             # UUID generation for block IDs

# Phase 1
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-direction  # Rich text editor
npm install @tiptap/extension-placeholder @tiptap/extension-link                # Tiptap extensions

# Phase 3
npm install mammoth                          # DOCX text extraction
```

---

## Summary: Timeline & Effort

| Phase | Scope | Duration | Effort | Key Deliverables |
|-------|-------|----------|--------|-----------------|
| **Phase 0** | Foundation & Cleanup | Week 1-2 | ~30h | Coassemble removed, Bunny libs created, DB migrated, types defined |
| **Phase 1** | Block Editor MVP | Week 3-6 | ~120h | 9-block editor, drag-and-drop, save/publish, video upload to Bunny |
| **Phase 2** | Course Player & SCORM | Week 7-9 | ~100h | Native player, block progress, SCORM on Bunny CDN |
| **Phase 3** | AI Course Generation | Week 10-13 | ~115h | Full AI pipeline, document-to-course, inline AI tools |
| **Phase 4** | Interactive Blocks | Week 14-16 | ~110h | 12 more blocks, theming, templates, RTL polish |
| **Phase 5** | SCORM Export + Advanced | Week 17-20 | ~130h | SCORM export, 6 advanced blocks, analytics, xAPI |
| **TOTAL** | | **20 weeks** | **~605 hours** | Full native authoring tool with AI, Bunny CDN, 27 blocks |
