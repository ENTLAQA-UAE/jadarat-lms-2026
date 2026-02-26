# Jadarat LMS -- Native Authoring Tool Implementation Plan

> **Date**: February 26, 2026
> **Scope**: Replace Coassemble with native block-based authoring, integrate Bunny.net for video + SCORM delivery, implement AI course generation
> **Tech Stack**: Next.js 14 App Router, Supabase (Postgres + Auth), Bunny.net (Stream + Storage), Claude API, TypeScript, Tailwind + shadcn/ui

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Analysis](#2-current-state-analysis)
3. [Coassemble Removal Plan](#3-coassemble-removal-plan)
4. [Bunny.net Integration Requirements](#4-bunnynet-integration-requirements)
5. [AI Requirements](#5-ai-requirements)
6. [Database Schema Changes](#6-database-schema-changes)
7. [Implementation Phases](#7-implementation-phases)
8. [File Structure](#8-file-structure)
9. [Testing Strategy](#9-testing-strategy)
10. [Environment Variables](#10-environment-variables)
11. [Risk Mitigation](#11-risk-mitigation)

---

## 1. Executive Summary

### What We're Building

A **native block-based course authoring tool** that replaces the Coassemble headless integration with:

1. **Block Editor** -- Drag-and-drop course builder with 25+ block types, RTL-first, JSON-based storage
2. **AI Course Generation** -- Claude-powered pipeline: topic → outline → review → full content → edit → publish
3. **Document-to-Course** -- PDF/DOCX/PPTX parsing → AI-powered course structure extraction
4. **Bunny Stream** -- Video hosting with HLS adaptive streaming, DRM, AI captions, Player.js tracking
5. **Bunny Storage** -- CDN-backed SCORM package delivery via `scorm.jadarat.com` with signed URLs
6. **SCORM Upload** -- Keep and enhance existing SCORM 1.2/2004 upload + playback (migrate storage from Supabase to Bunny)

### Why Replace Coassemble

| Problem | Impact |
|---------|--------|
| Uses deprecated API endpoints (`GET /course/edit`, `GET /course/view`) | Will break when deprecated |
| Iframe-only authoring (no native control) | Cannot customize editor, blocks, or UX |
| No Arabic-first support | RTL is afterthought in Coassemble |
| No AI content generation control | AI happens inside Coassemble iframe, no programmatic access |
| Client-side API key exposure (`NEXT_PUBLIC_COASSEMBLE`) | Security risk |
| External dependency for core feature | Vendor lock-in, pricing risk |
| No course content stored locally | Content lives on Coassemble servers |
| Hardcoded `clientIdentifier=49` in API calls | Bug -- breaks multi-tenant |

---

## 2. Current State Analysis

### 2.1 Coassemble Integration (21 files to remove/replace)

#### Server Actions & API
| File | Role | Action |
|------|------|--------|
| `src/action/coassemble/coassemble.ts` | Course creation API call | **DELETE** |
| `src/app/dashboard/@learner/course/[id]/getCourses.ts` | Fetch course from Coassemble API | **DELETE** |
| `src/app/dashboard/@learner/course/play/[id]/getSignedURL.ts` | Get signed play/edit URLs | **DELETE** |

#### Type Definitions
| File | Role | Action |
|------|------|--------|
| `src/app/dashboard/@learner/course/[id]/types.ts` | Coassemble data types | **DELETE** |

#### Pages & Components
| File | Role | Action |
|------|------|--------|
| `src/app/dashboard/@lms_admin/.../add-course/CourseDetails.tsx` | Course creation form | **REWRITE** -- remove Coassemble URL generation |
| `src/app/dashboard/@lms_admin/.../build-course/page.tsx` | Coassemble iframe builder | **REPLACE** -- native block editor |
| `src/app/dashboard/@lms_admin/.../edit-course/[id]/EditCourse.tsx` | Edit course (uses coassemble_id) | **REWRITE** -- use native editor |
| `src/app/dashboard/@learner/course/play/[id]/Play.tsx` | Course player (Coassemble iframe) | **REPLACE** -- native course renderer |
| `src/app/dashboard/@lms_admin/.../edit-content/page.tsx` | Edit content wrapper | **REPLACE** -- native editor route |
| `src/app/dashboard/@lms_admin/.../preview-content/page.tsx` | Preview wrapper | **REPLACE** -- native preview route |
| `src/components/app/LMSAdmin/edit-content/EditContent.tsx` | Coassemble edit iframe | **DELETE** |
| `src/components/app/LMSAdmin/preview-content/PreviewContent.tsx` | Coassemble preview iframe | **DELETE** |
| `src/components/shared/TestMode.tsx` | Course title overlay | **DELETE** |

#### Insights Components
| File | Role | Action |
|------|------|--------|
| `src/app/dashboard/@lms_admin/insights/courses/[id]/CourseInfo.tsx` | Course info display | **EDIT** -- remove coassemble_id |
| `src/app/dashboard/@lms_admin/insights/courses/[id]/ModulesCourseInfo.tsx` | Module list from Coassemble API | **REPLACE** -- read from local DB |

### 2.2 Current Database Schema (Courses)

```sql
courses (
  id SERIAL PK,
  title TEXT, description TEXT,
  category_id INT FK, level courselevel,
  timeline TEXT, thumbnail TEXT,
  languages JSONB[], slug TEXT UNIQUE,
  status TEXT, coassemble_id TEXT,           -- TO REMOVE
  created_by UUID FK, organization_id INT FK,
  outcomes JSONB, is_scorm BOOLEAN,
  scorm_version TEXT, scorm_url TEXT,
  launch_path TEXT, created_at TIMESTAMPTZ
)

user_courses (
  id SERIAL PK,
  user_id UUID FK, course_id INT FK,
  progress TEXT, status TEXT,
  completed_at TIMESTAMPTZ, scorm_data JSONB
)
```

### 2.3 Current SCORM Implementation (KEEP + ENHANCE)

| Component | File | Status |
|-----------|------|--------|
| Upload + ZIP extraction | `src/utils/uploadFile.ts` | **KEEP** -- migrate storage to Bunny |
| SCORM 1.2 API wrapper | `src/lib/scorm-api.ts` | **KEEP** |
| SCORM data parser | `src/lib/scorm-utils.ts` | **KEEP** |
| SCORM player | `src/app/.../scorm-player/[slug]/Player.tsx` | **KEEP** -- update content URLs |
| SCORM API routes | `src/app/api/scorm/[slug]/route.ts` | **KEEP** -- update storage source |
| SCORM content route | `src/app/api/scorm/content/[...path]/route.ts` | **REPLACE** -- serve from Bunny CDN |

### 2.4 Existing AI Infrastructure

| Component | Details |
|-----------|---------|
| AI SDK | `@ai-sdk/anthropic`, `@ai-sdk/openai`, `ai` v6 |
| Chat API | `/api/chat` -- streaming AI responses |
| Embeddings | `/api/embeddings` -- vector search |
| Recommendations | `/api/recommendations` -- AI course suggestions |
| AI Config | `/dashboard/ai-config` -- per-org API key management (encrypted) |
| AI DB Tables | `ai_configurations`, `ai_usage_logs`, `ai_embeddings` |

### 2.5 Existing Dependencies (Already Installed)

| Package | Version | Used For |
|---------|---------|----------|
| `scorm-again` | 2.6.0 | SCORM runtime (has CrossFrame API) |
| `jszip` | 3.10.1 | ZIP extraction |
| `fast-xml-parser` | 4.5.1 | XML/manifest parsing |
| `react-dropzone` | 14.3.5 | File upload UI |
| `@ai-sdk/anthropic` | 3.0.46 | Claude API |
| `ai` | 6.0.97 | AI SDK core |
| `pdfjs-dist` | 3.4.120 | PDF parsing |
| `framer-motion` | 11.18.0 | Drag & drop animations |

---

## 3. Coassemble Removal Plan

### 3.1 Files to DELETE (clean removal)

```
src/action/coassemble/                           # Entire directory
src/app/dashboard/@learner/course/[id]/getCourses.ts
src/app/dashboard/@learner/course/[id]/types.ts
src/app/dashboard/@learner/course/play/[id]/getSignedURL.ts
src/components/app/LMSAdmin/edit-content/EditContent.tsx
src/components/app/LMSAdmin/preview-content/PreviewContent.tsx
src/components/shared/TestMode.tsx
```

### 3.2 Files to REWRITE (replace Coassemble logic with native)

```
src/app/dashboard/@lms_admin/.../add-course/CourseDetails.tsx
src/app/dashboard/@lms_admin/.../build-course/page.tsx
src/app/dashboard/@lms_admin/.../edit-course/[id]/EditCourse.tsx
src/app/dashboard/@lms_admin/.../edit-content/page.tsx
src/app/dashboard/@lms_admin/.../preview-content/page.tsx
src/app/dashboard/@learner/course/play/[id]/Play.tsx
src/app/dashboard/@lms_admin/insights/courses/[id]/ModulesCourseInfo.tsx
src/app/dashboard/@lms_admin/insights/courses/[id]/CourseInfo.tsx
```

### 3.3 Database Migration

```sql
-- Migration: Remove Coassemble, add native authoring columns
ALTER TABLE courses ADD COLUMN authoring_type TEXT DEFAULT 'native'
  CHECK (authoring_type IN ('native', 'scorm'));

-- Migrate existing Coassemble courses to native type
UPDATE courses SET authoring_type = 'native'
  WHERE coassemble_id IS NOT NULL AND is_scorm = false;

UPDATE courses SET authoring_type = 'scorm'
  WHERE is_scorm = true;

-- Add content column for native courses
ALTER TABLE courses ADD COLUMN content_id UUID REFERENCES course_content(id);

-- Bunny.net columns
ALTER TABLE courses ADD COLUMN bunny_video_ids JSONB DEFAULT '[]';

-- Keep coassemble_id for data preservation (mark deprecated)
COMMENT ON COLUMN courses.coassemble_id IS 'DEPRECATED: Legacy Coassemble ID. Will be removed in future migration.';
```

### 3.4 Environment Variables to Remove

```
COASSEMBLE                    # Private API key
NEXT_PUBLIC_COASSEMBLE        # Public API key (security risk)
```

---

## 4. Bunny.net Integration Requirements

### 4.1 Bunny Stream (Video CDN)

#### Setup Required
1. **Create Stream Library** named `jadarat-videos` via Bunny dashboard/API
2. **Enable replication regions**: Europe (primary), Middle East (Dubai), Asia
3. **Enable features**: AI captions, chapters, resumable playback, MediaCage Basic DRM
4. **Configure webhook** endpoint: `POST /api/webhooks/bunny-stream`

#### API Integration

```typescript
// src/lib/bunny/stream.ts

export class BunnyStream {
  private apiKey: string;
  private libraryId: string;
  private baseUrl = 'https://video.bunnycdn.com';

  // Upload flow
  async createVideo(title: string): Promise<{ guid: string }>;
  async uploadVideo(videoId: string, buffer: Buffer): Promise<void>;
  async getVideo(videoId: string): Promise<BunnyVideo>;
  async listVideos(page: number, perPage: number): Promise<BunnyVideo[]>;
  async deleteVideo(videoId: string): Promise<void>;

  // Captions
  async addCaption(videoId: string, language: string, srtContent: string): Promise<void>;
  async generateAiCaptions(videoId: string, language: string): Promise<void>;

  // Embed URLs
  getEmbedUrl(videoId: string): string;
  getHlsUrl(videoId: string): string;
  getThumbnailUrl(videoId: string): string;

  // TUS upload URL generation (for client-side uploads)
  generateTusAuth(videoId: string): { signature: string; expiration: number };

  // Statistics
  async getVideoStats(videoId: string): Promise<BunnyVideoStats>;
  async getHeatmap(videoId: string): Promise<BunnyHeatmap>;
}
```

#### Video Block Integration

```typescript
// Video block in course editor
interface VideoBlockData {
  bunny_video_id: string;          // Bunny Stream video GUID
  bunny_library_id: string;        // Bunny Stream library ID
  title: LocalizedString;
  description?: LocalizedString;
  duration_seconds: number;
  thumbnail_url: string;
  captions: { language: string; label: string }[];
  chapters: { time: number; title: string }[];
  completion_criteria: 'watch_75' | 'watch_90' | 'watch_100';
  allow_skip: boolean;
}
```

#### React Video Player Component

```tsx
// src/components/authoring/blocks/VideoBlock.tsx
// Uses Player.js for programmatic control of Bunny iframe player

interface VideoPlayerProps {
  videoId: string;
  libraryId: string;
  onProgress: (seconds: number, percent: number) => void;
  onComplete: () => void;
  onChapterChange: (chapter: string) => void;
}
```

#### Webhook Handler

```typescript
// src/app/api/webhooks/bunny-stream/route.ts
// Handles: video_encoded (status 4), failed (5), captions_generated (9)
// Verifies HMAC SHA-256 signature
// Updates course_content JSONB with video metadata (duration, resolutions, captions)
```

### 4.2 Bunny Edge Storage (SCORM CDN)

#### Setup Required
1. **Create Storage Zone** named `jadarat-scorm` with replication in EU + Middle East
2. **Create Pull Zone** connected to storage zone
3. **Custom hostname**: `scorm.jadarat.com` (CNAME to Bunny Pull Zone)
4. **Enable CORS** for `.html`, `.js`, `.css`, `.xml`, `.json`, `.xsd`, `.woff`, `.woff2`, `.svg`
5. **Enable Token Authentication V2** on Pull Zone
6. **Enable Force SSL**

#### API Integration

```typescript
// src/lib/bunny/storage.ts

export class BunnyStorage {
  private storageKey: string;
  private storageName: string;
  private baseUrl: string; // https://{region}.storage.bunnycdn.com

  // SCORM package operations
  async uploadFile(path: string, buffer: Buffer): Promise<void>;
  async deleteFile(path: string): Promise<void>;
  async listDirectory(path: string): Promise<BunnyStorageItem[]>;
  async deleteDirectory(path: string): Promise<void>;

  // SCORM package workflow
  async uploadScormPackage(packageId: string, files: Map<string, Buffer>): Promise<void>;
  async deleteScormPackage(packageId: string): Promise<void>;
}
```

```typescript
// src/lib/bunny/cdn.ts

export class BunnyCDN {
  private pullZoneKey: string;

  // Signed URL generation for SCORM packages
  generateSignedUrl(path: string, expirationSeconds?: number): string;
  generateSignedDirectoryUrl(packagePath: string, expirationSeconds?: number): string;

  // Pull Zone management
  async purgeCache(path: string): Promise<void>;
}
```

#### SCORM Upload Flow (Updated)

```
Current:  ZIP → Extract → Upload to Supabase Storage → Serve via API route
New:      ZIP → Extract → Upload to Bunny Storage → Serve via Bunny CDN Pull Zone
                                                     (scorm.jadarat.com)
```

```typescript
// Updated src/utils/uploadFile.ts

export async function uploadScormFile(
  slug: string,
  file: File,
  organizationId: number
): Promise<{ launchPath: string; packageId: string }> {
  // 1. Extract ZIP (same as current)
  const zip = await JSZip.loadAsync(file);

  // 2. Parse manifest (same as current)
  const manifest = parseManifest(manifestXml);

  // 3. Upload ALL files to Bunny Storage (NEW)
  const packageId = `${organizationId}/${slug}`;
  const bunnyStorage = new BunnyStorage();

  for (const [path, file] of zip.files) {
    if (!file.dir) {
      const buffer = await file.async('nodebuffer');
      await bunnyStorage.uploadFile(`scorm/${packageId}/${path}`, buffer);
    }
  }

  // 4. Return launch URL via Bunny CDN
  return {
    launchPath: manifest.launchPath,
    packageId,
  };
}
```

#### SCORM Player Update

```typescript
// Updated SCORM player: load content from Bunny CDN instead of API route

// Old: src={`/api/scorm/content/${slug}/${launchPath}`}
// New: src={bunnyCdn.generateSignedDirectoryUrl(`scorm/${packageId}`)}

// Cross-origin communication via scorm-again CrossFrame API
import { CrossFrameLMS } from 'scorm-again';
const lms = new CrossFrameLMS(); // Parent frame (LMS domain)
```

### 4.3 Bunny Configuration Summary

| Component | Configuration | Monthly Cost Estimate |
|-----------|--------------|----------------------|
| Stream Library | 1 library, EU+ME replication, AI captions enabled | Storage: ~$0.02/GB + CDN: $0.01-0.06/GB |
| Storage Zone | `jadarat-scorm`, EU+ME replication | $0.01/GB/region |
| Pull Zone | Custom hostname `scorm.jadarat.com`, Token Auth V2, CORS, Force SSL | CDN: $0.01-0.06/GB |
| DRM | MediaCage Basic (free) | $0 |

---

## 5. AI Requirements

### 5.1 AI Course Generation Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    AI COURSE GENERATION                           │
│                                                                   │
│  STEP 1: INPUT COLLECTION                                        │
│  ├── Mode A: Topic Prompt                                        │
│  │   └── Topic, audience, difficulty, tone, language, goals      │
│  ├── Mode B: Document Upload                                     │
│  │   └── PDF/DOCX/PPTX → text extraction → chunking             │
│  └── Both: User selects target modules/lessons count             │
│                                                                   │
│  STEP 2: OUTLINE GENERATION                                      │
│  ├── Model: Claude Sonnet 4.6 (fast, structured output)         │
│  ├── System prompt: Instructional design expert                  │
│  ├── Input: topic + audience + source chunks + constraints       │
│  ├── Output: JSON outline (modules → lessons → block types)     │
│  └── Estimated tokens: 2K-5K input, 1K-3K output                │
│                                                                   │
│  STEP 3: HUMAN REVIEW CHECKPOINT                                 │
│  ├── Display outline in drag-and-drop tree editor                │
│  ├── User can: reorder, add, remove, rename, edit descriptions  │
│  ├── User can: change suggested block types per lesson           │
│  └── User confirms → proceed to content generation              │
│                                                                   │
│  STEP 4: CONTENT GENERATION (per lesson, parallelized)          │
│  ├── Model: Claude Sonnet 4.6 (or Opus for complex content)    │
│  ├── Input: lesson outline + course context + style guide        │
│  ├── Output: Array of Block objects (JSON)                       │
│  ├── Includes: text, quiz questions, interaction configs         │
│  ├── Estimated tokens: 1K-3K input, 2K-8K output per lesson    │
│  └── Streaming: Show blocks appearing in real-time              │
│                                                                   │
│  STEP 5: QUIZ GENERATION (per module)                            │
│  ├── Model: Claude Sonnet 4.6                                   │
│  ├── Input: All lesson content from module                       │
│  ├── Output: Assessment blocks (MCQ, T/F, fill-blank, matching)│
│  ├── Aligned with: Bloom's taxonomy levels                       │
│  └── Estimated tokens: 3K-5K input, 1K-3K output per module    │
│                                                                   │
│  STEP 6: ASSEMBLY + EDITOR                                       │
│  ├── Combine all generated blocks into course JSON               │
│  ├── Open in block editor for human review/editing               │
│  ├── AI inline tools: expand, simplify, translate, rephrase     │
│  └── Save as draft in Supabase course_content table             │
│                                                                   │
│  OUTPUT: Complete course in native block-based JSON format        │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 AI API Endpoints (New)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/generate-outline` | POST | Generate course outline from topic/documents |
| `/api/ai/generate-lesson` | POST | Generate block content for a single lesson |
| `/api/ai/generate-quiz` | POST | Generate assessment blocks for a module |
| `/api/ai/refine-block` | POST | Inline AI editing (expand, simplify, translate) |
| `/api/ai/generate-image-prompt` | POST | Generate image description for Unsplash/Pexels search |
| `/api/ai/extract-document` | POST | Parse PDF/DOCX/PPTX → structured text chunks |

### 5.3 AI System Prompts

```typescript
// src/lib/ai/prompts.ts

export const OUTLINE_SYSTEM_PROMPT = `
You are an expert instructional designer for Arabic and English e-learning courses.
You create course outlines following these principles:
- Bloom's taxonomy progression (remember → understand → apply → analyze → evaluate → create)
- 3-7 modules per course, 2-5 lessons per module
- Each lesson should take 5-15 minutes to complete
- Varied block types for engagement (text, interactive, assessment, media)
- Arabic-first when language is 'ar' -- use proper MSA or specified dialect
- Cultural sensitivity for MENA region content
- Learning objectives aligned with outcomes

Output JSON matching the CourseOutline schema.
`;

export const LESSON_SYSTEM_PROMPT = `
You are an expert e-learning content writer.
Generate lesson content as an array of Block objects following these rules:
- Start with an engaging introduction block
- Use varied block types (never 3+ text blocks in a row)
- Include at least one interactive block per lesson
- End with a knowledge check or summary
- All text content should be in {language}
- If Arabic, use proper RTL formatting
- Keep paragraphs concise (3-5 sentences)
- Use real-world examples relevant to the target audience

Output JSON matching the Block[] schema.
`;
```

### 5.4 Document-to-Course Processing

```typescript
// src/lib/ai/document-processor.ts

export class DocumentProcessor {
  // PDF extraction using pdfjs-dist (already installed)
  async extractPdf(file: File): Promise<DocumentChunk[]>;

  // DOCX extraction using mammoth
  async extractDocx(file: File): Promise<DocumentChunk[]>;

  // PPTX extraction using officegen or pptx-parser
  async extractPptx(file: File): Promise<DocumentChunk[]>;

  // Semantic chunking with overlap
  chunkText(text: string, maxTokens: number): DocumentChunk[];

  // Image extraction (embedded in documents)
  async extractImages(file: File): Promise<ExtractedImage[]>;
}

interface DocumentChunk {
  text: string;
  pageNumber: number;
  heading?: string;
  type: 'text' | 'heading' | 'list' | 'table';
  images?: ExtractedImage[];
}
```

### 5.5 AI Inline Editing Tools

| Tool | Trigger | Prompt Pattern |
|------|---------|---------------|
| **Expand** | Select block → "Expand" | "Expand this content with more detail and examples: {block_content}" |
| **Simplify** | Select block → "Simplify" | "Simplify this content for a {audience} audience: {block_content}" |
| **Translate** | Select block → "Translate" | "Translate to {target_language}, maintaining educational context: {block_content}" |
| **Rephrase** | Select block → "Rephrase" | "Rephrase this content in a {tone} tone: {block_content}" |
| **Generate Quiz** | Select lesson → "Generate Quiz" | "Create assessment questions based on: {lesson_content}" |
| **Add Example** | Select block → "Add Example" | "Create a real-world example for: {block_content}" |
| **Generate Image Description** | Select block → "Suggest Image" | "Describe an ideal educational image for: {block_content}" |

### 5.6 AI Cost Estimation

| Operation | Model | Avg Input Tokens | Avg Output Tokens | Cost per Call |
|-----------|-------|-----------------|-------------------|--------------|
| Outline Generation | Sonnet 4.6 | 3,000 | 2,000 | ~$0.025 |
| Lesson Generation | Sonnet 4.6 | 2,000 | 5,000 | ~$0.045 |
| Quiz Generation | Sonnet 4.6 | 4,000 | 2,000 | ~$0.030 |
| Inline Edit | Haiku 4.5 | 1,000 | 500 | ~$0.001 |
| Document Extraction | Sonnet 4.6 | 5,000 | 3,000 | ~$0.035 |

**Full Course Generation (10 lessons):**
- 1 outline + 10 lessons + 3 quizzes = ~$0.62 per course
- With inline edits (10 edits): ~$0.63 total

### 5.7 AI Usage Tracking

```sql
-- Extend existing ai_usage_logs table
INSERT INTO ai_usage_logs (
  organization_id, user_id, operation,
  model, input_tokens, output_tokens,
  cost_usd, course_id, created_at
);

-- Per-org rate limiting (existing ai_configurations table)
-- Fields: rate_limit_rpm, rate_limit_rpd, monthly_budget_usd
```

---

## 6. Database Schema Changes

### 6.1 New Tables

```sql
-- ============================================================
-- Migration: 20260226000000_native_authoring.sql
-- ============================================================

-- Course content (block-based JSON)
CREATE TABLE public.course_content (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE CASCADE,
  content         JSONB NOT NULL DEFAULT '{"modules":[]}',
  version         INT DEFAULT 1,
  status          TEXT DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id),
  UNIQUE (course_id, version)
);

-- Block templates library (reusable across courses)
CREATE TABLE public.block_templates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT REFERENCES organization(id),
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL,  -- 'content', 'interactive', 'assessment', 'layout'
  block_type      TEXT NOT NULL,
  template_data   JSONB NOT NULL,
  thumbnail_url   TEXT,
  is_global       BOOLEAN DEFAULT false,
  usage_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

-- AI generation audit trail
CREATE TABLE public.ai_generation_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE SET NULL,
  organization_id INT REFERENCES organization(id),
  user_id         UUID REFERENCES auth.users(id),
  operation       TEXT NOT NULL,
  model           TEXT NOT NULL,
  input_tokens    INT,
  output_tokens   INT,
  cost_usd        DECIMAL(10, 6),
  input_data      JSONB,
  output_data     JSONB,
  duration_ms     INT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Bunny.net video registry
CREATE TABLE public.bunny_videos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT REFERENCES organization(id),
  bunny_video_id  TEXT NOT NULL,
  bunny_library_id TEXT NOT NULL,
  title           TEXT NOT NULL,
  status          TEXT DEFAULT 'processing'
                    CHECK (status IN ('processing', 'ready', 'failed')),
  duration_seconds INT,
  resolutions     JSONB DEFAULT '[]',
  captions        JSONB DEFAULT '[]',
  thumbnail_url   TEXT,
  file_size_bytes BIGINT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id),
  UNIQUE (bunny_video_id)
);

-- Learner block-level progress tracking
CREATE TABLE public.learner_block_progress (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  course_id       INT REFERENCES courses(id),
  block_id        TEXT NOT NULL,  -- matches Block.id in course JSON
  block_type      TEXT NOT NULL,
  completed       BOOLEAN DEFAULT false,
  score           DECIMAL(5, 2),  -- for assessment blocks
  attempts        INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  response_data   JSONB,          -- learner's answers/interactions
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, course_id, block_id)
);

-- Course media assets (Bunny + Supabase references)
CREATE TABLE public.course_media (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE CASCADE,
  organization_id INT REFERENCES organization(id),
  media_type      TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'audio', 'document')),
  storage_provider TEXT NOT NULL CHECK (storage_provider IN ('bunny_stream', 'bunny_storage', 'supabase')),
  external_id     TEXT,           -- bunny_video_id or storage path
  url             TEXT NOT NULL,
  title           TEXT,
  file_size_bytes BIGINT,
  mime_type       TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);
```

### 6.2 ALTER Existing Tables

```sql
-- Courses table updates
ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  authoring_type TEXT DEFAULT 'native'
  CHECK (authoring_type IN ('native', 'scorm'));

ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  content_id UUID REFERENCES course_content(id);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  bunny_scorm_package_id TEXT;  -- Bunny Storage path for SCORM packages

-- Migrate existing data
UPDATE courses SET authoring_type = 'scorm' WHERE is_scorm = true;
UPDATE courses SET authoring_type = 'native' WHERE is_scorm = false;

-- Organization settings: add Bunny config
ALTER TABLE organization ADD COLUMN IF NOT EXISTS
  bunny_stream_library_id TEXT;

ALTER TABLE organization ADD COLUMN IF NOT EXISTS
  native_authoring BOOLEAN DEFAULT true;

-- Feature flags update
-- (existing: ai_builder, document_builder, create_courses)
-- Add: native_authoring (default true for all orgs)
```

### 6.3 New RPC Functions

```sql
-- Get course with content
CREATE OR REPLACE FUNCTION public.get_course_with_content(p_course_id int)
RETURNS TABLE (...course fields..., content JSONB, content_version INT)
LANGUAGE sql SECURITY DEFINER;

-- Save course content (auto-version)
CREATE OR REPLACE FUNCTION public.save_course_content(
  p_course_id int, p_content jsonb, p_user_id uuid
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER;

-- Publish course content
CREATE OR REPLACE FUNCTION public.publish_course_content(
  p_course_id int, p_content_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER;

-- Track block progress
CREATE OR REPLACE FUNCTION public.update_block_progress(
  p_user_id uuid, p_course_id int, p_block_id text,
  p_block_type text, p_completed boolean,
  p_score decimal, p_response_data jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER;

-- Get learner course progress (block-level)
CREATE OR REPLACE FUNCTION public.get_learner_course_progress(
  p_user_id uuid, p_course_id int
) RETURNS TABLE (block_id text, completed boolean, score decimal, time_spent int)
LANGUAGE sql SECURITY DEFINER;

-- Update existing RPC functions to remove coassemble_id from return types
-- and add content_id, authoring_type instead
```

---

## 7. Implementation Phases

### Phase 0: Foundation & Cleanup (Week 1-2)

**Goal**: Remove Coassemble, set up Bunny.net accounts, create database schema

#### Tasks

| # | Task | Files | Est. |
|---|------|-------|------|
| 0.1 | Create database migration `20260226000000_native_authoring.sql` | `supabase/migrations/` | 4h |
| 0.2 | Delete all Coassemble files (7 files) | See Section 3.1 | 1h |
| 0.3 | Remove `COASSEMBLE` and `NEXT_PUBLIC_COASSEMBLE` env vars | `.env`, deployment config | 30m |
| 0.4 | Update all RPC functions to remove `coassemble_id` from return types | Migration file | 4h |
| 0.5 | Update `CourseInfo.tsx` and `ModulesCourseInfo.tsx` to remove Coassemble refs | Component files | 2h |
| 0.6 | Create Bunny.net account, Stream Library, Storage Zone, Pull Zone | Bunny dashboard | 2h |
| 0.7 | Configure `scorm.jadarat.com` custom hostname on Pull Zone | DNS + Bunny | 1h |
| 0.8 | Create `src/lib/bunny/stream.ts` -- BunnyStream service class | New file | 4h |
| 0.9 | Create `src/lib/bunny/storage.ts` -- BunnyStorage service class | New file | 3h |
| 0.10 | Create `src/lib/bunny/cdn.ts` -- BunnyCDN signed URL service | New file | 2h |
| 0.11 | Add Bunny env vars to `.env` and deployment | Config | 30m |
| 0.12 | Create TypeScript types for block-based content | `src/types/authoring.ts` | 4h |
| 0.13 | Stub out course creation flow to prevent broken routes | Route files | 2h |

**Phase 0 Total: ~30 hours**

---

### Phase 1: Block Editor MVP (Week 3-6)

**Goal**: Native drag-and-drop block editor with 9 core block types, save/load from DB

#### 1A: Editor Infrastructure (Week 3)

| # | Task | Files | Est. |
|---|------|-------|------|
| 1.1 | Create editor state store (Zustand) for block operations | `src/stores/editor.store.ts` | 6h |
| 1.2 | Build EditorCanvas component (drag-and-drop with framer-motion) | `src/components/authoring/EditorCanvas.tsx` | 12h |
| 1.3 | Build BlockToolbar -- block type selector/inserter | `src/components/authoring/BlockToolbar.tsx` | 4h |
| 1.4 | Build ModuleSidebar -- course structure tree (modules → lessons) | `src/components/authoring/ModuleSidebar.tsx` | 8h |
| 1.5 | Build BlockWrapper -- selection, drag handle, delete, duplicate | `src/components/authoring/BlockWrapper.tsx` | 4h |
| 1.6 | Build EditorHeader -- save, preview, publish, undo/redo | `src/components/authoring/EditorHeader.tsx` | 4h |
| 1.7 | Server actions: `saveContent`, `loadContent`, `publishContent` | `src/action/authoring/` | 4h |

#### 1B: Core Block Types (Week 4-5)

| # | Block | Component | Est. |
|---|-------|-----------|------|
| 1.8 | Text block (rich text with RTL) | `blocks/TextBlock.tsx` | 8h |
| 1.9 | Image block (upload to Supabase + caption) | `blocks/ImageBlock.tsx` | 4h |
| 1.10 | Video block (Bunny Stream embed + Player.js) | `blocks/VideoBlock.tsx` | 8h |
| 1.11 | Accordion block (expandable sections) | `blocks/AccordionBlock.tsx` | 4h |
| 1.12 | Tabs block (tabbed content) | `blocks/TabsBlock.tsx` | 4h |
| 1.13 | Multiple Choice block (quiz) | `blocks/MultipleChoiceBlock.tsx` | 6h |
| 1.14 | True/False block (quiz) | `blocks/TrueFalseBlock.tsx` | 3h |
| 1.15 | Divider block | `blocks/DividerBlock.tsx` | 1h |
| 1.16 | Cover block (hero image + text) | `blocks/CoverBlock.tsx` | 4h |

#### 1C: Editor Pages (Week 5-6)

| # | Task | Files | Est. |
|---|------|-------|------|
| 1.17 | Rewrite `build-course/page.tsx` -- native editor page | Page component | 8h |
| 1.18 | Rewrite `edit-content/page.tsx` -- load existing course | Page component | 4h |
| 1.19 | Build `preview-content/page.tsx` -- read-only course preview | Page component | 6h |
| 1.20 | Rewrite `CourseDetails.tsx` -- remove Coassemble, add authoring_type selector | Component | 6h |
| 1.21 | Build video upload component (TUS resumable to Bunny) | `components/authoring/VideoUploader.tsx` | 8h |
| 1.22 | Build Bunny Stream webhook handler | `api/webhooks/bunny-stream/route.ts` | 4h |

**Phase 1 Total: ~120 hours**

**Phase 1 Deliverable**: Course creators can build courses from scratch using 9 block types, upload videos to Bunny Stream, save/preview/publish courses. No AI yet.

---

### Phase 2: Course Player & SCORM Migration (Week 7-9)

**Goal**: Learner-facing course renderer, block-level progress tracking, SCORM on Bunny CDN

#### 2A: Native Course Player (Week 7-8)

| # | Task | Files | Est. |
|---|------|-------|------|
| 2.1 | Build CoursePlayer component (renders blocks from JSON) | `src/components/player/CoursePlayer.tsx` | 12h |
| 2.2 | Build LessonRenderer (sequential/free navigation) | `src/components/player/LessonRenderer.tsx` | 8h |
| 2.3 | Build block renderers (read-only versions of all 9 blocks) | `src/components/player/blocks/` | 16h |
| 2.4 | Build ProgressSidebar (module/lesson completion status) | `src/components/player/ProgressSidebar.tsx` | 6h |
| 2.5 | Block-level progress tracking (server actions + DB) | `src/action/player/` | 8h |
| 2.6 | Rewrite `Play.tsx` -- route to native player or SCORM player | Route component | 6h |
| 2.7 | Video progress tracking via Player.js `timeupdate` events | Player integration | 4h |
| 2.8 | Quiz scoring and feedback display | Quiz components | 8h |
| 2.9 | Course completion detection + certificate trigger | Completion logic | 4h |

#### 2B: SCORM Storage Migration (Week 8-9)

| # | Task | Files | Est. |
|---|------|-------|------|
| 2.10 | Update `uploadScormFile()` to upload to Bunny Storage | `src/utils/uploadFile.ts` | 6h |
| 2.11 | Update SCORM player to load from `scorm.jadarat.com` | SCORM player | 4h |
| 2.12 | Implement signed URL generation for SCORM packages | `src/lib/bunny/cdn.ts` | 3h |
| 2.13 | Configure CrossFrame SCORM API (scorm-again) | SCORM integration | 6h |
| 2.14 | Remove `/api/scorm/content/[...path]` route (served by Bunny CDN now) | API route | 2h |
| 2.15 | Migration script: copy existing Supabase SCORM files to Bunny | One-time script | 4h |
| 2.16 | Update insights `ModulesCourseInfo.tsx` to read from course_content DB | Component | 3h |

**Phase 2 Total: ~100 hours**

**Phase 2 Deliverable**: Learners can take native courses with block-level progress tracking. SCORM packages served via Bunny CDN with 10-30ms MENA latency. Video completion tracked via Player.js.

---

### Phase 3: AI Course Generation (Week 10-13)

**Goal**: Full AI pipeline -- topic-to-course and document-to-course

#### 3A: AI Pipeline Backend (Week 10-11)

| # | Task | Files | Est. |
|---|------|-------|------|
| 3.1 | Create AI prompts library | `src/lib/ai/prompts.ts` | 8h |
| 3.2 | Build outline generation endpoint | `api/ai/generate-outline/route.ts` | 8h |
| 3.3 | Build lesson content generation endpoint | `api/ai/generate-lesson/route.ts` | 8h |
| 3.4 | Build quiz generation endpoint | `api/ai/generate-quiz/route.ts` | 6h |
| 3.5 | Build inline refine endpoint | `api/ai/refine-block/route.ts` | 4h |
| 3.6 | Build AI usage tracking + rate limiting | `src/lib/ai/usage.ts` | 4h |
| 3.7 | Streaming response support (show blocks appearing) | AI SDK streaming | 4h |

#### 3B: Document Processing (Week 11-12)

| # | Task | Files | Est. |
|---|------|-------|------|
| 3.8 | PDF text + image extraction (pdfjs-dist) | `src/lib/ai/extractors/pdf.ts` | 8h |
| 3.9 | DOCX text extraction (mammoth) | `src/lib/ai/extractors/docx.ts` | 4h |
| 3.10 | PPTX text + slide extraction | `src/lib/ai/extractors/pptx.ts` | 6h |
| 3.11 | Semantic text chunking with overlap | `src/lib/ai/chunker.ts` | 4h |
| 3.12 | Document-to-outline API endpoint | `api/ai/extract-document/route.ts` | 4h |
| 3.13 | Install `mammoth` for DOCX parsing | `package.json` | 30m |

#### 3C: AI UI Flow (Week 12-13)

| # | Task | Files | Est. |
|---|------|-------|------|
| 3.14 | Build AI course wizard (step-by-step flow) | `src/components/authoring/ai/AICourseWizard.tsx` | 12h |
| 3.15 | Build outline review/edit UI (tree editor) | `src/components/authoring/ai/OutlineEditor.tsx` | 8h |
| 3.16 | Build generation progress UI (streaming blocks) | `src/components/authoring/ai/GenerationProgress.tsx` | 6h |
| 3.17 | Build inline AI toolbar (expand, simplify, translate) | `src/components/authoring/ai/InlineAIToolbar.tsx` | 8h |
| 3.18 | Build document upload UI for doc-to-course | `src/components/authoring/ai/DocumentUploader.tsx` | 4h |
| 3.19 | Wire AI wizard → editor (generated content opens in block editor) | Integration | 4h |
| 3.20 | Update course creation flow with AI/Document/Scratch selector | `CourseDetails.tsx` | 4h |

**Phase 3 Total: ~115 hours**

**Phase 3 Deliverable**: Course creators can generate full courses from a topic prompt or uploaded documents. AI generates outlines, then content block-by-block with streaming preview. Inline AI tools for refinement.

---

### Phase 4: Interactive Blocks + Polish (Week 14-16)

**Goal**: Add 12 Phase 2 block types, theming, templates, RTL polish

#### 4A: Interactive Block Types (Week 14-15)

| # | Block | Component | Est. |
|---|-------|-----------|------|
| 4.1 | Flashcard block | `blocks/FlashcardBlock.tsx` | 4h |
| 4.2 | Labeled Graphic (hotspot image) | `blocks/LabeledGraphicBlock.tsx` | 8h |
| 4.3 | Process/Steps block | `blocks/ProcessBlock.tsx` | 4h |
| 4.4 | Timeline block | `blocks/TimelineBlock.tsx` | 4h |
| 4.5 | Sorting block (drag to categorize) | `blocks/SortingBlock.tsx` | 6h |
| 4.6 | Multiple Response block (multi-select quiz) | `blocks/MultipleResponseBlock.tsx` | 3h |
| 4.7 | Fill-in-the-Blank block | `blocks/FillInBlankBlock.tsx` | 4h |
| 4.8 | Matching block (drag-to-match) | `blocks/MatchingBlock.tsx` | 6h |
| 4.9 | Audio block (Bunny or Supabase) | `blocks/AudioBlock.tsx` | 4h |
| 4.10 | Embed block (iframe: YouTube, Vimeo, etc.) | `blocks/EmbedBlock.tsx` | 3h |
| 4.11 | Quote block (styled quotation) | `blocks/QuoteBlock.tsx` | 2h |
| 4.12 | List block (ordered/unordered) | `blocks/ListBlock.tsx` | 2h |

#### 4B: Theming & Templates (Week 15-16)

| # | Task | Files | Est. |
|---|------|-------|------|
| 4.13 | Course theme editor (colors, fonts, branding) | `components/authoring/ThemeEditor.tsx` | 8h |
| 4.14 | Block template library UI (save/load templates) | `components/authoring/TemplateLibrary.tsx` | 6h |
| 4.15 | Block template CRUD server actions | `action/authoring/templates.ts` | 3h |
| 4.16 | RTL polish pass (all blocks render correctly in RTL) | All block files | 8h |
| 4.17 | Mobile responsive pass (all blocks) | All block files | 6h |
| 4.18 | Undo/Redo system in editor | Editor store | 6h |
| 4.19 | Keyboard shortcuts (block operations) | Editor component | 3h |
| 4.20 | Player renderers for all new blocks | `player/blocks/` | 16h |

**Phase 4 Total: ~110 hours**

**Phase 4 Deliverable**: 21 total block types, course theming, template library, full RTL support, mobile responsive, undo/redo.

---

### Phase 5: Advanced Features (Week 17-20)

**Goal**: SCORM export, advanced blocks, analytics, xAPI

#### 5A: SCORM Export (Week 17-18)

| # | Task | Files | Est. |
|---|------|-------|------|
| 5.1 | SCORM 1.2 package generator (course JSON → SCORM ZIP) | `src/lib/scorm/exporter.ts` | 16h |
| 5.2 | SCORM 2004 package generator | Extension of exporter | 8h |
| 5.3 | Manifest generator (imsmanifest.xml builder) | `src/lib/scorm/manifest.ts` | 6h |
| 5.4 | SCORM runtime wrapper (embed in exported package) | `src/lib/scorm/runtime-template/` | 8h |
| 5.5 | Export UI (download SCORM ZIP) | `components/authoring/ExportDialog.tsx` | 4h |

#### 5B: Advanced Block Types (Week 18-19)

| # | Block | Component | Est. |
|---|-------|-----------|------|
| 5.6 | Scenario/Branching block | `blocks/ScenarioBlock.tsx` | 12h |
| 5.7 | Hotspot block (click regions on image) | `blocks/HotspotBlock.tsx` | 8h |
| 5.8 | Gallery block (image carousel) | `blocks/GalleryBlock.tsx` | 4h |
| 5.9 | Chart block (recharts integration) | `blocks/ChartBlock.tsx` | 6h |
| 5.10 | Table block (data table editor) | `blocks/TableBlock.tsx` | 6h |
| 5.11 | Code block (syntax highlighting) | `blocks/CodeBlock.tsx` | 3h |

#### 5C: Analytics & xAPI (Week 19-20)

| # | Task | Files | Est. |
|---|------|-------|------|
| 5.12 | Block-level analytics dashboard | `insights/courses/[id]/BlockAnalytics.tsx` | 8h |
| 5.13 | Video watch heatmap (Bunny Stream API) | `insights/courses/[id]/VideoHeatmap.tsx` | 6h |
| 5.14 | Quiz results analysis (per-question stats) | `insights/courses/[id]/QuizAnalytics.tsx` | 6h |
| 5.15 | xAPI statement generation for block interactions | `src/lib/xapi/statements.ts` | 8h |
| 5.16 | Course version history + rollback UI | `components/authoring/VersionHistory.tsx` | 8h |

**Phase 5 Total: ~130 hours**

**Phase 5 Deliverable**: Full SCORM 1.2/2004 export, 27+ total block types, block-level analytics, video heatmaps, xAPI support, version history.

---

## 8. File Structure

### New Files Created

```
src/
├── stores/
│   └── editor.store.ts                    # Zustand store for editor state
│
├── lib/
│   ├── bunny/
│   │   ├── stream.ts                      # Bunny Stream API client
│   │   ├── storage.ts                     # Bunny Edge Storage client
│   │   └── cdn.ts                         # CDN signed URL generation
│   │
│   ├── ai/
│   │   ├── prompts.ts                     # System prompts for all AI operations
│   │   ├── usage.ts                       # Token tracking + rate limiting
│   │   ├── chunker.ts                     # Semantic text chunking
│   │   └── extractors/
│   │       ├── pdf.ts                     # PDF text/image extraction
│   │       ├── docx.ts                    # DOCX extraction
│   │       └── pptx.ts                    # PPTX extraction
│   │
│   └── scorm/
│       ├── exporter.ts                    # SCORM package generator
│       └── manifest.ts                    # imsmanifest.xml builder
│
├── types/
│   └── authoring.ts                       # All authoring type definitions
│
├── components/
│   └── authoring/
│       ├── EditorCanvas.tsx               # Main editor canvas
│       ├── EditorHeader.tsx               # Save/preview/publish toolbar
│       ├── BlockToolbar.tsx               # Block type selector
│       ├── BlockWrapper.tsx               # Block selection/drag wrapper
│       ├── ModuleSidebar.tsx              # Course structure tree
│       ├── ThemeEditor.tsx                # Course theme customization
│       ├── TemplateLibrary.tsx            # Block template browser
│       ├── VideoUploader.tsx              # TUS video upload to Bunny
│       ├── ExportDialog.tsx               # SCORM export UI
│       ├── VersionHistory.tsx             # Content version history
│       │
│       ├── blocks/                        # EDITOR block components (27+)
│       │   ├── TextBlock.tsx
│       │   ├── ImageBlock.tsx
│       │   ├── VideoBlock.tsx
│       │   ├── AccordionBlock.tsx
│       │   ├── TabsBlock.tsx
│       │   ├── MultipleChoiceBlock.tsx
│       │   ├── TrueFalseBlock.tsx
│       │   ├── DividerBlock.tsx
│       │   ├── CoverBlock.tsx
│       │   ├── FlashcardBlock.tsx
│       │   ├── LabeledGraphicBlock.tsx
│       │   ├── ProcessBlock.tsx
│       │   ├── TimelineBlock.tsx
│       │   ├── SortingBlock.tsx
│       │   ├── MultipleResponseBlock.tsx
│       │   ├── FillInBlankBlock.tsx
│       │   ├── MatchingBlock.tsx
│       │   ├── AudioBlock.tsx
│       │   ├── EmbedBlock.tsx
│       │   ├── QuoteBlock.tsx
│       │   ├── ListBlock.tsx
│       │   ├── ScenarioBlock.tsx
│       │   ├── HotspotBlock.tsx
│       │   ├── GalleryBlock.tsx
│       │   ├── ChartBlock.tsx
│       │   ├── TableBlock.tsx
│       │   └── CodeBlock.tsx
│       │
│       └── ai/                            # AI generation UI
│           ├── AICourseWizard.tsx
│           ├── OutlineEditor.tsx
│           ├── GenerationProgress.tsx
│           ├── InlineAIToolbar.tsx
│           └── DocumentUploader.tsx
│
├── components/
│   └── player/                            # LEARNER player components
│       ├── CoursePlayer.tsx
│       ├── LessonRenderer.tsx
│       ├── ProgressSidebar.tsx
│       └── blocks/                        # READ-ONLY block renderers
│           ├── TextRenderer.tsx
│           ├── VideoRenderer.tsx
│           ├── QuizRenderer.tsx
│           └── ... (one per block type)
│
├── action/
│   ├── authoring/
│   │   ├── content.ts                     # Save/load/publish course content
│   │   ├── templates.ts                   # Block template CRUD
│   │   └── media.ts                       # Media upload management
│   │
│   └── player/
│       └── progress.ts                    # Block-level progress tracking
│
└── app/
    ├── api/
    │   ├── ai/
    │   │   ├── generate-outline/route.ts
    │   │   ├── generate-lesson/route.ts
    │   │   ├── generate-quiz/route.ts
    │   │   ├── refine-block/route.ts
    │   │   └── extract-document/route.ts
    │   │
    │   └── webhooks/
    │       └── bunny-stream/route.ts
    │
    └── dashboard/
        └── @lms_admin/
            └── (courses_categorise)/
                └── courses/
                    └── add-course/
                        └── build-course/
                            └── page.tsx   # REWRITTEN: Native block editor
```

### Files Deleted

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

## 9. Testing Strategy

### Unit Tests (Vitest)

| Area | Tests |
|------|-------|
| Block Editor Store | Block CRUD, reorder, undo/redo, module/lesson management |
| AI Prompts | Prompt template rendering with variables |
| SCORM Exporter | Manifest generation, ZIP packaging |
| Bunny Services | URL signing, API response parsing |
| Block Renderers | Snapshot tests for each block type |
| Document Extractors | PDF/DOCX/PPTX text extraction |

### Integration Tests

| Area | Tests |
|------|-------|
| Course Content API | Save, load, publish, version management |
| AI Generation | Outline → content → quiz pipeline |
| SCORM Upload | ZIP → Bunny Storage → signed URL |
| Video Upload | TUS upload → webhook → metadata update |
| Block Progress | Track, update, calculate completion |

### E2E Tests (Playwright)

| Flow | Tests |
|------|-------|
| Create Course (From Scratch) | Add metadata → open editor → add blocks → save → publish |
| Create Course (AI) | Enter topic → review outline → generate → edit → publish |
| Take Course (Learner) | Enroll → navigate lessons → complete blocks → get certificate |
| SCORM Upload | Upload ZIP → play in player → track progress |
| Video Upload | Upload video → wait for processing → embed in course |

---

## 10. Environment Variables

### New Variables Required

```env
# Bunny.net
BUNNY_API_KEY=                      # Account-level API key
BUNNY_STREAM_API_KEY=               # Stream Library API key
BUNNY_STREAM_LIBRARY_ID=            # Stream Library ID
BUNNY_STORAGE_KEY=                  # Storage Zone password
BUNNY_STORAGE_ZONE=jadarat-scorm    # Storage Zone name
BUNNY_STORAGE_REGION=de             # Primary storage region
BUNNY_PULL_ZONE_ID=                 # Pull Zone ID
BUNNY_PULL_ZONE_KEY=                # Pull Zone token auth key
BUNNY_STREAM_WEBHOOK_SECRET=        # Webhook HMAC secret
NEXT_PUBLIC_BUNNY_CDN_HOST=scorm.jadarat.com
NEXT_PUBLIC_BUNNY_STREAM_HOST=      # e.g., vz-xxxxx.b-cdn.net

# AI (existing, keep as-is)
ANTHROPIC_API_KEY=                  # Already exists
OPENAI_API_KEY=                     # Already exists
AI_ENCRYPTION_KEY=                  # Already exists
```

### Variables to Remove

```env
COASSEMBLE=                         # DELETE
NEXT_PUBLIC_COASSEMBLE=             # DELETE
```

---

## 11. Risk Mitigation

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rich text editor complexity (RTL + Arabic) | HIGH | Use Tiptap (ProseMirror-based) -- best RTL support, JSON output |
| Block editor performance with many blocks | MEDIUM | Virtualize block list, lazy-load heavy blocks |
| AI-generated content quality | MEDIUM | Human review checkpoint, inline editing, quality scoring |
| Bunny.net outage affecting course delivery | HIGH | Fallback to Supabase Storage for critical SCORM content |
| SCORM cross-origin issues | HIGH | Use custom hostname (`scorm.jadarat.com`) as primary solution |
| Migration of existing Coassemble courses | MEDIUM | Keep `coassemble_id` column, provide manual re-creation path |
| Video processing delays | LOW | Show processing status, webhook notification when ready |

### Migration Strategy

1. **No automatic migration** of Coassemble course content (content lives on their servers)
2. **Existing courses** with `coassemble_id` will show "Legacy Course" badge
3. **Admin UI** will provide option to "Re-create as Native Course" (manual)
4. **SCORM courses** continue working -- only storage backend changes (Supabase → Bunny)
5. **Learner progress** for existing courses preserved (user_courses table unchanged)

### Rollback Plan

- Each phase is independently deployable behind feature flags
- `native_authoring` feature flag controls access to new editor
- Existing SCORM flow remains functional throughout migration
- Database changes are additive (no destructive migrations)

---

## Summary: Timeline & Effort

| Phase | Scope | Duration | Effort |
|-------|-------|----------|--------|
| **Phase 0** | Foundation & Cleanup | Week 1-2 | ~30h |
| **Phase 1** | Block Editor MVP (9 blocks) | Week 3-6 | ~120h |
| **Phase 2** | Course Player & SCORM Migration | Week 7-9 | ~100h |
| **Phase 3** | AI Course Generation | Week 10-13 | ~115h |
| **Phase 4** | Interactive Blocks + Polish | Week 14-16 | ~110h |
| **Phase 5** | SCORM Export + Advanced | Week 17-20 | ~130h |
| **TOTAL** | | **20 weeks** | **~605 hours** |

### New Dependencies to Install

```bash
npm install tiptap @tiptap/starter-kit @tiptap/extension-text-direction  # Rich text editor
npm install zustand                                                       # Editor state
npm install mammoth                                                       # DOCX extraction
npm install tus-js-client                                                 # TUS video upload
npm install bunny-sdk                                                     # Bunny.net SDK
npm install @dnd-kit/core @dnd-kit/sortable                              # Drag and drop
```

### Key Decisions

1. **Rich Text**: Tiptap (ProseMirror) -- best RTL support, JSON output, extensible
2. **Drag & Drop**: @dnd-kit (lighter than react-beautiful-dnd, better Next.js support)
3. **State**: Zustand for editor (simpler than Redux for complex local state)
4. **Video**: Bunny Stream with Player.js control (no custom player needed)
5. **SCORM Hosting**: Bunny Storage + Pull Zone with custom hostname
6. **AI**: Claude Sonnet 4.6 for generation, Haiku 4.5 for inline edits
7. **Cross-Origin SCORM**: Custom hostname primary, CrossFrame API backup
