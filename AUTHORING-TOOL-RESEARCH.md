# Jadarat LMS - Authoring Tool Deep Research Report

> **Date**: February 26, 2026
> **Purpose**: Deep research on Rise 360, Coassemble, AI-powered course generation, and Bunny.net CDN/Storage to inform the design of Jadarat LMS's native authoring tool.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Articulate Rise 360 Analysis](#2-articulate-rise-360-analysis)
3. [Coassemble Analysis](#3-coassemble-analysis)
4. [AI-Powered Course Generation (Industry)](#4-ai-powered-course-generation-industry)
5. [Document-to-Course Conversion](#5-document-to-course-conversion)
6. [SCORM Packaging & Standards](#6-scorm-packaging--standards)
7. [Bunny.net -- Video Streaming CDN & SCORM Storage](#7-bunnynet----video-streaming-cdn--scorm-storage)
8. [Current Codebase State](#8-current-codebase-state)
9. [Recommended Architecture for Jadarat Authoring Tool](#9-recommended-architecture-for-jadarat-authoring-tool)
10. [Competitive Differentiators](#10-competitive-differentiators)

---

## 1. Executive Summary

### The Four Course Creation Modes

The Jadarat LMS authoring tool will support four distinct course creation workflows:

| Mode | Description | Key Technology |
|------|-------------|---------------|
| **From Scratch** | Block-based drag-and-drop editor with 25+ block types | Custom editor (Next.js + Supabase) |
| **AI Generated** | AI creates full course from topic/prompt | Claude/GPT-4o + RAG pipeline |
| **Document to Course** | AI converts PDF/DOCX/PPTX to interactive course | Document parsing + AI structuring |
| **SCORM Upload** | Upload existing SCORM 1.2/2004 packages | ZIP extraction + manifest parsing |

### Key Findings

1. **Articulate Rise 360** is the gold standard for block-based authoring with 20+ block types, AI Assistant (9x faster creation), and comprehensive SCORM/xAPI export. However, it does NOT natively convert documents to courses -- AI can only reference uploaded documents as source material.

2. **Coassemble** offers a headless API-first approach (already integrated in our codebase), with 30+ screen types, AI course generation, document transformation (PDF/PPTX/DOCX), and SCORM export. Our integration is functional but uses deprecated API endpoints.

3. **AI Course Generation** across the industry follows a consistent pattern: Input → AI Outline → Human Review → AI Full Content → Edit → Publish. Multi-model approaches (different LLMs for different tasks) are emerging as best practice.

4. **Arabic-first authoring** is a massive untapped opportunity -- no major tool is built Arabic-first with proper RTL, dialect awareness, and cultural adaptation.

5. **Bunny.net** will serve as our infrastructure backbone -- Bunny Stream for video hosting/delivery (HLS adaptive bitrate, DRM, captions, analytics) and Bunny Edge Storage + Pull Zone for serving SCORM packages globally with 25ms average latency and PoPs in Dubai, Riyadh, Bahrain, and Cairo.

---

## 2. Articulate Rise 360 Analysis

### 2.1 Course Hierarchy

```
Course
  └── Sections (optional grouping headers)
        └── Lessons (content pages) / Quiz Lessons (assessments)
              └── Blocks (stackable content components)
```

- Sections are optional organizational headers for grouping lessons
- Block Lessons contain stacked blocks
- Quiz Lessons are dedicated assessment pages
- No limit on number of lessons per course

### 2.2 Complete Block Types (20+)

#### Text Blocks
| Block | Description |
|-------|-------------|
| **Text (Paragraph)** | Multiple style variations |
| **Statement** | Callout-style emphasis |
| **Quote** | Attributed quotes |
| **List** | Numbered or bulleted |

#### Media Blocks
| Block | Description |
|-------|-------------|
| **Image** | Single image, various layouts |
| **Gallery** | Multiple images in gallery layout |
| **Audio** | Embedded player with transcript |
| **Video** | Embedded player with captions |
| **Embed** | 400+ providers via Embedly (YouTube, Vimeo, etc.) |
| **Attachment** | Downloadable files (PDF, etc.) |
| **Code Snippet** | Code display |

#### Interactive Blocks
| Block | Description |
|-------|-------------|
| **Accordion** | Expandable/collapsible sections |
| **Tabs** | Tabbed content panels |
| **Labeled Graphic** | Image with interactive markers/hotspots |
| **Process** | Linear carousel of steps |
| **Timeline** | Chronological interactive events |
| **Scenario** | Branching dialogue with characters |
| **Sorting Activity** | Drag-and-drop categorization |
| **Flashcard** | Grid or Stack flip-card interactions |
| **Button/Button Stack** | Navigation links |

#### Knowledge Check Blocks (Ungraded)
| Block | Description |
|-------|-------------|
| **Multiple Choice** | Single correct answer |
| **Multiple Response** | Multiple correct answers |
| **Fill-in-the-Blank** | Text recall |
| **Matching** | Drag-and-drop pairing |

#### Data Visualization
| Block | Description |
|-------|-------------|
| **Bar Chart** | Data visualization |
| **Line Chart** | Data visualization |
| **Pie Chart** | Data visualization |

#### Layout/Navigation
| Block | Description |
|-------|-------------|
| **Divider / Numbered Divider** | Visual separators |
| **Spacer** | Whitespace control |
| **Continue Block** | Gates content progression |

#### Special Blocks (2025)
| Block | Description |
|-------|-------------|
| **Custom Block** | Blank canvas for unique layouts |
| **Code Block** | Embed custom HTML/CSS/JS directly |
| **Storyline Block** | Embed Storyline 360 projects as iFrames |
| **Math Equation Editor** | Built-in equation editor |

### 2.3 AI Assistant Features

The AI Assistant is a proprietary add-on enabling **9x faster** course creation:

**Course Generation:**
- Full Course Draft Generation -- describe course, configure audience/tone/goals, AI generates complete course with lessons, interactive blocks, and knowledge checks
- Course Outline Generation -- AI creates title, description, lesson titles
- Course Summary Generation -- paragraph overview with bulleted talking points

**Block-Level AI:**
- Block Generation from source documents or prompts
- Magic Text Import -- copy-paste formatted text → AI converts into accordion/tabs/process blocks
- Block Conversion -- swap one block type for another via AI
- Knowledge Check Generation -- AI generates quiz blocks from lesson content
- Quiz Generation -- 3-25 scored questions from course content
- Lesson Summary Generation

**Writing & Editing:**
- Inline Write and Edit -- adjust tone, length, format, grammar, readability

**Media AI:**
- AI Image Generation -- 13+ prebuilt styles
- AI Text-to-Speech -- thousands of ultra-realistic voices
- AI Script Writing -- drafts/refines narration scripts
- AI Sound Effects -- generate sound effects inline
- AI-Generated Captions -- auto-generate and sync video captions
- AI-Generated Alt Text -- instant alt text for images

### 2.4 Document Handling

**Rise does NOT natively convert documents to courses.** However:
- Supported source documents for AI: PDF, Word (.docx), PowerPoint (.pptx), audio, video, SRT files, URLs
- AI only references extractable text -- images/media within documents are not processed
- Magic Text Import converts pasted formatted text into interactive blocks preserving original wording

### 2.5 Themes & Branding

- 3 prebuilt themes (Rise, Apex, Horizon) with 8 cover page layouts each
- Customizable: colors, fonts (custom upload), logo, block-level styling
- Buttons auto-adjust text color to maintain 4.5:1 contrast ratio (WCAG)

### 2.6 Quiz/Assessment System

**Two assessment types:**
1. **Knowledge Check Blocks** (ungraded) -- embedded inline, no LMS scoring
2. **Quiz Lessons** (graded) -- scored, reportable to LMS

**Question types:** Multiple Choice, Multiple Response, Fill-in-the-Blank, Matching
**Configuration:** Passing score (default 80%), timer, shuffle, randomization, reveal answers
**LMS Tracking:** By completion %, quiz result, or Storyline block

### 2.7 Publishing/Export

| Standard | Support |
|----------|---------|
| SCORM 1.2 | Full |
| SCORM 2004 (4th Ed) | Full |
| AICC | Full |
| xAPI (Tin Can) | Full |
| cmi5 | Full |
| Web (HTML5) | Full |
| PDF | Full |
| Quick Share (link) | Full |

Output is pure HTML5 + CSS + JavaScript, responsive, WCAG 2.1 AA compliant.

### 2.8 Collaboration

- Multiple authors can edit different lessons simultaneously (real-time sync)
- Roles: Course Collaborator (edit), Course Manager (edit + settings + publish)
- Review 360 integration for stakeholder comments and version control
- Reduces review cycles by ~50%

### 2.9 Localization

- Manual XLIFF 1.2 export/import for translation
- Articulate Localization add-on: AI-powered translation into 80+ languages including RTL/Arabic

---

## 3. Coassemble Analysis

### 3.1 Course Hierarchy

```
Course (top-level container with metadata, theme, settings)
  └── Module (major section -- Lesson type or Quiz type)
        └── Screen (atomic building block -- 30+ types)
              └── Elements (content items within a screen)
```

### 3.2 Complete Screen/Block Types (30+)

#### Standard Screens
| Screen | Description |
|--------|-------------|
| **Text** | Standard text with optional image |
| **Text with Image** | Text paired with imagery |
| **Image+** | Image-focused with optional text |
| **Video** | Video content (Loom integration, embedded) |
| **Pop Quiz** | Inline quiz within lesson flow |
| **Cover** | Section breaks, introductions, finish screens |
| **Embed** | External content (surveys, podcasts, forms, maps) |
| **Slideshow** | Sequential image/content slideshow |

#### Interactive / Presentation Screens
| Screen | Description |
|--------|-------------|
| **Hotspot** | Clickable hotspots on images |
| **Flashcards** | Flip cards for memorization |
| **Tabs** | Tabbed content sections |
| **Steps** | Step-by-step process in gallery format |
| **Springy List** | Animated expanding list items |
| **Accordion** | Expandable/collapsible sections |
| **Timeline** | Chronological display |
| **Wheel** | Interactive spinning wheel |
| **Word Circle** | Circular word display |
| **Acronym** | Interactive acronym breakdown |
| **Icon Hover** | Icons revealing content on hover |
| **Image Click** | Clickable images revealing info |

#### Challenge Screens
| Screen | Description |
|--------|-------------|
| **Label Image** | Drag labels to image positions |
| **Spot the Mistake** | Find errors in an image |
| **Correct Category** | Sort items into categories |
| **Match Category** | Match items to categories |
| **Match Sequence** | Arrange items in order |
| **Form Challenge** | Form-based activity |
| **Correct Image** | Select the correct image |
| **Dial Challenge** | Interactive dial activity |
| **Branching Scenario** | Decision-tree content |

#### Quiz Question Types
| Type | Description |
|------|-------------|
| **Multiple Choice** | Single correct answer |
| **True/False** | Binary selection |
| **Check Correct** | Check all that apply |
| **Dropdown Selector** | Select from dropdown |
| **Word Match** | Match words to definitions |
| **Match Sequence** | Arrange items in order |
| **Multiple Choice Image** | Image-based MCQ |
| **Drag and Drop** | Drag items to targets |

### 3.3 AI Features (5 Core Capabilities)

#### 1. AI Course Generator
- User types a text prompt describing what to teach
- Configurable: `prompt`, `audience`, `familiarity`, `tone`, `screenCount`
- AI generates complete course with modules, screens, content, quizzes, visuals
- Everything fully editable after generation

#### 2. AI Image Generation
- Creates contextually relevant images
- Unlimited, unique imagery on demand
- Inline within course builder

#### 3. AI Narration (Text-to-Speech)
- Multiple languages and accents
- Different AI voice options
- Per-screen generation, auto-aligned with visuals

#### 4. AI Translation
- Full course translation in a few clicks
- Multiple target languages
- Inline, no export/import needed

#### 5. AI Quiz Generation
- Auto-generates quizzes from existing course content
- Editable or ship as-is

**Impact:** 89% reduction in development time documented.

### 3.4 Document-to-Course Conversion

**Supported types:** PDF, PPTX, DOCX, SOPs

**Process:**
1. Upload document
2. AI scans and identifies key points
3. AI structures into modules/lessons
4. Interactive elements auto-added (quizzes, visuals)
5. Customization questions asked
6. Review & edit in drag-and-drop editor
7. Publish

SOC 2 compliant -- documents not shared with AI models.

### 3.5 API & Integration (Headless)

**Base URL:** `https://api.coassemble.com/api/v1/headless/`

**Key Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/courses` | List all courses |
| `GET` | `/courses/{id}` | Get course by ID |
| `POST` | `/course/url` | **Recommended**: Get signed URL for embed |
| `GET` | `/course/edit` | Get edit URL (deprecated) |
| `GET` | `/course/view` | Get view URL (deprecated) |
| `POST` | `/course/generate` | AI-generate a course |
| `POST` | `/course/{id}/publish` | Publish a course |
| `POST` | `/course/{id}/duplicate` | Duplicate a course |
| `DELETE` | `/course/{id}` | Soft-delete |
| `GET` | `/course/scorm/{id}` | Export as SCORM |

**AI Course Generation Endpoint:**
```bash
POST /api/v1/headless/course/generate
{
  "prompt": "Create a course about workplace safety",
  "identifier": "user123",
  "clientIdentifier": "client456",
  "audience": "Employees",
  "familiarity": "beginner",
  "tone": "professional",
  "screenCount": 8
}
```

**Signed URL (Recommended for Embedding):**
```bash
POST /api/v1/headless/course/url
{
  "action": "view",
  "id": "1234",
  "identifier": "user123",
  "options": {
    "flow": "generate",
    "back": "event",
    "color": "#007bff",
    "translations": true,
    "language": "en"
  }
}
```

**iframe postMessage Events:**
```javascript
window.addEventListener('message', (event) => {
  // event.data structure:
  // { type: "course"|"screen", event: "start"|"end"|"progress"|"complete",
  //   data: { id, progress, completed } }
  // Builder: { type: "back" }
});
```

### 3.6 Theme Structure (from codebase types)

```typescript
interface Theme {
  preset: string;
  font: string;
  colours: {
    standard: { primary, headings, background };
    cover: { primary, headings, background, pattern };
  };
}
```

### 3.7 SCORM Export

| Type | Description |
|------|-------------|
| **Dynamic SCORM** | Auto-updates when course changes (requires active Coassemble) |
| **Standalone SCORM** | Self-contained package (Enterprise plan) |

SCORM 1.2 and 2004 supported.

---

## 4. AI-Powered Course Generation (Industry)

### 4.1 Leading Tools Comparison

| Tool | AI Strength | Model Used | Key Feature |
|------|------------|------------|-------------|
| **Articulate Rise 360** | Best block-based AI drafts | OpenAI (custom) | 9x faster creation |
| **Coursebox AI** | Multi-model + citations | GPT-4o + Perplexity | Harvard-style citations |
| **Mindsmith** | First AI-native authoring | Undisclosed | Dynamic SCORM, WCAG 2.2 |
| **Docebo AI** | Enterprise RAG-powered | Proprietary RAG | AI Video Presenter, Virtual Coaching |
| **iSpring Suite AI** | PowerPoint integration | Undisclosed | PPT-to-SCORM |
| **Synthesia** | AI video generation | Proprietary | 230+ avatars, 140+ languages |
| **Sana Labs** | Collaborative AI authoring | Undisclosed + DeepL | Acquired by Workday |
| **Easygenerator** | Doc-to-course + image extraction | Undisclosed | 75 languages, SCORM import |
| **Coassemble** | API-first headless | Undisclosed | Embeddable via API |
| **SC Training** | Microlearning templates | Undisclosed | 50+ gamified templates |

### 4.2 Standard AI Course Generation Workflow

```
Step 1: INPUT
  ├── User provides: topic/prompt OR source document (PDF/DOCX/PPTX/URL/video)
  └── User configures: audience, tone, learning objectives, difficulty level

Step 2: AI GENERATES OUTLINE
  ├── Course structure: modules → lessons → sections
  ├── Learning objectives per lesson
  └── Proposed interactive elements and assessment points

Step 3: USER REVIEWS & REFINES OUTLINE
  ├── Human-in-the-loop checkpoint
  ├── Reorder, add, remove, rename sections
  └── Adjust scope and depth

Step 4: AI GENERATES FULL CONTENT
  ├── Text content for each section
  ├── Interactive elements (accordions, tabs, flashcards)
  ├── Knowledge check questions with answers/distractors
  └── Image suggestions or AI-generated images

Step 5: USER EDITS & CUSTOMIZES
  ├── Drag-and-drop block editor
  ├── Direct text editing
  ├── Media replacement/addition
  └── Brand customization

Step 6: PUBLISH & EXPORT
  └── SCORM 1.2 / SCORM 2004 / xAPI / Native LMS
```

### 4.3 Recommended Multi-Model AI Strategy

| Task | Recommended Model | Rationale |
|------|------------------|-----------|
| **Content generation & structuring** | Claude Sonnet/Opus | Clear, structured writing; 200K context for full docs |
| **Creative scenarios** | GPT-4o | Strong creative writing |
| **Referenced/factual content** | Perplexity API | Built-in search + citations |
| **Budget generation** | Gemini 2.5 Flash / DeepSeek | 20x cheaper |
| **Image generation** | DALL-E 3 / Stable Diffusion | Text-to-image |
| **Translation** | DeepL API | Higher quality than LLM for many pairs |
| **Text-to-speech** | ElevenLabs / Azure TTS | Natural narration, 50+ languages |
| **Quiz generation** | Claude Sonnet + RAG | Grounded in source content |

### 4.4 Quality Controls for AI-Generated Content

1. **RAG grounding** in source documents to reduce hallucination
2. **Human-in-the-loop checkpoints** at outline and content stages
3. **Bloom's Taxonomy alignment** for assessments
4. **Citation requirements** -- AI must reference source sections
5. **Over-generation + curation** -- generate 2-3x more quiz questions than needed
6. **Varied interactivity enforcement** -- max 2-3 consecutive text blocks
7. **Confidence scoring** -- flag low-confidence content for review

### 4.5 Pedagogical Best Practices

**Good AI courses:**
- Content grounded in source documents (RAG)
- Clear learning objectives mapped to assessments
- Varied block types (not walls of text)
- Progressive disclosure through interactive elements
- Knowledge checks interspersed throughout
- Microlearning chunks (3-5 min per lesson)
- Culturally appropriate examples

**Bad AI courses:**
- Generic "textbook" content with no interactivity
- Hallucinated facts
- Monotonous text-only structure
- Assessments misaligned with objectives
- No human review before publishing

---

## 5. Document-to-Course Conversion

### 5.1 Technical Pipeline

```
STAGE 1: DOCUMENT INGESTION
  ├── Accept: PDF, DOCX, PPTX, TXT, ODP, ODT
  ├── PDF: OCR for scanned documents (Tesseract/Reducto)
  ├── PPTX: Extract slide text, speaker notes, images
  └── DOCX: Parse structured text with headings, lists, images

STAGE 2: TEXT EXTRACTION & STRUCTURE DETECTION
  ├── Layout-aware models detect headers, paragraphs, tables, figures
  ├── Semantic chunking by headings and topic shifts
  ├── Image extraction with position data
  └── Table structure recognition

STAGE 3: AI STRUCTURING
  ├── LLM proposes course structure from extracted content
  ├── Maps document headings → modules/lessons
  ├── Identifies key concepts per section
  └── Generates learning objectives from content

STAGE 4: CONTENT TRANSFORMATION
  ├── Converts prose to learning-appropriate format
  ├── Lists → accordions, tables → tabs
  ├── Auto-generates quiz questions from key content
  └── Places extracted images in relevant positions

STAGE 5: COURSE ASSEMBLY
  ├── Arranges blocks pedagogically
  ├── Adds navigation and progress tracking
  ├── Applies branding/template
  └── Packages for delivery
```

### 5.2 Document Processing Tools

| Tool | Approach | Strengths |
|------|----------|-----------|
| **Reducto** | Multi-pass OCR + vision language models | Layout-aware, tables, figures |
| **Chunkr** | API for PDF/DOCX → structured JSON | Semantic tags, bounding boxes |
| **IBM Docling** | Pipeline: parsing → layout → OCR → tables | Comprehensive pipeline |
| **pdfjs-dist** (in codebase) | PDF text extraction | Already integrated |
| **xlsx** (in codebase) | Excel/CSV parsing | Already integrated |

### 5.3 Content Chunking Strategies

1. **Document-based** -- split by headings/sections (best for structured docs)
2. **Semantic** -- group by meaning/topic similarity using embeddings
3. **Adaptive** -- ML models vary chunk size by content density
4. **Agentic** -- AI agent dynamically decides split strategy

**Recommended:** Document-based chunking + semantic chunking fallback.

### 5.4 Image Handling Pipeline

```
Source Document
  ├── Extract images with spatial position → associate with nearest text
  ├── AI generates alt text for each image
  └── If no document images:
       ├── LLM extracts keywords from text
       ├── Search Unsplash/Pexels API → present options
       └── Or generate via DALL-E/Stable Diffusion
```

### 5.5 Auto Quiz Generation from Content

1. **RAG Pipeline:** Ingest content into vector store → generate sub-topics → generate questions per topic
2. **Bloom's Taxonomy:** Generate questions at different cognitive levels
3. **Distractor Generation:** LLM generates plausible incorrect answers
4. **QA Validation:** Verify generated questions have answers in source text
5. **Over-generate 2-3x** and let humans curate

---

## 6. SCORM Packaging & Standards

### 6.1 SCORM Package Structure

**SCORM 1.2:**
```
package.zip
├── imsmanifest.xml              (REQUIRED at root)
├── adlcp_rootv1p2.xsd           (Schema files)
├── imscp_rootv1p1p2.xsd
├── imsmd_rootv1p2p1.xsd
├── ims_xml.xsd
├── index.html                    (Launch file / SCO entry point)
├── shared/scormfunctions.js      (SCORM API wrapper)
├── css/styles.css
├── js/scripts.js
└── images/media/                 (Assets)
```

**SCORM 2004 (additional):**
```
├── imscp_v1p1.xsd
├── adlcp_v1p3.xsd
├── adlseq_v1p3.xsd              (Sequencing)
├── adlnav_v1p3.xsd              (Navigation)
└── imsss_v1p0.xsd
```

### 6.2 imsmanifest.xml Key Elements

```xml
<manifest>
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>  <!-- Version detection -->
  </metadata>
  <organizations default="org_1">
    <organization identifier="org_1">
      <title>Course Title</title>
      <item identifier="item_1" identifierref="res_1">
        <title>Module 1</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="res_1" type="webcontent"
              adlcp:scormtype="sco" href="index.html">
      <file href="index.html" />
    </resource>
  </resources>
</manifest>
```

### 6.3 Version Detection

| Check | SCORM 1.2 | SCORM 2004 |
|-------|-----------|------------|
| `<schemaversion>` | `"1.2"` | `"2004 3rd/4th Edition"` |
| XML namespace | `imscp_rootv1p1p2` | `imscp_v1p1` |
| Resource attribute | `adlcp:scormtype` (lowercase t) | `adlcp:scormType` (uppercase T) |
| API object name | `API` | `API_1484_11` |

### 6.4 SCORM 1.2 vs 2004 Runtime API

| Aspect | SCORM 1.2 | SCORM 2004 |
|--------|-----------|------------|
| **API Object** | `window.API` | `window.API_1484_11` |
| **Init/End** | `LMSInitialize("")` / `LMSFinish("")` | `Initialize("")` / `Terminate("")` |
| **Get/Set** | `LMSGetValue()` / `LMSSetValue()` | `GetValue()` / `SetValue()` |
| **Commit** | `LMSCommit("")` | `Commit("")` |
| **Status** | Single `cmi.core.lesson_status` | Split: `cmi.completion_status` + `cmi.success_status` |
| **Score** | `cmi.core.score.raw` | `cmi.score.scaled` (-1 to 1) + `cmi.score.raw` |
| **Progress** | N/A | `cmi.progress_measure` (0 to 1) |
| **suspend_data** | 4,096 chars | 64,000 chars (3rd Ed+) |
| **Sequencing** | None | Full sequencing & navigation |

### 6.5 Key Data Model Elements

**SCORM 1.2:**
| Element | Type | Access |
|---------|------|--------|
| `cmi.core.student_id` | String | RO |
| `cmi.core.student_name` | String | RO |
| `cmi.core.lesson_status` | passed/completed/failed/incomplete/browsed/not attempted | RW |
| `cmi.core.score.raw` | Decimal | RW |
| `cmi.core.lesson_location` | String(255) | RW |
| `cmi.suspend_data` | String(4096) | RW |
| `cmi.core.session_time` | HHHH:MM:SS.SS | WO |
| `cmi.core.exit` | time-out/suspend/logout | WO |

**SCORM 2004:**
| Element | Type | Access |
|---------|------|--------|
| `cmi.learner_id` | String(4000) | RO |
| `cmi.learner_name` | String(250) | RO |
| `cmi.completion_status` | completed/incomplete/not attempted/unknown | RW |
| `cmi.success_status` | passed/failed/unknown | RW |
| `cmi.score.scaled` | Real(-1 to 1) | RW |
| `cmi.score.raw` | Real | RW |
| `cmi.progress_measure` | Real(0 to 1) | RW |
| `cmi.location` | String(1000) | RW |
| `cmi.suspend_data` | String(64000) | RW |
| `cmi.session_time` | ISO 8601 (PT1H30M) | WO |
| `cmi.exit` | time-out/suspend/logout/normal | WO |

### 6.6 SCORM Upload Handling (Security)

**Validation Checklist:**
1. Valid ZIP archive
2. `imsmanifest.xml` at root
3. Well-formed XML
4. `<metadata>` contains `<schema>` and `<schemaversion>`
5. At least one `<organization>` exists
6. All `identifierref` point to valid resources
7. All `href` values point to files in ZIP
8. Resources have valid `scormType` value

**Security Concerns:**
- **XSS:** Serve SCORM from sandboxed iframe on separate subdomain
- **SQL Injection:** Sanitize all SCORM data before DB storage
- **Zip Bombs:** Check extracted size limits
- **Path Traversal:** Validate file paths during extraction (no `../`)
- **CSP Headers:** Restrict external network calls from SCORM content

### 6.7 Recommended JS/TS Library Stack

| Need | Library | Purpose |
|------|---------|---------|
| **LMS Runtime API** | `scorm-again` (already in codebase) | API that SCORM content talks to |
| **Content API Wrapper** | `pipwerks-scorm-api-wrapper` (already in codebase) | Include in generated SCORM packages |
| **ZIP Creation** | `jszip` (already in codebase) | Create SCORM ZIP packages |
| **ZIP Extraction** | `jszip` | Extract uploaded packages |
| **XML Parsing** | `fast-xml-parser` or `xml2js` | Parse imsmanifest.xml |
| **Manifest Generation** | Template strings or `xmlbuilder2` | Generate manifest for export |

### 6.8 Other Standards

| Standard | Priority | Notes |
|----------|----------|-------|
| **SCORM 1.2** | Must have | Widest adoption (82%+ LMSs) |
| **SCORM 2004** | Must have | Sequencing support |
| **xAPI (Tin Can)** | Should have | Modern analytics, off-LMS tracking |
| **cmi5** | Should have | SCORM simplicity + xAPI flexibility |
| **AICC** | Nice to have | Legacy only |

---

## 7. Bunny.net -- Video Streaming CDN & SCORM Storage

### 7.1 Why Bunny.net

Bunny.net will serve as the infrastructure backbone for two critical functions:
- **Bunny Stream** -- Video hosting, transcoding, adaptive bitrate streaming, and DRM for course video content
- **Bunny Edge Storage + Pull Zone** -- CDN-backed global storage for serving extracted SCORM packages with low latency

**MENA Region Coverage:** Bunny has 6 confirmed PoPs in the Middle East (Dubai, Fujairah, Riyadh, Bahrain, Cairo, Tel Aviv) plus African PoPs, ensuring 10-30ms latency for Gulf region users.

### 7.2 Bunny Stream (Video Delivery)

#### How It Works
1. **Upload** -- Video file via API, dashboard, or TUS resumable upload
2. **Transcode** -- Auto-encoded into multiple resolutions (240p-4K) and codecs (H.264, VP9, HEVC). Transcoding is **FREE**
3. **Store** -- Replicated across up to 8 regions worldwide
4. **Deliver** -- HLS adaptive bitrate streaming via 119+ PoPs, 150 Tbps+ capacity, 25ms global average latency

#### Supported Upload Formats
- MP4, MOV, and standard containers
- Progressive (not interlaced), max 60fps
- Multi-audio track support
- Recommend highest quality input for best encodes

#### Adaptive Bitrate Streaming (HLS)
- Videos split into small segments
- Player auto-switches resolution based on connection quality
- Configurable resolutions: 360p, 480p, 720p, 1080p, 1440p, 4K
- MP4 fallback (up to 720p) for legacy devices
- HLS playlist URL: `https://vz-{hash}.b-cdn.net/{videoId}/playlist.m3u8`

#### Pricing

| Component | Cost |
|-----------|------|
| Storage | $0.01/GB per replication region |
| CDN Traffic (EU/NA) | $0.01/GB |
| CDN Traffic (Middle East/Africa) | $0.06/GB |
| Volume Network | $0.005/GB (first 500TB) |
| Transcoding | **FREE** |
| Enterprise DRM | From $99/month + $0.005/license |

#### Video API

**Base URL:** `https://video.bunnycdn.com`
**Authentication:** `AccessKey` header with Stream Library API key

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create Video | POST | `/library/{libraryId}/videos` |
| Upload Binary | PUT | `/library/{libraryId}/videos/{videoId}` |
| Fetch from URL | POST | `/library/{libraryId}/videos/fetch` |
| Get Video | GET | `/library/{libraryId}/videos/{videoId}` |
| List Videos | GET | `/library/{libraryId}/videos` |
| Delete Video | DELETE | `/library/{libraryId}/videos/{videoId}` |
| Get Heatmap | GET | `/library/{libraryId}/videos/{videoId}/heatmap` |
| Get Statistics | GET | `/library/{libraryId}/statistics` |
| Add Caption | POST | `/library/{libraryId}/videos/{videoId}/captions/{srclang}` |
| Export SCORM | GET | `/library/{libraryId}/videos/{videoId}/repackage` |

**Two-Step Upload:**
```typescript
// Step 1: Create video object
const video = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
  method: 'POST',
  headers: { 'AccessKey': STREAM_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'My Course Video' }),
}).then(r => r.json());

// Step 2: Upload binary
await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${video.guid}`, {
  method: 'PUT',
  headers: { 'AccessKey': STREAM_API_KEY, 'Content-Type': 'application/octet-stream' },
  body: videoFileBuffer,
});
```

**TUS Resumable Upload (for large files / client-side):**
```typescript
import * as tus from 'tus-js-client';

const expirationTime = Math.floor(Date.now() / 1000) + 86400;
const signature = crypto.createHash('sha256')
  .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
  .digest('hex');

const upload = new tus.Upload(file, {
  endpoint: 'https://video.bunnycdn.com/tusupload',
  headers: {
    AuthorizationSignature: signature,
    AuthorizationExpire: expirationTime,
    VideoId: videoId,
    LibraryId: libraryId,
  },
  metadata: { filetype: file.type, title: 'Course Video' },
  onProgress: (uploaded, total) => console.log(`${((uploaded / total) * 100).toFixed(2)}%`),
  onSuccess: () => console.log('Upload complete'),
});
upload.start();
```

#### Embed Options

**1. iframe Embed (recommended for LMS):**
```html
<iframe
  src="https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}"
  loading="lazy"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
/>
```

**2. Player.js for Programmatic Control (tracking watch time for LMS):**
```javascript
const player = new playerjs.Player(document.querySelector('iframe'));
player.on('ready', () => {
  player.play();
  player.on('timeupdate', (data) => updateLmsProgress(data.seconds));
  player.on('ended', () => markCourseComplete());
});
```

**3. React Component:**
```jsx
import { Player } from 'playstack';

<Player
  src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`}
  onTimeUpdate={(time) => trackProgress(time.current)}
  onEnded={() => markComplete()}
/>
```

#### DRM / Content Protection

| Level | Cost | Features |
|-------|------|----------|
| **MediaCage Basic** | FREE | Dynamic clear-key encryption, unique key per session, download prevention |
| **MediaCage Enterprise** | From $99/mo | FairPlay + Widevine, hardware-based key exchange, screen grab protection |

#### Player Features

| Feature | Details |
|---------|---------|
| Chapters | Configurable timestamps + labels (navigate long course videos) |
| Moments | Highlight key points on timeline |
| Captions | Multi-language, AI transcription in 50+ languages, customizable fonts/colors |
| Playback Speed | 0.5x to 4x |
| Resumable | Remembers where learner left off |
| Heatmap | Shows popular segments in transport bar |
| Thumbnails | Auto-generated preview thumbnails |
| Branding | Custom logo, colors |

#### Webhooks

| Status Code | Event |
|-------------|-------|
| 4 | `RESOLUTION_FINISHED` -- video is now playable |
| 5 | `FAILED` -- encoding failed |
| 9 | `CAPTIONS_GENERATED` -- AI captions ready |

Webhooks use HMAC SHA-256 signature verification.

### 7.3 Bunny Edge Storage (SCORM Package Hosting)

#### How It Works
- CDN-backed, globally **replicated** object storage (not just cached)
- Files replicated across up to 9 data center regions
- 99.99% global SLA with automatic region failover
- GeoDNS routing to nearest storage replica
- **Must** connect a Pull Zone to serve files publicly

#### Architecture

```
User Request → Bunny CDN Pull Zone (119+ PoPs, custom hostname)
                    │
                    ▼
              Bunny Edge Storage (replicated across regions)
              /scorm-packages/{packageId}/
                ├── imsmanifest.xml
                ├── content/index.html
                ├── content/scripts/api.js
                └── content/assets/...
```

#### Pricing

| Component | Cost |
|-----------|------|
| Storage | $0.01/GB/month per region |
| Additional regions | $0.005/GB/month |
| API Requests | **FREE** |
| CDN Bandwidth (EU/NA) | $0.01/GB |
| CDN Bandwidth (ME/Africa) | $0.06/GB |

#### Storage API

**Base URL:** `https://{region}.storage.bunnycdn.com`
**Authentication:** `AccessKey` header with Storage Zone Password

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Upload File | PUT | `/{storageZoneName}/{path}/{fileName}` |
| Download File | GET | `/{storageZoneName}/{path}/{fileName}` |
| Delete File | DELETE | `/{storageZoneName}/{path}/{fileName}` |
| List Directory | GET | `/{storageZoneName}/{path}/` |

**Directory auto-creation:** If the directory tree does not exist, it is created automatically on upload -- critical for preserving SCORM package directory structures.

**Upload SCORM Files:**
```typescript
export async function uploadScormFile(
  packageId: string,
  filePath: string,
  fileBuffer: Buffer
) {
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/scorm/${packageId}/${filePath}`;
  await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_STORAGE_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer,
  });
}
```

#### MIME Types
Bunny automatically determines Content-Type by file extension. All SCORM-critical types are handled:
`.html` → `text/html`, `.js` → `application/javascript`, `.css` → `text/css`, `.xml` → `application/xml`, `.json` → `application/json`, `.xsd` → `application/xml`

#### Security: Signed URLs & Token Authentication

**Path-based token authentication** -- sign an entire SCORM package directory with one token:
```typescript
export function generateSignedScormUrl(packageId: string, expirationSeconds = 3600) {
  const securityKey = process.env.BUNNY_PULL_ZONE_KEY!;
  const expires = Math.floor(Date.now() / 1000) + expirationSeconds;
  const hashableBase = `${securityKey}/scorm/${packageId}/${expires}`;
  const token = crypto.createHash('sha256')
    .update(hashableBase)
    .digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `https://scorm.jadarat.com/scorm/${packageId}/?token=${token}&expires=${expires}&token_path=/scorm/${packageId}/`;
}
```

Additional security: IP validation, country whitelisting, referrer restrictions, hotlink protection.

#### CORS Configuration (Critical for SCORM iframe Playback)

```typescript
// Enable CORS on Pull Zone for SCORM content
await fetch(`https://api.bunny.net/pullzone/${pullZoneId}`, {
  method: 'POST',
  headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    EnableAccessControlOriginHeader: true,
    AccessControlOriginHeaderExtensions: ['html', 'js', 'css', 'xml', 'json', 'xsd', 'woff', 'woff2', 'svg'],
  }),
});
```

### 7.4 SCORM Cross-Origin Communication Solution

SCORM content served from a CDN (different domain) cannot access the LMS's JavaScript API via `window.parent` due to Same-Origin Policy. Solutions:

**Solution A -- Custom Hostname (Recommended):**
Configure Bunny Pull Zone with a subdomain of the LMS domain:
- LMS: `app.jadarat.com`
- SCORM CDN: `scorm.jadarat.com` (Bunny Pull Zone custom hostname)

**Solution B -- Cross-Frame postMessage (Modern, using scorm-again):**
```typescript
// In LMS parent frame:
import { CrossFrameLMS } from 'scorm-again';
const lms = new CrossFrameLMS();

// In SCORM content iframe (served from CDN):
import { CrossFrameAPI } from 'scorm-again';
const api = new CrossFrameAPI();
// Uses window.postMessage under the hood -- works cross-origin
```

**Solution C -- Proxy Launcher:**
Serve a thin launcher HTML from LMS domain that creates the SCORM API, then loads CDN content in a nested iframe with postMessage bridging.

### 7.5 Bunny vs Supabase Storage for SCORM

| Factor | Bunny.net Storage | Supabase Storage (Current) |
|--------|-------------------|---------------------------|
| Architecture | True multi-region replication + CDN | Single origin + CDN cache |
| SCORM Serving | Excellent -- directory support, auto MIME, CDN | Works but single-origin, higher latency |
| MENA Latency | 10-30ms (Dubai/Riyadh/Bahrain PoPs) | Higher (single region origin) |
| Access Control | Token auth, signed URLs, hotlink protection | Postgres RLS, Supabase auth |
| Directory Support | Native auto-creation | Flat/path-based |
| CORS | Configurable per Pull Zone | Supabase settings |
| Cost at Scale | $0.01/GB storage + CDN bandwidth | Tied to Supabase plan limits |
| **Verdict** | **Use for production SCORM + video** | **Keep for images, docs, small assets** |

### 7.6 SDK & Integration

**Official TypeScript SDK:**
```bash
npm install bunny-sdk
```

```typescript
import { createBunnyApiClient } from 'bunny-sdk';

const client = createBunnyApiClient({
  accessKey: process.env.BUNNY_ACCESS_KEY!,
});
```

**API Keys (3 types):**
| Key Type | Used For |
|----------|---------|
| Account API Key | Managing pull zones, storage zones, DNS, billing |
| Storage Zone Password | Storage API (upload/download/delete files) |
| Stream Library API Key | Stream API (manage videos) |

**Upload Methods:**
| Method | Best For |
|--------|---------|
| HTTP PUT (Storage) | Server-side file uploads |
| HTTP PUT (Stream) | Server-side video uploads |
| TUS Protocol (Stream) | Client-side large video uploads |
| Pre-signed Upload (Stream) | Direct browser-to-Bunny uploads |

### 7.7 LMS Integration Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Next.js LMS App                          │
│                                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Video Block  │  │ SCORM Player │  │  Admin: Upload   │  │
│  │ (iframe/     │  │ (iframe +    │  │  Videos & SCORM  │  │
│  │  Player.js)  │  │  scorm-again │  │  (TUS + REST)    │  │
│  │  Track time  │  │  CrossFrame) │  │                  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼────────────────┼────────────────────┼────────────┘
          │                │                    │
          ▼                ▼                    ▼
   ┌──────────────┐ ┌───────────────────┐ ┌────────────────┐
   │ Bunny Stream │ │ Bunny Storage     │ │ Bunny APIs     │
   │              │ │ + Pull Zone       │ │                │
   │ Video CDN    │ │ scorm.jadarat.com │ │ REST + SDK     │
   │ iframe embed │ │ Signed URLs       │ │ bunny-sdk      │
   │ HLS/DRM      │ │ CORS enabled      │ │                │
   │ Captions     │ │ Token auth        │ │                │
   │ Chapters     │ │                   │ │                │
   └──────────────┘ └───────────────────┘ └────────────────┘
```

### 7.8 E-Learning Best Practices with Bunny.net

**Video Delivery:**
1. Use iframe embed with Player.js for LMS progress tracking
2. Enable chapters for long educational videos (learners navigate to specific topics)
3. Enable AI captions (50+ languages) for accessibility
4. Track watch time via `timeupdate` events for completion criteria
5. Enable resumable playback (learners continue from where they left off)
6. Use MediaCage Basic DRM (free) to prevent casual downloading
7. Use webhooks to detect processing completion before making videos available

**SCORM Storage:**
1. Upload extracted SCORM packages preserving directory structure
2. Use custom hostname (`scorm.jadarat.com`) on Pull Zone
3. Sign entire package directories with path-based tokens
4. Enable CORS for all SCORM file types
5. Use `scorm-again` CrossFrame API for cross-origin LMS communication
6. Enable Force SSL for secure contexts

---

## 8. Current Codebase State

### 8.1 Existing Course Creation Workflow

The codebase already has a functional course creation system supporting three flows:

```
LMS Admin → /dashboard/courses/add-course
  ├── ?flow=scorm     → SCORM upload flow
  ├── ?flow=ai        → AI builder (Coassemble iframe)
  └── ?flow=document  → Document builder (Coassemble iframe)
```

### 8.2 Coassemble Integration (Current)

**Server Action:** `src/action/coassemble/coassemble.ts`
- Calls `GET /api/v1/headless/course/edit` (deprecated endpoint)
- Returns Coassemble edit URL for iframe embedding
- Uses `process.env.COASSEMBLE` for auth

**Build Course Page:** `src/app/dashboard/@lms_admin/.../build-course/page.tsx`
- Embeds: `<iframe src="https://coassemble.com/embed/{url}" />`
- Listens for postMessage events
- Captures Coassemble course ID on publish
- Stores via `add_coassemble_id()` RPC

**Issues Found:**
1. Uses deprecated `GET /course/edit` and `GET /course/view` endpoints -- should migrate to `POST /course/url`
2. Client-side API key exposure: `process.env.NEXT_PUBLIC_COASSEMBLE` in `getCourses.ts`
3. Missing direct `POST /course/generate` API usage (AI generation done through iframe only)

### 8.3 SCORM System (Current)

**Upload:** `src/utils/uploadFile.ts`
- `uploadScormFile()` extracts ZIP, parses manifest, uploads to Supabase storage
- Validates manifest structure (finds `adlcp:scormtype === 'sco'` resources)
- Stores at: `scorm/{org_id}/scorm/{slug}/extract/{filepath}`

**Playback API Routes:**
- `GET /api/scorm/[slug]` -- extracts SCORM zip, parses manifest, returns launch info
- `GET /api/scorm/content/[...path]` -- serves extracted files with proper MIME types

**Runtime:** `src/lib/scorm-api.ts`
- Simple SCORM 1.2 API wrapper class
- `LMSInitialize`, `LMSFinish`, `LMSGetValue`, `LMSSetValue`, `LMSCommit`

**Player:** `src/app/dashboard/@learner/course/scorm-player/[slug]/Player.tsx`
- Iframe-based SCORM player
- postMessage communication
- Completion tracking and certificate generation

### 8.4 Database Schema (Courses)

```sql
CREATE TABLE public.courses (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category_id     INT REFERENCES categories(id),
  level           courselevel,        -- beginner|medium|advanced
  timeline        TEXT,               -- completion time in minutes
  thumbnail       TEXT,               -- image URL
  slug            TEXT UNIQUE,
  status          TEXT,
  coassemble_id   TEXT,               -- linked to Coassemble
  created_by      UUID REFERENCES users,
  organization_id INT REFERENCES organization,
  outcomes        JSONB,              -- [{id, text}]
  is_scorm        BOOLEAN DEFAULT false,
  scorm_version   TEXT,               -- 1.2|2004|aicc|cmi5|xapi
  scorm_url       TEXT,
  launch_path     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 8.5 Feature Flags

```sql
-- organization_settings table
create_courses     BOOLEAN DEFAULT true
ai_builder         BOOLEAN DEFAULT false
document_builder   BOOLEAN DEFAULT false
```

### 8.6 Form Validation (Zod)

```typescript
// Current course form validation:
- title: Required string
- description: Required, max 260 chars
- level: Required enum (beginner|medium|advanced)
- category_id: Required integer
- slug: Required, regex [a-zA-Z0-9-_]+
- timeline: Required integer (minutes)
- outcomes: Array of {id, text}
- image: File (JPEG|PNG|WebP)
- scormFile: Optional .zip, max 500MB
- scormVersion: Enum (1.2, 2004, AICC, xAPI)
```

---

## 9. Recommended Architecture for Jadarat Authoring Tool

### 9.1 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     CONTENT SOURCES                          │
│  Topic Prompt  |  PDF/DOCX/PPTX  |  From Scratch  |  SCORM  │
└───────┬────────────────┬──────────────────┬──────────┬───────┘
        │                │                  │          │
        ▼                ▼                  │          ▼
┌───────────────┐ ┌──────────────┐          │  ┌──────────────┐
│  AI PIPELINE  │ │  DOCUMENT    │          │  │ SCORM IMPORT │
│  - Claude API │ │  PROCESSING  │          │  │ - ZIP extract│
│  - Outline    │ │  - PDF parse │          │  │ - Manifest   │
│  - Content    │ │  - Text      │          │  │   parse      │
│  - Quizzes    │ │  - Images    │          │  │ - Validate   │
│  - Images     │ │  - Chunking  │          │  │ - Store      │
└───────┬───────┘ └──────┬───────┘          │  └──────────────┘
        │                │                  │
        ▼                ▼                  ▼
┌──────────────────────────────────────────────────────────────┐
│                  BLOCK-BASED EDITOR                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │  JSON Course Schema (Supabase JSONB)             │       │
│  │  Course → Modules → Lessons → Blocks             │       │
│  └──────────────────────────────────────────────────┘       │
│  ┌──────────────┐ ┌───────────┐ ┌─────────────────┐        │
│  │ Drag & Drop  │ │ Live      │ │ AI Inline Edit  │        │
│  │ Block Editor │ │ Preview   │ │ (Refine/Expand) │        │
│  └──────────────┘ └───────────┘ └─────────────────┘        │
│  ┌──────────────┐ ┌───────────┐ ┌─────────────────┐        │
│  │ RTL/LTR      │ │ Theme &   │ │ Block Templates │        │
│  │ Toggle       │ │ Branding  │ │ Library         │        │
│  └──────────────┘ └───────────┘ └─────────────────┘        │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────┼───────────────┼───────────────┐
        ▼               ▼               ▼               ▼
 ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
 │ NATIVE LMS   │ │ SCORM EXPORT │ │ BUNNY.NET    │ │  ANALYTICS   │
 │ DELIVERY     │ │ - SCORM 1.2  │ │ CDN/STORAGE  │ │  - Progress  │
 │ - Responsive │ │ - SCORM 2004 │ │              │ │  - Scores    │
 │ - Offline    │ │ - xAPI       │ │ Stream:      │ │  - Time      │
 │ - Mobile     │ │ - cmi5       │ │  Video HLS   │ │  - AI Insights│
 │              │ │              │ │  DRM/Captions│ │              │
 │              │ │              │ │ Storage:     │ │              │
 │              │ │              │ │  SCORM files │ │              │
 │              │ │              │ │  Pull Zone   │ │              │
 └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### 9.2 Recommended Block Types (25+)

Based on Rise 360 and Coassemble analysis, prioritized for Jadarat:

#### Phase 1 -- Core Blocks (MVP)
| Block | Type | Priority |
|-------|------|----------|
| `text` | Content | P0 |
| `image` | Content | P0 |
| `video` | Content | P0 |
| `accordion` | Interactive | P0 |
| `tabs` | Interactive | P0 |
| `multiple_choice` | Assessment | P0 |
| `true_false` | Assessment | P0 |
| `divider` | Layout | P0 |
| `cover` | Layout | P0 |

#### Phase 2 -- Interactive Blocks
| Block | Type | Priority |
|-------|------|----------|
| `flashcard` | Interactive | P1 |
| `labeled_graphic` | Interactive | P1 |
| `process` | Interactive | P1 |
| `timeline` | Interactive | P1 |
| `sorting` | Interactive | P1 |
| `multiple_response` | Assessment | P1 |
| `fill_in_blank` | Assessment | P1 |
| `matching` | Assessment | P1 |
| `audio` | Content | P1 |
| `embed` | Content | P1 |
| `quote` | Content | P1 |
| `list` | Content | P1 |

#### Phase 3 -- Advanced Blocks
| Block | Type | Priority |
|-------|------|----------|
| `scenario` | Interactive | P2 |
| `hotspot` | Interactive | P2 |
| `gallery` | Content | P2 |
| `chart` | Content | P2 |
| `table` | Content | P2 |
| `ordering` | Assessment | P2 |
| `open_ended` | Assessment | P2 |
| `file` | Content | P2 |
| `code` | Content | P2 |
| `button` | Navigation | P2 |

### 9.3 Recommended JSON Schema

```typescript
// Course data model for Supabase JSONB storage

interface CourseContent {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  thumbnail_url: string;
  default_language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  status: 'draft' | 'published' | 'archived';
  version: number;
  metadata: {
    duration_minutes: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    branding: {
      primary_color: string;
      secondary_color: string;
      font_family: string;
      logo_url: string;
    };
  };
  settings: {
    navigation: 'free' | 'sequential' | 'restricted';
    show_progress: boolean;
    passing_score: number;
    completion_criteria: 'all_lessons' | 'passing_score' | 'all_blocks';
    certificate_enabled: boolean;
  };
  modules: Module[];
}

interface LocalizedString {
  ar: string;
  en: string;
}

interface Module {
  id: string;
  title: LocalizedString;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: LocalizedString;
  type: 'content' | 'quiz';
  order: number;
  blocks: Block[];
  quiz_settings?: {
    randomize: boolean;
    show_feedback: boolean;
    passing_score: number;
    time_limit_minutes: number;
  };
}

interface Block {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  data: Record<string, any>; // Type-specific block data
  translations?: Record<string, Partial<Record<string, any>>>;
  ai_generated: boolean;
}

type BlockType =
  // Content
  | 'text' | 'image' | 'video' | 'audio' | 'gallery'
  | 'embed' | 'file' | 'quote' | 'list' | 'table' | 'chart' | 'code'
  // Interactive
  | 'accordion' | 'tabs' | 'flashcard' | 'labeled_graphic'
  | 'timeline' | 'process' | 'sorting' | 'scenario' | 'hotspot'
  // Assessment
  | 'multiple_choice' | 'multiple_response' | 'fill_in_blank'
  | 'matching' | 'ordering' | 'true_false' | 'open_ended'
  // Layout/Navigation
  | 'cover' | 'divider' | 'spacer' | 'continue' | 'button';
```

### 9.4 AI Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│              AI COURSE GENERATION                │
├─────────────────────────────────────────────────┤
│                                                  │
│  INPUT:                                          │
│  ├── Topic prompt + audience + tone + goals      │
│  └── OR source documents (PDF/DOCX/PPTX)        │
│                                                  │
│  STEP 1: Document Processing (if applicable)     │
│  ├── pdfjs-dist / mammoth / pptx-parser         │
│  ├── Text extraction + image extraction          │
│  └── Semantic chunking                           │
│                                                  │
│  STEP 2: Outline Generation                      │
│  ├── Claude Sonnet API call                      │
│  ├── System prompt: instructional design expert  │
│  ├── Input: topic + audience + source chunks     │
│  └── Output: JSON course outline                 │
│                                                  │
│  STEP 3: Human Review Checkpoint                 │
│  ├── Display outline in UI                       │
│  ├── Allow reorder, add, remove, edit            │
│  └── User confirms → proceed                    │
│                                                  │
│  STEP 4: Content Generation (per lesson)         │
│  ├── Claude Sonnet API call per lesson           │
│  ├── Generate block content as JSON              │
│  ├── Include varied block types                  │
│  ├── Generate quiz questions per lesson          │
│  └── Suggest images (keywords for search)        │
│                                                  │
│  STEP 5: Assembly                                │
│  ├── Combine all lesson blocks into course JSON  │
│  ├── Apply branding/theme                        │
│  └── Store in Supabase as JSONB                 │
│                                                  │
│  OUTPUT: Full course in block-based JSON format  │
└─────────────────────────────────────────────────┘
```

### 9.5 Database Changes Required

```sql
-- New table for authored course content
CREATE TABLE public.course_content (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id) ON DELETE CASCADE,
  content         JSONB NOT NULL,      -- Full course content JSON
  version         INT DEFAULT 1,
  status          TEXT DEFAULT 'draft', -- draft, published, archived
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  published_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id)
);

-- Block templates library
CREATE TABLE public.block_templates (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id INT REFERENCES organization(id),
  name            TEXT NOT NULL,
  description     TEXT,
  block_type      TEXT NOT NULL,
  template_data   JSONB NOT NULL,
  is_global       BOOLEAN DEFAULT false,  -- shared across orgs
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

-- AI generation history/audit
CREATE TABLE public.ai_generation_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id       INT REFERENCES courses(id),
  generation_type TEXT NOT NULL,  -- 'outline', 'content', 'quiz', 'image'
  input_prompt    TEXT,
  input_documents TEXT[],         -- source document URLs
  output_content  JSONB,
  model_used      TEXT,           -- 'claude-sonnet-4-6', 'gpt-4o', etc.
  tokens_used     INT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  created_by      UUID REFERENCES auth.users(id)
);

-- Update courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  authoring_type TEXT DEFAULT 'coassemble'; -- 'native', 'coassemble', 'scorm'
ALTER TABLE courses ADD COLUMN IF NOT EXISTS
  content_id UUID REFERENCES course_content(id);
```

---

## 10. Competitive Differentiators

### 10.1 Key Opportunities for Jadarat LMS

| Differentiator | Why It Matters | Competition Gap |
|---------------|----------------|-----------------|
| **Arabic-First AI Generation** | No major tool generates natively in Arabic with proper RTL, dialects, and cultural adaptation | All tools treat Arabic as translation afterthought |
| **Integrated Authoring + LMS** | No SCORM export/import friction; native delivery with rich analytics | Most tools are either authoring-only OR LMS-only |
| **Pedagogical Intelligence** | AI enforces Bloom's taxonomy, varied interactivity, learning objectives alignment | Most tools optimize for speed, not learning outcomes |
| **Source Document RAG** | Same documents serve as course AND queryable knowledge base | Only JoySuite does this |
| **MENA Compliance** | Saudization tracking, PDPL, Arabic NLP | Zero competition in this space |
| **Combined AI + Manual** | AI generates draft, human refines in same editor | Many tools have separate AI and manual flows |

### 10.2 Market Opportunity

- **Global AI in education market:** $32-41 billion by 2030 (31-43% CAGR)
- **eLearning content software:** $815M in 2026 → $1.46B by 2035
- **Arabic eLearning market:** Underserved, no Arabic-first AI authoring tool exists
- **MENA B2B training:** Explosive growth driven by Vision 2030, NEOM, Saudization

### 10.3 Why Build Native vs. Continue with Coassemble

| Factor | Native Authoring | Coassemble (Current) |
|--------|-----------------|---------------------|
| **Control** | Full control over UX, features, data | Limited to Coassemble's features |
| **Arabic/RTL** | Full native RTL support | Limited RTL support |
| **AI Integration** | Custom AI pipeline (Claude/GPT) | Coassemble's AI only |
| **Cost** | Development cost, no per-course fees | Per-seat licensing + API costs |
| **Data** | All content in our Supabase | Content lives in Coassemble |
| **Offline** | Possible with PWA | Not possible (iframe) |
| **Customization** | Unlimited | Limited to Coassemble's templates |
| **Speed to Market** | Slower (build time) | Already working |
| **Recommendation** | **Build for long-term** | **Keep as fallback/import option** |

---

## Appendix: Sources

### Articulate Rise 360
- [Rise 360 All Features](https://www.articulate.com/360/rise/all/)
- [Rise 360: Lesson and Block Types](https://www.articulatesupport.com/article/Rise-Lesson-and-Block-Types)
- [AI Assistant in Rise 360](https://www.articulate.com/360/ai-assistant/)
- [Rise 360: Create Content with AI Assistant](https://community.articulate.com/kb/user-guides/rise-360-create-content-with-ai-assistant/1199630)
- [Rise 360: Quiz Settings](https://articulate.com/support/article/Rise-Quiz-Settings)
- [Rise 360: Export to LMS, PDF, and the Web](https://community.articulate.com/kb/user-guides/rise-360-export-to-lms-pdf-and-the-web/1081716)
- [Rise 360: Personalize the Theme](https://community.articulate.com/kb/user-guides/rise-360-personalize-the-theme/1141061)

### Coassemble
- [Coassemble AI Course Generator](https://coassemble.com/ai-course-generator)
- [Coassemble Transform (Document Conversion)](https://coassemble.com/transform)
- [Coassemble Lesson Screen Templates](https://coassemble.com/features/lesson-screen-templates)
- [Coassemble Developer Portal](https://developers.coassemble.com/get-started)
- [Coassemble API Reference](https://developers.coassemble.com/api/courses)

### AI & Industry
- [Coursebox Technology](https://www.coursebox.ai/technology)
- [Mindsmith Authoring](https://www.mindsmith.ai/authoring)
- [Docebo AI-First Platform](https://www.docebo.com/company/newsroom/docebo-unveils-ai-first-learning-platform-at-docebo-inspire-2025/)
- [iSpring Suite AI](https://www.ispringsolutions.com/blog/ispring-suite-ai-updates)
- [Easygenerator EasyAI](https://www.easygenerator.com/en/features/easyai/)

### SCORM
- [SCORM.com Content Packaging](https://scorm.com/scorm-explained/technical-scorm/content-packaging/)
- [SCORM Run-Time Reference](https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/)
- [scorm-again (npm)](https://www.npmjs.com/package/scorm-again)
- [pipwerks SCORM API Wrapper](https://github.com/pipwerks/scorm-api-wrapper)
- [simple-scorm-packager (npm)](https://www.npmjs.com/package/simple-scorm-packager)

### Bunny.net
- [Bunny Stream Product Page](https://bunny.net/stream/)
- [Bunny Stream CDN Player](https://bunny.net/stream/cdn-player/)
- [Bunny Stream Pricing](https://bunny.net/pricing/stream/)
- [Bunny CDN Pricing](https://bunny.net/pricing/cdn/)
- [Bunny Storage Pricing](https://bunny.net/pricing/storage/)
- [Stream API Reference](https://docs.bunny.net/reference/stream-api-overview)
- [Stream Quickstart Guide](https://docs.bunny.net/docs/stream-quickstart-guide)
- [Stream Embedding Docs](https://docs.bunny.net/docs/stream-embedding-videos)
- [Stream Webhooks](https://docs.bunny.net/stream/webhooks)
- [Stream Player.js Support](https://bunny.net/blog/introducing-player-js-support-for-bunny-stream-advanced-player-control-and-monitoring-api/)
- [MediaCage DRM Docs](https://docs.bunny.net/docs/stream-drm)
- [TUS Resumable Uploads](https://docs.bunny.net/reference/tus-resumable-uploads)
- [Storage API Reference](https://docs.bunny.net/reference/storage-api)
- [Edge Storage Limits](https://docs.bunny.net/reference/edge-storage-api-limits)
- [Token Authentication V2](https://bunny.net/blog/were-bringing-token-authentication-to-the-next-level/)
- [Token Authentication Docs](https://docs.bunny.net/docs/cdn-token-authentication)
- [CORS Headers](https://bunny.net/academy/http/what-are-cross-origin-resource-sharing-cors-headers/)
- [Bunny.net Global Network](https://bunny.net/network/)
- [Dubai PoP Announcement](https://bunny.net/blog/the-bunnies-expand-to-dubai/)
- [Africa & Middle East CDN](https://bunny.net/cdn/content-delivery-africa-and-middle-east/)
- [TypeScript SDK (npm)](https://www.npmjs.com/package/bunny-sdk)
- [TypeScript SDK (GitHub)](https://github.com/jlarmstrongiv/bunny-sdk-typescript/)
- [scorm-again CrossFrame API](https://github.com/jcputney/scorm-again)
