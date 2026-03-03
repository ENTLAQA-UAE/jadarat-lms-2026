# AI Course Builder — Business Requirements Document (BRD)

> **Date**: March 2, 2026
> **Version**: 1.0
> **Platform**: Jadarat LMS — First Arabic AI-Powered B2B SaaS LMS
> **Competitor Benchmark**: Articulate Rise 360 "Create course with AI"
> **Goal**: Go beyond Rise in every dimension — UI, content, images, outline, interactivity, Arabic-first, and enterprise readiness

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Competitor Deep Dive: Rise "Create with AI" (Every Screen)](#2-competitor-deep-dive-rise-create-with-ai-every-screen)
3. [Current Jadarat State (What We Already Have)](#3-current-jadarat-state-what-we-already-have)
4. [Gap Analysis: Rise vs. Jadarat](#4-gap-analysis-rise-vs-jadarat)
5. [Task 1 — AI Course Wizard UX Enhancement (6-Step Pipeline)](#5-task-1--ai-course-wizard-ux-enhancement-6-step-pipeline)
6. [Task 2 — Course Player & Learner Experience](#6-task-2--course-player--learner-experience)
7. [Task 3 — Outline Builder Enhancements](#7-task-3--outline-builder-enhancements)
8. [Task 4 — Theme Engine Expansion](#8-task-4--theme-engine-expansion)
9. [Task 5 — Block Editor Polish & New Block Types](#9-task-5--block-editor-polish--new-block-types)
10. [Task 6 — Export & Review Workflow](#10-task-6--export--review-workflow)
11. [UI/UX Specifications (ASCII Wireframes)](#11-uiux-specifications-ascii-wireframes)
12. [Implementation Priority Matrix](#12-implementation-priority-matrix)

---

## 1. Executive Summary

### What This Document Covers

This BRD is the result of a **pixel-by-pixel analysis** of 9 Rise Articulate "Create course with AI" screenshots plus the published course output, mapped against our existing Jadarat authoring tool codebase. It defines exactly what we need to build to **surpass** Rise in every dimension.

### Key Finding

**Jadarat already has 70% of the technical capability.** Our AI pipeline (outline generation, lesson generation, quiz generation, image generation, inline AI refine), block editor (27 types), theme editor, SCORM export, and Zustand state management are all implemented. The gaps are primarily in **UX flow design, visual polish, and missing intermediate steps** that Rise handles elegantly.

### The 6 Tasks

| # | Task | Effort | Impact | Type |
|---|------|--------|--------|------|
| 1 | AI Course Wizard UX Enhancement | Medium | Critical | UX Redesign |
| 2 | Course Player & Learner Experience | Medium | Critical | New Component |
| 3 | Outline Builder Enhancements | Medium | High | UX Enhancement |
| 4 | Theme Engine Expansion | Medium | Medium | Enhancement |
| 5 | Block Editor Polish & New Block Types | Low | Medium | Enhancement |
| 6 | Export & Review Workflow | Low | Medium | New Feature |

---

## 2. Competitor Deep Dive: Rise "Create with AI" (Every Screen)

### Screen 1 — Source Material (Step 1 of 4)

**What Rise Shows:**
- Single unified page with 3 input areas:
  - **"Describe your course"** (required) — Free-text area, placeholder: topic description
  - **"Source materials (optional)"** — Drag-and-drop zone for files (PDF, DOCX, PPTX, audio, video, SRT)
  - **"Paste text or URLs you want me to reference"** — Text input for URLs
- Helper text: "A few words is enough to get started, but add as much context as you'd like"
- Tooltip: "Do you have Source Material? Add documents, slides, or URLs. AI will restructure important concepts into an effective course designed for your learners."
- Single CTA: **"Generate course details →"**
- Clean, minimal, inviting design — low cognitive load

**Rise Strengths:**
- Extremely low barrier to entry — just type a topic and go
- Combines prompt + document + URL on one page (no separate flows)
- Friendly, conversational copy

**Rise Weaknesses:**
- No language selection (English-only assumption)
- No industry/domain picker
- No template starting points
- No voice input
- No existing course library to reference

---

### Screen 2 — Course Details: Top Half (Step 2 of 4)

**What Rise Shows:**
- Breadcrumb: Source material ✓ → **Course details** → Course outline → Lesson drafts
- Heading: "Take a look at the course details I've generated."
- Subheading: "Refine the course information and learning objectives to match your vision."
- **Course Length** — 4 visual cards (radio selection):
  - Single Lesson (1 lesson, < 5 min)
  - **Short Course** (1-3 lessons, < 1 hr) ← selected
  - Standard Course (4-8 lessons, 1-2 hrs)
  - Extended Course (8+ lessons, 3+ hr)
- Helper: "Choose the right depth for your training >"
- **Course Information** section with "Edit with AI" dropdown:
  - Course Topic: "Optimizing B2B sales activities and strategies"
  - Tone: "Practical, confident, motivating, results-oriented"
  - Audience: "Mid-level B2B sales professionals seeking to improve their sales activity strategies and outcomes."
  - Goals: "Apply effective B2B sales activity techniques to improve client engagement and increase deal success rates."
- Button: **"Generate course outline →"**

**Rise Strengths:**
- AI auto-generates ALL course details from just the topic — user reviews, not fills
- Visual course length cards with time estimates — intuitive
- "Edit with AI" dropdown for section-level AI refinement

**Rise Weaknesses:**
- Only 4 preset course lengths — no custom option
- No difficulty level indicator
- No compliance/certification mapping
- No assessment density control
- No prerequisite awareness

---

### Screen 3 — Course Details: Bottom Half (Step 2 of 4, scrolled)

**What Rise Shows:**
- **Learning Objectives** section with "Edit with AI" dropdown:
  - Heading: "After completing your course, learners should understand or be able to:"
  - 4 objectives listed, each with:
    - Drag handle (≡) for reordering
    - Editable text
    - Delete icon (🗑)
  - Button: "+ Add learning objective"
- Example objectives:
  1. "Identify key B2B sales activities for each stage of the sales funnel."
  2. "Develop tailored outreach strategies for prospective clients."
  3. "Utilize tools and metrics to track and enhance sales activities."
  4. "Apply best practices for follow-up and relationship management in B2B contexts."

**Rise Strengths:**
- Dedicated learning objectives editor with drag-and-drop
- "Edit with AI" for bulk objective refinement
- Clean, actionable objective format

**Rise Weaknesses:**
- No Bloom's Taxonomy tagging (objectives use mixed verb levels without explicit categorization)
- No bilingual objectives (Arabic + English side-by-side)
- No competency/skill framework mapping
- No assessment alignment preview ("This objective maps to Quiz in Lesson 2")
- No difficulty level per objective

---

### Screen 4 — Outline Generation Loading (Step 3 of 4)

**What Rise Shows:**
- Breadcrumb: Source material ✓ → Course details ✓ → **Course outline** → Lesson drafts
- Heading: "Putting your course outline together..."
- 3-step progress checklist with animated checkmarks:
  - ✓ Building course structure
  - ○ Connecting learning objectives
  - ○ Sequencing lessons and flow
- Escape hatch: "← Stop and go back"

**Rise Strengths:**
- Clear, descriptive progress steps
- User knows exactly what's happening
- Can abort and go back

**Rise Weaknesses:**
- No estimated time remaining
- No real-time preview of what's being generated
- Static checklist — no granular progress percentage
- No "AI thinking" transparency

---

### Screen 5 — Course Outline Generated (Step 3 of 4)

**What Rise Shows:**
- Heading: "Your course is coming together!"
- Subheading: "We've organized your content into a course outline."
- **"Edit with AI"** dropdown at top level
- **Left sidebar** — Lesson navigation:
  - Overview: "Optimizing B2B Sales Activities for Greater Success"
  - Lesson #1: "Mastering Key B2B Sales Activities Across the Funnel"
  - Lesson #2: "Building Tailored Outreach Strategies and Leveraging Sales Tools"
  - Lesson #3: "Best Practices for Follow-Up and Relationship Management"
  - Buttons: "+ Blank lesson" / "+ Add with AI"
  - Drag handles for reordering
- **Main content area** — Each lesson expanded:
  - Title (editable)
  - Description (with character count, e.g., 51/100)
  - Topics (bullet list of key points covered)
- **Export section**: "Get input from your team and reviewers" — Export as PDF or Word file
- Buttons: "← Back" / **"Course content options →"**

**Rise Strengths:**
- Split-panel layout (sidebar nav + main content) — professional and organized
- Per-lesson descriptions and topic lists — rich outline
- Character count guidance on descriptions
- Export outline for team review before content generation
- Can add lessons manually or with AI

**Rise Weaknesses:**
- Flat list view only — no visual flowchart/timeline
- No time estimates per lesson
- No prerequisite arrows between lessons
- No content type indicators (which lessons will be text-heavy vs. interactive)
- No assessment placement preview
- No collaborative inline commenting (just export)

---

### Screen 6 — Course Content Options (Step 3→4 Transition)

**What Rise Shows:**
- Modal dialog with 2 configuration options:
  - **"Generate lessons as:"**
    - ○ Text and interactive content (selected)
    - ○ Text only
  - **"Generate images for this course:"**
    - Toggle: "Add AI images" [Beta tag]
- Single CTA: **"Create course draft"**

**Rise Strengths:**
- Clean pre-generation configuration
- AI image opt-in (respects cost/preference)
- Simple binary choice for content format

**Rise Weaknesses:**
- Only 2 content format options (no "Video-heavy", "Assessment-focused", "Microlearning")
- No block type preferences
- No image style selection (the 13+ styles are available elsewhere but not at this step)
- No assessment density control (e.g., "quiz every lesson" vs. "quiz every module")
- No narration/audio option
- No language/cultural imagery preference

---

### Screen 7 & 8 — Lesson Draft Generation (Step 4 of 4)

**What Rise Shows:**
- Shows the course overview page with lesson cards
- **Progress bar** at top: "Generating lessons — Lesson 1/3: Mastering Key B2B..."
- Lessons appear progressively as they complete (1/3 → 2/3 → 3/3)
- Overview page becomes interactive as lessons complete

**Rise Strengths:**
- Visual feedback — lessons unlock progressively
- Clean progress indicator with current lesson name
- User sees the final course structure forming

**Rise Weaknesses:**
- Can't preview lessons as they generate (must wait for all)
- No block-by-block live preview
- No quality/completeness score
- No estimated time remaining
- Can't edit earlier lessons while later ones generate

---

### Screen 9 — Theme Customization

**What Rise Shows:**
- **Left panel** — Theme settings organized by section:
  - **Cover Page**: Image upload area + layout options + "START COURSE" button text
  - **Navigation**: Navigation style options
  - **Lesson Headers**: Header display settings
  - **Colors**: Accent color picker (orange selected)
  - **Fonts**: Font family selector
  - **Blocks**: Block-level style options
- **Right panel** — Live course preview:
  - Course cover page with uploaded image
  - Orange accent theme applied
  - "START COURSE" button visible
  - Responsive preview icons (desktop / tablet / mobile)

**Rise Strengths:**
- Section-by-section theme editing
- Live preview with responsive breakpoints
- Cover page image upload integrated
- Comprehensive: covers navigation, headers, colors, fonts, blocks

**Rise Weaknesses:**
- No Arabic typography presets
- No RTL-first theme variants
- No Islamic/Arabic geometric pattern options
- No brand kit import (upload logo → auto-extract colors)
- No dark mode variant
- No WCAG accessibility checker inline
- Limited to 3 base themes (Rise, Apex, Horizon)
- No theme marketplace or community themes

---

### Published Course Output (Shared Link Analysis)

Based on the Rise published course structure:
- **Cover page**: Full-width branded hero with gradient/image background, course title, "START COURSE" CTA
- **Lesson navigation**: Left sidebar with collapsible lesson list + progress indicators
- **Content rendering**: Clean scrolling layout with:
  - Text blocks with styled typography
  - AI-generated images between content sections
  - Interactive blocks (accordion, tabs) with smooth animations
  - Knowledge check blocks (multiple choice) with feedback
  - Progress bar at top
- **Responsive**: Adapts to mobile/tablet viewports

---

## 3. Current Jadarat State (What We Already Have)

### 3.1 AI Course Wizard (`AICourseWizard.tsx` — 362 lines)

**Current 3-Step Flow:**

| Step | Name | UI Elements | What Happens |
|------|------|-------------|--------------|
| 1 | **Topic & Settings** | Topic input (required), Audience input (required), Difficulty dropdown (beginner/intermediate/advanced), Language dropdown (AR/EN), Tone dropdown (formal/conversational/academic), Module count select (3-7), Lessons/module select (2-5), DocumentUploader component | User fills ALL fields manually, then clicks "Generate Outline" |
| 2 | **Review Outline** | OutlineEditor component — course title, badges (modules/lessons/duration/difficulty/language), learning outcomes list, expandable module cards with editable lesson titles, add/delete/reorder modules and lessons | User reviews and edits AI-generated outline |
| 3 | **Generate Content** | GenerationProgress component — progress bar, lesson-by-lesson status (pending/generating/generating_images/done/error), block counts, image resolution progress | AI generates all lessons sequentially, resolves GENERATE: image markers via DALL-E 3 |

**Current Architecture:**
- Entry: `AICourseWizard.tsx` → renders step-specific components
- Step indicator: pill-style breadcrumbs (settings → outline → generate)
- API calls: `/api/ai/generate-outline` (Claude Sonnet 4.5) → `/api/ai/generate-lesson` (streaming) → DALL-E 3 images
- Output: Loads into Zustand `EditorStore` via `loadContent()`

### 3.2 Outline Editor (`OutlineEditor.tsx` — 327 lines)

**Current Capabilities:**
- Editable course title
- Metadata badges: module count, lesson count, estimated duration, difficulty, language
- Learning outcomes displayed as read-only bullet list
- Module cards with:
  - Editable module title (inline)
  - Expand/collapse toggle
  - Move up/down buttons
  - Delete button (disabled if only 1 module)
  - Lesson count badge
- Lessons within modules:
  - Editable title (inline)
  - Duration estimate display
  - Delete button (disabled if only 1 lesson)
- Add Module button (full width)
- Add Lesson button (per module)
- "Approve & Generate Content" CTA

**Missing vs. Rise:**
- No lesson descriptions (Rise shows descriptions + topics per lesson)
- No "Edit with AI" at any level (Rise has it on every section)
- Learning outcomes are read-only (Rise has drag/delete/add/edit)
- No export outline as PDF/Word
- No split-panel layout (sidebar + main content)
- No character count guidance on fields

### 3.3 Generation Progress (`GenerationProgress.tsx` — 419 lines)

**Current Capabilities:**
- Flat lesson list with status icons: pending (empty circle), generating (spinning loader), generating_images (amber spinner), done (green check), error (red alert)
- Progress bar with percentage and "X of Y lessons generated"
- Image resolution tracking ("Images 2/5" badge)
- "Start Generating All Lessons" button (manual trigger)
- Error handling per lesson
- "Open in Editor" button when done
- Sequential generation with abort capability

**Missing vs. Rise:**
- No "Content Options" modal before generation (Rise asks text+interactive vs text-only, AI images toggle)
- Generation doesn't auto-start (Rise auto-starts after clicking "Create course draft")
- No course overview page with lessons unlocking (Rise shows the actual course structure)

### 3.4 Theme Editor (`ThemeEditor.tsx` — 409 lines)

**Current Capabilities:**
- Color pickers: Primary, Secondary, Background, Text (hex input + color picker)
- Typography: Font family selector (Cairo, Inter, Tajawal, System) with Arabic+English preview
- Border Radius: Toggle buttons (None/Small/Medium/Large) with visual preview
- Cover Style: Dropdown (Gradient/Image/Solid)
- Live Preview: Shows header with gradient/solid, body with text + buttons + info card

**Missing vs. Rise:**
- No cover page image upload
- No navigation style options
- No lesson header settings
- No block-level style options
- No responsive preview (desktop/tablet/mobile)
- No prebuilt theme presets
- No dark mode option

### 3.5 Inline AI Toolbar (`InlineAIToolbar.tsx` — 180 lines)

**Current Capabilities (exceeds Rise at block level):**
- Popover menu with 5 AI actions:
  1. **Expand** — Add more detail and examples
  2. **Simplify** — Simpler language and shorter sentences
  3. **Translate** — Toggle between Arabic/English
  4. **Rephrase** — Rewrite in a different tone
  5. **Add Example** — Add a MENA-relevant example
- Streaming response from `/api/ai/refine-block`
- Abort controller for cancellation
- Works on any text block content

### 3.6 Block Editor & Types (27 block types in `types/authoring.ts`)

**Content Blocks (13):** TEXT, IMAGE, VIDEO, AUDIO, EMBED, QUOTE, LIST, CODE, TABLE, DIVIDER, COVER, GALLERY, CHART

**Interactive Blocks (8):** ACCORDION, TABS, FLASHCARD, LABELED_GRAPHIC, PROCESS, TIMELINE, HOTSPOT, SCENARIO

**Assessment Blocks (6):** MULTIPLE_CHOICE, TRUE_FALSE, MULTIPLE_RESPONSE, FILL_IN_BLANK, MATCHING, SORTING

**Rise has ~20 block types. Jadarat has 27.**

### 3.7 Editor Canvas & State Management

- **EditorCanvas.tsx**: DnD-kit based drag-and-drop, keyboard shortcuts (Ctrl+Z/Y), block selection
- **ModuleSidebar.tsx**: Tree navigation for modules → lessons
- **BlockToolbar.tsx**: Add block menu organized by category
- **BlockWrapper.tsx**: Drag handle, delete, lock/unlock, visibility toggle
- **Zustand Store**: Full CRUD for modules/lessons/blocks, 50-level undo/redo, theme/settings management
- **ExportDialog.tsx**: SCORM 1.2 and 2004 export to ZIP

### 3.8 AI API Routes (Fully Implemented)

| Route | Model | Purpose |
|-------|-------|---------|
| `POST /api/ai/generate-outline` | Claude Sonnet 4.5 | Generate course outline from topic |
| `POST /api/ai/generate-lesson` | Claude Sonnet 4.5 | Generate lesson blocks (streaming) |
| `POST /api/ai/generate-quiz` | Claude Sonnet 4.5 | Generate assessment blocks |
| `POST /api/ai/refine-block` | Claude Sonnet 4.5 | Inline content refinement (streaming) |
| `POST /api/ai/extract-document` | pdfjs/mammoth/JSZip | Parse PDF/DOCX/PPTX to chunks |
| `POST /api/ai/generate-image` | DALL-E 3 | Generate images from prompts |

### 3.9 Database Schema (Implemented)

- `course_content` — JSONB storage for full CourseContent
- `block_templates` — Reusable block templates per org
- `ai_generation_log` — Full AI usage tracking with cost
- `bunny_videos` — Video metadata from Bunny Stream
- `learner_block_progress` — Per-block learner tracking
- `course_media` — Media asset registry

---

## 4. Gap Analysis: Rise vs. Jadarat

### Where Jadarat Already Exceeds Rise

| Feature | Rise | Jadarat | Advantage |
|---------|------|---------|-----------|
| Block types | ~20 | 27 | +7 types (scenario, hotspot, chart, code, table, gallery, fill-in-blank) |
| AI refine actions | Section-level "Edit with AI" | Block-level 5-action toolbar (expand, simplify, translate, rephrase, add example) | More granular control |
| Document-to-Course | Documents as "reference" only | Full PDF/DOCX/PPTX parsing and extraction | True document conversion |
| Arabic/RTL | Zero native support | Arabic-first with RTL, Cairo/Tajawal fonts, MSA prompts, MENA cultural context | Primary differentiator |
| AI model flexibility | Proprietary single model | Claude, GPT-4o, Gemini, Jais — per-org configurable | Enterprise flexibility |
| Quiz sophistication | MC, MR, Fill-blank, Matching | MC, T/F, MR, Fill-blank, Matching, Sorting + Bloom's taxonomy alignment | Richer assessment |
| Block templates | Not available | Organization-level reusable block templates | Content reuse |
| Undo/redo | Not visible | 50-level undo/redo stack | Editor maturity |
| AI cost tracking | Not visible | Full `ai_generation_log` with per-operation cost, tokens, duration | Enterprise transparency |
| Multi-tenancy | Per-user accounts | Per-org AI config, feature flags, rate limits, API key encryption | B2B-ready |

### Where Rise Exceeds Jadarat (The Gaps to Close)

| # | Gap | Rise Does | Jadarat Current | Priority | Effort |
|---|-----|-----------|----------------|----------|--------|
| G1 | **Auto-generated course details** | AI generates topic, tone, audience, goals from just a prompt | User manually fills topic, audience, difficulty, tone, module count, lesson count | P0 | Medium |
| G2 | **Course length picker** | 4 visual cards with time estimates (Single/Short/Standard/Extended) | Dropdown selects for module count (3-7) and lessons per module (2-5) | P0 | Low |
| G3 | **Learning objectives editor** | Draggable list with edit/delete/add + "Edit with AI" | Read-only bullet list, non-editable | P0 | Medium |
| G4 | **"Edit with AI" on outline sections** | Dropdown on Course Info + Learning Objectives + Outline level | Only available at block level via InlineAIToolbar | P1 | Medium |
| G5 | **Content options before generation** | Modal: text+interactive vs text-only + AI images toggle | Goes straight from outline to generation with no configuration | P0 | Low |
| G6 | **Lesson descriptions in outline** | Each lesson shows title + description + topic bullet list | Only lesson title and duration shown | P1 | Low |
| G7 | **Outline PDF/Word export** | Export outline for team review before content generation | Only SCORM export after full content generation | P1 | Medium |
| G8 | **Split-panel outline editor** | Left sidebar (lesson list) + Right panel (lesson details) | Single-column card-based layout | P1 | Medium |
| G9 | **Published course player** | Branded cover page, sidebar navigation, progress bar, responsive | Course player component exists but needs polish | P0 | High |
| G10 | **Theme presets** | 3 prebuilt themes (Rise, Apex, Horizon) with cover page layouts | Only custom theme editor, no presets | P2 | Low |
| G11 | **Cover page image upload** | Drag-and-drop image for cover page in theme editor | Cover style dropdown (gradient/image/solid) but no image upload in theme | P2 | Low |
| G12 | **Responsive preview** | Desktop/tablet/mobile preview icons in theme editor | No responsive preview in editor | P2 | Low |

---

## 5. Task 1 — AI Course Wizard UX Enhancement (6-Step Pipeline)

### 5.1 Business Requirement

Transform the current 3-step wizard into a 6-step pipeline that matches Rise's elegance while surpassing it with Arabic-first design, industry templates, and richer configuration.

### 5.2 New 6-Step Flow

```
Step 1: Describe Your Course (Source Material)
  ↓
Step 2: Review Course Details (AI-Generated, Editable)
  ↓
Step 3: Edit Learning Objectives (Drag/Edit/Add/AI)
  ↓
Step 4: Review Course Outline (Split-Panel Editor)
  ↓
Step 5: Content Options (Pre-Generation Config)
  ↓
Step 6: Generate Content (Progress + Preview)
```

### 5.3 Step 1 — Describe Your Course (REDESIGNED)

**Current State:** Form with 7 manual fields (topic, audience, difficulty, language, tone, module count, lessons per module) + document uploader.

**New Design — Inspired by Rise but going beyond:**

```
┌──────────────────────────────────────────────────────────────┐
│  ✨ Let's build your course together                        │
│  Share your vision and source materials, and we'll create   │
│  engaging lessons designed for your learners.               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Describe your course *                               │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ e.g., B2B sales activities and strategies...   │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ A few words is enough, but add as much context     │    │
│  │ as you'd like.                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Source materials (optional)                          │    │
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │    │
│  │   Drop PDF, DOCX, or PPTX here or choose file     │    │
│  │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Paste text or URLs you want me to reference          │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │                                                 │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ── Advanced Options (collapsed by default) ──────────────  │
│  │ Language: [AR ▾]  │ Industry: [General ▾]             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [Cancel]                          [Generate course details →] │
└──────────────────────────────────────────────────────────────┘
```

**Key Changes from Current:**
- **Only 1 required field** (course description) — down from 2 required (topic + audience)
- **Document upload + URL paste** on the same page (like Rise)
- **Advanced Options** collapsed by default: Language (AR/EN), Industry (General/HR/Compliance/Sales/Technical/Leadership/Safety/Custom)
- **AI will auto-generate** audience, difficulty, tone, module count from just the description
- **Friendly, conversational copy** matching Rise's tone but in Arabic-first style

**Beyond Rise:**
- Industry picker for domain-specific AI prompts
- URL paste support (Rise has this, we should too)
- Language default is Arabic (Rise doesn't offer this)

### 5.4 Step 2 — Review Course Details (NEW STEP)

**Current State:** Does not exist — user manually sets all these in Step 1.

**New Design — AI generates everything, user reviews:**

```
┌──────────────────────────────────────────────────────────────┐
│  Source material ✓ → Course details → Outline → ...         │
│                                                              │
│  Take a look at the course details we've generated.         │
│  Refine the information to match your vision.               │
│                                                              │
│  ── Course Length ──────────────────────────────────────────  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 📄       │ │ 📚       │ │ 📖       │ │ 🎓       │      │
│  │ Micro    │ │ Short    │ │ Standard │ │ Extended │      │
│  │ 1 lesson │ │ 2-4 les. │ │ 5-8 les. │ │ 9+ les.  │      │
│  │ < 10 min │ │ < 1 hr   │ │ 1-3 hrs  │ │ 3+ hrs   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│       ○            ●             ○             ○            │
│                                                              │
│  ── Course Information ─────────────── [✨ Edit with AI ▾]  │
│  │ Course Topic: [AI-generated topic text.............]     │
│  │ Tone:         [Practical, confident, motivating.....]    │
│  │ Audience:     [Mid-level B2B sales professionals...]     │
│  │ Goals:        [Apply effective B2B sales activity...]    │
│  │ Difficulty:   [Intermediate ▾]                           │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [← Back]                       [Generate course outline →]  │
└──────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Course Length cards** replace module/lesson count dropdowns — visual, intuitive
- All fields **pre-filled by AI** from the description + source material
- **"Edit with AI" dropdown** on Course Information section (like Rise)
- **Difficulty** shown here as an editable dropdown (was in Step 1 before)
- Every field editable, but user doesn't have to touch anything if AI got it right

**Beyond Rise:**
- Course length card includes **"Micro"** option (single lesson < 10 min) — Rise only starts at "Single Lesson" with < 5 min
- Difficulty level exposed and editable (Rise doesn't show this)
- Arabic labels and RTL layout by default

### 5.5 Step 3 — Edit Learning Objectives (NEW STEP)

**Current State:** Learning outcomes shown as read-only bullets in OutlineEditor.

**New Design — Dedicated objectives editor:**

```
┌──────────────────────────────────────────────────────────────┐
│  Source material ✓ → Course details ✓ → Learning objectives  │
│  → Outline → Content options → Generate                      │
│                                                              │
│  Review the learning objectives we've defined.               │
│  After completing this course, learners should be able to:   │
│                                                              │
│  ── Learning Objectives ────────────── [✨ Edit with AI ▾]  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ≡  1. Identify key B2B sales activities for...   [🗑]  │ │
│  │ ≡  2. Develop tailored outreach strategies...     [🗑]  │ │
│  │ ≡  3. Utilize tools and metrics to track...       [🗑]  │ │
│  │ ≡  4. Apply best practices for follow-up...       [🗑]  │ │
│  │                                                         │ │
│  │  [+ Add learning objective]                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  [← Back]                       [Generate course outline →]  │
└──────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- Each objective: drag handle (≡) + editable text + delete (🗑)
- "Edit with AI" dropdown on the objectives section
- "+ Add learning objective" button
- Matches Rise exactly, then goes beyond

**Beyond Rise:**
- Future: Bloom's Taxonomy color badges next to each objective
- Future: Bilingual toggle (show Arabic + English side-by-side)

### 5.6 Step 4 — Review Course Outline (ENHANCED)

**Current State:** OutlineEditor with single-column card layout. Module-level expand/collapse, editable titles, add/delete/reorder.

**New Design — Split-panel with rich lesson details:**

```
┌──────────────────────────────────────────────────────────────┐
│  ... ✓ → Course outline → Content options → Generate         │
│                                                              │
│  Your course is coming together!                             │
│  We've organized your content into a course outline.         │
│                                          [✨ Edit with AI ▾] │
│ ┌──────────────────┬─────────────────────────────────────┐   │
│ │ OUTLINE          │ LESSON DETAILS                      │   │
│ │                  │                                     │   │
│ │ 📋 Overview      │  Lesson #1                         │   │
│ │ ────────────     │  ┌──────────────────────────────┐  │   │
│ │ ≡ Module 1       │  │ Title: Mastering Key B2B...  │  │   │
│ │   ▸ Lesson 1  ◀ │  │ Description: (51/100)        │  │   │
│ │   ▸ Lesson 2    │  │ This lesson covers the       │  │   │
│ │   ▸ Lesson 3    │  │ fundamentals of B2B sales... │  │   │
│ │                  │  │                              │  │   │
│ │ ≡ Module 2       │  │ Topics:                      │  │   │
│ │   ▸ Lesson 4    │  │ • Overview of the B2B sales  │  │   │
│ │   ▸ Lesson 5    │  │   funnel                     │  │   │
│ │   ▸ Lesson 6    │  │ • Identifying effective      │  │   │
│ │                  │  │   activities per stage       │  │   │
│ │ ≡ Module 3       │  │ • Prioritizing activities    │  │   │
│ │   ▸ Lesson 7    │  │   with client decisions      │  │   │
│ │                  │  │                              │  │   │
│ │ [+ Blank lesson] │  │ ⏱ ~15 min                   │  │   │
│ │ [+ Add with AI]  │  └──────────────────────────────┘  │   │
│ └──────────────────┴─────────────────────────────────────┘   │
│                                                              │
│  📄 Export outline: [PDF] [Word] for team review             │
│                                                              │
│  [← Back]                          [Content options →]       │
└──────────────────────────────────────────────────────────────┘
```

**Key Changes from Current:**
- **Split-panel layout** — left sidebar for outline navigation, right panel for selected lesson details
- **Lesson details** show title, description (with character count), topics list, and duration
- **"Edit with AI"** dropdown at the outline level
- **"+ Blank lesson" / "+ Add with AI"** buttons at bottom of sidebar (like Rise)
- **Export** as PDF or Word for team review before content generation

**Beyond Rise:**
- Module-level grouping (Rise only has flat lesson list — no module/section nesting in the outline)
- Duration per lesson shown inline
- Future: Visual flowchart toggle view

### 5.7 Step 5 — Content Options (NEW STEP)

**Current State:** Does not exist.

**New Design — Pre-generation configuration modal:**

```
┌──────────────────────────────────────────────────────────────┐
│  ... ✓ → Content options → Generate                          │
│                                                              │
│  Almost there! Configure how your content will be generated. │
│                                                              │
│  ── Content Format ─────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ● Text and interactive content                       │    │
│  │   AI will create text, accordions, tabs, process     │    │
│  │   blocks, and knowledge checks.                      │    │
│  │                                                      │    │
│  │ ○ Text only                                          │    │
│  │   AI will create text-based content only.            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ── AI Images ──────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Generate images for this course     [━━━○━━━━] ON   │    │
│  │ AI will create relevant images using DALL-E 3.       │    │
│  │ Estimated cost: ~$0.36 (9 images × $0.04)           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ── Assessment Density (Beyond Rise) ───────────────────── │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ● Quiz every lesson                                  │    │
│  │   Knowledge check at the end of each lesson.         │    │
│  │                                                      │    │
│  │ ○ Quiz every module                                  │    │
│  │   Assessment at the end of each module.              │    │
│  │                                                      │    │
│  │ ○ No quizzes                                         │    │
│  │   Content only, no assessments.                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [← Back]                          [Create course draft →]  │
└──────────────────────────────────────────────────────────────┘
```

**Beyond Rise:**
- **Assessment density** control (Rise doesn't offer this)
- **Cost estimate** for AI images (enterprise transparency)
- Future: Image style selector, narration option

### 5.8 Step 6 — Generate Content (ENHANCED)

**Current State:** GenerationProgress component with flat lesson list and progress bar.

**Enhancement:** Keep current implementation but:
- **Auto-start** generation (no manual "Start Generating" button needed)
- Add **estimated time remaining** based on avg lesson generation time
- Show **block count** as each lesson completes
- Animate lessons from greyed-out to active state (like Rise's progressive unlock)

### 5.9 Technical Implementation Notes

**Files to Create/Modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/components/authoring/ai/AICourseWizard.tsx` | REWRITE | New 6-step flow with new step types |
| `src/components/authoring/ai/StepSourceMaterial.tsx` | NEW | Step 1 — Simplified prompt + document + URL |
| `src/components/authoring/ai/StepCourseDetails.tsx` | NEW | Step 2 — AI-generated details with course length picker |
| `src/components/authoring/ai/StepLearningObjectives.tsx` | NEW | Step 3 — Draggable objectives editor |
| `src/components/authoring/ai/StepOutlineEditor.tsx` | REWRITE from OutlineEditor.tsx | Step 4 — Split-panel with lesson descriptions |
| `src/components/authoring/ai/StepContentOptions.tsx` | NEW | Step 5 — Content format, AI images, assessment density |
| `src/components/authoring/ai/StepGeneration.tsx` | ENHANCE from GenerationProgress.tsx | Step 6 — Auto-start, time estimate |
| `src/app/api/ai/generate-course-details/route.ts` | NEW | API to generate topic/tone/audience/goals from description |
| `src/lib/ai/prompts.ts` | EDIT | Add COURSE_DETAILS prompt |
| `src/types/authoring.ts` | EDIT | Add CourseDetails type, update CourseOutline with descriptions/topics |

**New API Route — Generate Course Details:**
```
POST /api/ai/generate-course-details
Input: { description: string, language: 'ar'|'en', source_chunks?: string, industry?: string }
Output: {
  topic: string,
  tone: string,
  audience: string,
  goals: string,
  difficulty: 'beginner'|'intermediate'|'advanced',
  suggested_length: 'micro'|'short'|'standard'|'extended',
  learning_objectives: string[]
}
```

---

## 6. Task 2 — Course Player & Learner Experience

### 6.1 Business Requirement

Build a polished course player that matches or exceeds Rise's published course experience. This is what every learner sees — it must be flawless.

### 6.2 Player Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──── Progress Bar (e.g., 35% complete) ────────────────┐  │
│  └───────────════════════════─────────────────────────────┘  │
│                                                              │
│ ┌──────────────────┬─────────────────────────────────────┐   │
│ │ LESSONS          │                                     │   │
│ │                  │  ┌──────────────────────────────┐   │   │
│ │ Module 1         │  │     [Cover Image / Gradient]  │   │   │
│ │  ✓ Lesson 1      │  │                              │   │   │
│ │  ● Lesson 2   ◀  │  │     Course Title             │   │   │
│ │  ○ Lesson 3      │  │     Module 1 — Lesson 2      │   │   │
│ │                  │  │                              │   │   │
│ │ Module 2         │  └──────────────────────────────┘   │   │
│ │  🔒 Lesson 4     │                                     │   │
│ │  🔒 Lesson 5     │  ## Introduction                    │   │
│ │                  │  Lorem ipsum dolor sit amet...      │   │
│ │                  │                                     │   │
│ │                  │  ┌────────────────────────────┐     │   │
│ │                  │  │ [Accordion: Key Concepts]  │     │   │
│ │                  │  │  ▸ Concept 1               │     │   │
│ │                  │  │  ▸ Concept 2               │     │   │
│ │                  │  │  ▸ Concept 3               │     │   │
│ │                  │  └────────────────────────────┘     │   │
│ │                  │                                     │   │
│ │                  │  ┌────────────────────────────┐     │   │
│ │                  │  │ 🧠 Knowledge Check         │     │   │
│ │                  │  │ What is the primary goal?  │     │   │
│ │                  │  │ ○ Option A                 │     │   │
│ │                  │  │ ● Option B                 │     │   │
│ │                  │  │ ○ Option C                 │     │   │
│ │                  │  │      [Check Answer]        │     │   │
│ │                  │  └────────────────────────────┘     │   │
│ │                  │                                     │   │
│ │                  │  [← Previous]       [Next →]        │   │
│ └──────────────────┴─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Key Components

| Component | Description |
|-----------|-------------|
| **CoursePlayer** | Top-level wrapper — loads course content, manages navigation state |
| **PlayerSidebar** | Left panel — module/lesson tree with progress indicators (✓ done, ● current, ○ upcoming, 🔒 locked) |
| **PlayerHeader** | Top bar — progress bar, course title, close button |
| **LessonRenderer** | Main content area — renders blocks in sequence based on lesson.blocks |
| **BlockRenderer** | Unified component that renders any block type in read-only/interactive mode |
| **PlayerNavigation** | Bottom bar — Previous/Next lesson buttons |

### 6.4 Block Rendering Priority

All 27 block types need player renderers. Priority order:
1. **P0 (must-have for MVP):** text, image, cover, accordion, tabs, multiple_choice, true_false, divider, list, quote
2. **P1 (required for quality):** flashcard, process, timeline, video, multiple_response, fill_in_blank, matching
3. **P2 (nice-to-have):** scenario, hotspot, labeled_graphic, sorting, code, table, chart, gallery, audio, embed

---

## 7. Task 3 — Outline Builder Enhancements

### 7.1 Business Requirement

Upgrade the outline editor from single-column cards to a split-panel layout with lesson descriptions, topic lists, and export capabilities.

### 7.2 Key Changes

| Change | Current | New |
|--------|---------|-----|
| Layout | Single-column stacked cards | Split-panel (sidebar + detail view) |
| Lesson info | Title + duration only | Title + description (with char count) + topic bullet list + duration |
| AI editing | Not available | "Edit with AI" dropdown at outline and section level |
| Export | Not available at outline stage | PDF and Word export for team review |
| Add lesson | "Add Lesson" button per module | "+ Blank lesson" / "+ Add with AI" options |
| Learning outcomes | Read-only bullets | Moved to dedicated Step 3 (draggable, editable) |

### 7.3 Outline Export Format

**PDF Export** should include:
- Course title, description, metadata (language, difficulty, duration)
- Learning objectives (numbered)
- Module-lesson hierarchy with descriptions and topics
- Footer: "Generated by Jadarat LMS AI — [date]"

---

## 8. Task 4 — Theme Engine Expansion

### 8.1 Business Requirement

Enhance the theme editor with presets, responsive preview, cover image upload, and Arabic typography options.

### 8.2 Theme Presets (6 prebuilt themes)

| Theme | Primary | Secondary | Font | Style |
|-------|---------|-----------|------|-------|
| **Jadarat** (default) | #1a73e8 | #f59e0b | Cairo | Gradient cover |
| **Corporate** | #1e3a5f | #c0a36e | Inter | Solid cover |
| **Arabian** | #c0956b | #2d4a3e | Tajawal | Image cover with geometric pattern |
| **Modern** | #6366f1 | #ec4899 | Inter | Gradient cover |
| **Minimal** | #18181b | #71717a | System | Solid cover |
| **Ocean** | #0891b2 | #06b6d4 | Cairo | Gradient cover |

### 8.3 New Theme Features

| Feature | Description |
|---------|-------------|
| Theme preset selector | Grid of 6 preset cards with color previews |
| Cover page image upload | Drag-and-drop image upload for cover background |
| Responsive preview | Desktop/tablet/mobile viewport toggle buttons |
| Navigation style | Sidebar (default), top bar, or hidden |
| Lesson header style | Full-width banner, compact header, or no header |
| Dark mode toggle | Switch between light and dark theme variants |

---

## 9. Task 5 — Block Editor Polish & New Block Types

### 9.1 Business Requirement

Polish existing block editors and add key missing block types.

### 9.2 Priority Polish Items

| Block | Issue | Fix |
|-------|-------|-----|
| TextBlock | Basic textarea | Integrate Tiptap rich text editor with toolbar |
| ImageBlock | URL input only | Add drag-and-drop upload + Bunny Storage |
| CoverBlock | Static fields | Add image upload, overlay opacity slider, text positioning |
| AccordionBlock | Basic expand/collapse | Add smooth animations, icon support |

### 9.3 Potential New Block Types (Future)

| Block | Description | Priority |
|-------|-------------|----------|
| **Callout** | Info/warning/success/error callout boxes | P1 |
| **NumberedDivider** | Section break with step numbers | P2 |
| **ButtonStack** | CTA buttons for navigation/links | P2 |

---

## 10. Task 6 — Export & Review Workflow

### 10.1 Business Requirement

Expand export beyond SCORM to include PDF, Web link, and collaborative review.

### 10.2 Export Formats

| Format | Current | Target |
|--------|---------|--------|
| SCORM 1.2 | ✅ Implemented | Keep |
| SCORM 2004 | ✅ Implemented | Keep |
| xAPI | ❌ Missing | P1 |
| PDF (course outline) | ❌ Missing | P1 |
| PDF (full course) | ❌ Missing | P2 |
| Word (outline) | ❌ Missing | P1 |
| Web link (shareable) | ❌ Missing | P1 |

---

## 11. UI/UX Specifications (ASCII Wireframes)

### 11.1 Step Indicator Design

```
Current (3 steps):
  (1) Topic & Settings ─── (2) Review Outline ─── (3) Generate Content

New (6 steps):
  (1) Source ─── (2) Details ─── (3) Objectives ─── (4) Outline ─── (5) Options ─── (6) Generate
      ✓             ✓              ●                  ○              ○              ○

States:
  ✓ = completed (green check, primary/20 bg)
  ● = current (primary bg, white text)
  ○ = upcoming (muted bg, muted text)

Mobile: Only show current step name + progress dots
```

### 11.2 Course Length Cards

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    📄    │  │    📚    │  │    📖    │  │    🎓    │
│  Micro   │  │  Short   │  │ Standard │  │ Extended │
│          │  │          │  │          │  │          │
│ 1 lesson │  │ 2-4 les. │  │ 5-8 les. │  │  9+ les. │
│ < 10 min │  │  < 1 hr  │  │ 1-3 hrs  │  │  3+ hrs  │
│          │  │          │  │          │  │          │
│    ○     │  │    ●     │  │    ○     │  │    ○     │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

Selected state: primary border + primary/10 bg + primary text
Unselected: border-muted + white bg + muted text
```

### 11.3 "Edit with AI" Dropdown Menu

```
┌─────────────────────────────┐
│ ✨ Edit with AI             │
├─────────────────────────────┤
│ 📝 Rewrite this section     │
│ 🔄 Change tone              │
│ 📋 Make more specific       │
│ 🌐 Translate to Arabic/EN   │
│ ➕ Add more detail           │
│ ➖ Make more concise         │
└─────────────────────────────┘
```

### 11.4 Full Wizard Flow (Mobile Responsive)

```
Mobile (< 768px):
- Step indicator collapses to: "Step 2 of 6 — Course Details"
- Course length cards stack to 2x2 grid
- Split-panel outline becomes single column (sidebar as drawer)
- Bottom action buttons stack vertically

Tablet (768px - 1024px):
- Step indicator shows abbreviated labels
- Course length cards show in 4-column row
- Split-panel outline uses 40/60 split

Desktop (> 1024px):
- Full step indicator with labels
- Course length cards with hover effects
- Split-panel outline uses 30/70 split
```

---

## 12. Implementation Priority Matrix

### Phase 1 — AI Wizard Redesign (Critical Path)

| # | Component | Files | Effort | Dependencies |
|---|-----------|-------|--------|--------------|
| 1.1 | Step 1: Source Material | `StepSourceMaterial.tsx` | 2 days | None |
| 1.2 | API: Generate Course Details | `generate-course-details/route.ts`, `prompts.ts` | 1 day | None |
| 1.3 | Step 2: Course Details + Length Picker | `StepCourseDetails.tsx` | 2 days | 1.2 |
| 1.4 | Step 3: Learning Objectives Editor | `StepLearningObjectives.tsx` | 1 day | None |
| 1.5 | Step 4: Split-Panel Outline | `StepOutlineEditor.tsx` | 3 days | None |
| 1.6 | Step 5: Content Options | `StepContentOptions.tsx` | 1 day | None |
| 1.7 | Step 6: Enhanced Generation | `StepGeneration.tsx` | 1 day | None |
| 1.8 | Wizard Shell (6-step orchestration) | `AICourseWizard.tsx` rewrite | 1 day | 1.1-1.7 |

### Phase 2 — Course Player (Critical Path)

| # | Component | Files | Effort | Dependencies |
|---|-----------|-------|--------|--------------|
| 2.1 | Player layout + sidebar | `CoursePlayer.tsx`, `PlayerSidebar.tsx` | 2 days | None |
| 2.2 | P0 block renderers (10 types) | `player/blocks/*.tsx` | 3 days | 2.1 |
| 2.3 | Navigation + progress tracking | `PlayerNavigation.tsx`, `PlayerHeader.tsx` | 1 day | 2.1 |
| 2.4 | Assessment interaction + scoring | `player/AssessmentHandler.tsx` | 2 days | 2.2 |

### Phase 3 — Polish & Enhancement

| # | Component | Files | Effort | Dependencies |
|---|-----------|-------|--------|--------------|
| 3.1 | Theme presets | `ThemeEditor.tsx` enhancement | 1 day | None |
| 3.2 | Outline PDF/Word export | `OutlineExport.tsx` | 2 days | None |
| 3.3 | "Edit with AI" at outline level | `OutlineAIDropdown.tsx` | 1 day | Phase 1 |
| 3.4 | Responsive preview in theme editor | `ThemeEditor.tsx` enhancement | 1 day | None |
| 3.5 | P1 block renderers (7 types) | `player/blocks/*.tsx` | 2 days | Phase 2 |

---

## Appendix A — Current File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/authoring/ai/AICourseWizard.tsx` | 362 | Main wizard component (3-step) |
| `src/components/authoring/ai/OutlineEditor.tsx` | 327 | Outline review & editing |
| `src/components/authoring/ai/GenerationProgress.tsx` | 419 | Content generation progress |
| `src/components/authoring/ai/InlineAIToolbar.tsx` | 180 | Block-level AI refinement |
| `src/components/authoring/ai/DocumentUploader.tsx` | ~150 | PDF/DOCX/PPTX upload |
| `src/components/authoring/ai/AIImageGenerator.tsx` | ~100 | DALL-E 3 image generation |
| `src/components/authoring/ThemeEditor.tsx` | 409 | Theme customization |
| `src/components/authoring/EditorCanvas.tsx` | ~200 | Drag-and-drop block editor |
| `src/components/authoring/ExportDialog.tsx` | 179 | SCORM export |
| `src/stores/editor.store.ts` | 772 | Zustand state management |
| `src/types/authoring.ts` | 648 | All type definitions |
| `src/lib/ai/prompts.ts` | ~200 | AI prompt templates |
| `src/app/api/ai/generate-outline/route.ts` | 133 | Outline API |
| `src/app/api/ai/generate-lesson/route.ts` | ~150 | Lesson API (streaming) |
| `src/app/api/ai/generate-quiz/route.ts` | ~120 | Quiz API |
| `src/app/api/ai/refine-block/route.ts` | ~100 | Block refinement API |

## Appendix B — Technology Stack Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| State Management | Zustand |
| UI Components | shadcn/ui + Tailwind CSS |
| AI SDK | Vercel AI SDK (`ai` package) |
| AI Models | Claude Sonnet 4.5 (Anthropic), DALL-E 3 (OpenAI) |
| Database | Supabase (Postgres + Auth) |
| Video | Bunny Stream (HLS, captions, chapters) |
| Storage | Bunny CDN + Supabase Storage |
| SCORM | scorm-again, JSZip, fast-xml-parser |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Rich Text | Tiptap (ProseMirror) |
| PDF Parsing | pdfjs-dist |
| DOCX Parsing | mammoth |
| Charts | Recharts |
