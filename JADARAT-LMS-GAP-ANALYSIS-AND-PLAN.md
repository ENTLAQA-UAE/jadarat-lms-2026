# Jadarat LMS — Comprehensive Gap Analysis & Strategic Feature Plan

**Date:** February 19, 2026
**Platform:** First Arabic AI-Powered B2B SaaS LMS
**Current Stack:** Next.js 14 (App Router), Supabase (Auth + Postgres + Edge Functions), Redux Toolkit, TypeScript, Tailwind CSS + shadcn/ui, Weglot (translation), Coassemble (course authoring), Placid.io (certificates)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Gap Analysis by Domain](#3-gap-analysis-by-domain)
4. [Priority Feature Specifications](#4-priority-feature-specifications)
5. [UI/UX Overhaul Plan](#5-uiux-overhaul-plan)
6. [Architecture & Infrastructure](#6-architecture--infrastructure)
7. [Prioritized Roadmap](#7-prioritized-roadmap)
8. [Competitive Positioning](#8-competitive-positioning)
9. [Add Your Features](#9-add-your-features)

---

## 1. Executive Summary

### What Jadarat Has Today

Jadarat LMS is a **functional early-stage B2B SaaS LMS** with solid foundations in several areas:

- **Authentication**: Email/password, MFA (TOTP), 5-role RBAC, registration with approval workflows
- **Multi-tenancy**: Domain-based tenant isolation, per-org branding (logo, colors, auth background), subscription tiers with feature flags
- **Course Management**: Coassemble integration for authoring, full SCORM 1.2/2004 player with progress tracking, course categories (bilingual EN/AR)
- **Certifications**: Placid.io PDF generation, AWS S3 storage, QR verification, LinkedIn sharing
- **Analytics**: Admin dashboard with enrollment/completion charts, filterable insight tables (students, courses, completions, enrollments), CSV/Excel export
- **Arabic/RTL**: Language context with RTL switching, Weglot translation, bilingual category names, Arabic month labels
- **Mobile**: Responsive design with Tailwind breakpoints, mobile course drawer, mobile sidebar

### The Strategic Gap

The LMS market is projected to reach **$37.9B by 2026** and **$123.78B by 2033**. The competitive landscape is dominated by English-first platforms (Docebo, TalentLMS, Absorb, 360Learning, Cornerstone) — **none offer a natively Arabic-first, AI-powered LMS**. This is Jadarat's primary differentiator and market opportunity.

However, to compete at B2B enterprise level, Jadarat needs significant investment in **22 feature domains** identified below, with the most critical gaps in:

1. **AI capabilities** (feature-flagged but 0% implemented)
2. **Enterprise integrations** (SSO/SAML, SCIM, HRIS)
3. **Learning paths & skills framework** (0% implemented)
4. **Gamification & social learning** (0% implemented)
5. **Testing & quality infrastructure** (0% test coverage)
6. **MENA compliance** (Saudization tracking, PDPL, audit trails)

---

## 2. Current State Assessment

### Feature Completeness Matrix

| Domain | Status | Completeness | Priority |
|--------|--------|-------------|----------|
| Email/Password Auth | ✅ Implemented | 100% | — |
| MFA (TOTP) | ✅ Implemented | 100% | — |
| RBAC (5 roles) | ✅ Implemented | 100% | — |
| SSO / SAML / OIDC | ❌ Missing | 0% | P0 |
| SCIM Provisioning | ❌ Missing | 0% | P1 |
| Course Authoring (Coassemble) | ✅ Implemented | 100% | — |
| SCORM 1.2/2004 Player | ✅ Implemented | 100% | — |
| xAPI / Tin Can | ❌ Planned (disabled) | 0% | P1 |
| cmi5 | ❌ Planned (disabled) | 0% | P2 |
| AICC | ⚠️ Stub only | 10% | P2 |
| Native Quiz/Assessment Engine | ❌ Missing | 0% | P1 |
| Certifications (Placid.io) | ✅ Implemented | 100% | — |
| Certificate Expiration/Renewal | ❌ Missing | 0% | P1 |
| Learning Paths | ❌ Missing | 0% | P0 |
| Course Prerequisites | ❌ Missing | 0% | P0 |
| AI Course Generation | ⚠️ Feature-flagged, not implemented | 5% | P0 |
| AI Chatbot / Learning Assistant | ❌ Missing | 0% | P0 |
| AI Recommendations | ❌ Missing | 0% | P1 |
| Adaptive Learning | ❌ Missing | 0% | P1 |
| Analytics Dashboard | ✅ Implemented | 70% | — |
| Learning ROI Reporting | ❌ Missing | 0% | P2 |
| Custom Report Builder | ❌ Missing | 0% | P2 |
| Data Export (CSV/Excel) | ✅ Implemented | 100% | — |
| Multi-tenancy (domain + branding) | ✅ Implemented | 80% | — |
| Custom Domain Management | ❌ Missing | 0% | P1 |
| White-Label Mobile Apps | ❌ Missing | 0% | P2 |
| Arabic/RTL Layout | ✅ Implemented (Weglot) | 75% | — |
| Hijri Calendar | ❌ Missing | 0% | P1 |
| Arabic NLP (for AI) | ❌ Missing | 0% | P0 |
| Native i18n (locale files) | ❌ Missing (Weglot only) | 30% | P1 |
| Email Notifications | ⚠️ Basic (enrollment only) | 20% | P1 |
| In-app Notification Center | ❌ Missing | 0% | P0 |
| Discussion Forums | ❌ Missing | 0% | P1 |
| Direct Messaging | ❌ Missing | 0% | P2 |
| Announcements | ❌ Missing | 0% | P1 |
| Gamification | ❌ Missing | 0% | P1 |
| E-commerce / Payments | ❌ Missing | 0% | P1 |
| HRIS Integrations | ❌ Missing | 0% | P0 |
| Calendar Integration | ❌ Missing | 0% | P2 |
| Payment Gateway | ❌ Missing | 0% | P1 |
| Mobile Responsive | ✅ Implemented | 85% | — |
| PWA / Offline Support | ❌ Missing | 0% | P1 |
| Native Mobile App | ❌ Missing | 0% | P2 |
| Compliance / Audit Trails | ❌ Missing | 0% | P0 |
| Saudization/Nationalization Tracking | ❌ Missing | 0% | P0 |
| PDPL / Data Privacy Controls | ❌ Missing | 0% | P0 |
| Skills Framework | ❌ Missing | 0% | P1 |
| Social/Collaborative Learning | ❌ Missing | 0% | P1 |
| Microlearning Module Format | ❌ Missing | 0% | P1 |
| Testing (unit/integration/e2e) | ❌ Missing | 0% | P0 |
| Database Migrations | ❌ Missing | 0% | P0 |
| API Documentation | ❌ Missing | 0% | P1 |
| Webhooks / Public API | ❌ Missing | 0% | P1 |

**Legend:** P0 = Critical (must-have for market entry), P1 = High (expected by enterprise buyers), P2 = Medium (competitive differentiator)

---

## 3. Gap Analysis by Domain

### 3.1 AI Capabilities (CRITICAL GAP — Primary Differentiator)

**Current State:** Feature flags exist (`ai_builder`, `document_builder`) but **zero AI code is implemented**. No LLM API calls, no AI packages installed, no AI pipelines.

**Industry Standard (2025-2026):**
- 73% of companies intend to use AI for content creation (Forrester 2024)
- AI-powered LMS features improve engagement by 60% and outcomes by 30%
- Competitors (Docebo, TalentLMS, Sana Labs) all ship AI natively

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **AI Course Generator** | Generate course outlines, content, and assessments from learning objectives using LLMs | High | Critical |
| **Arabic AI Chatbot** | 24/7 learning assistant with Arabic NLP, content Q&A, navigation help | High | Critical |
| **AI Content Recommendations** | Personalized next-course suggestions based on history, role, performance | Medium | High |
| **Adaptive Learning Engine** | Real-time difficulty/pace adjustment based on learner performance | High | High |
| **AI Quiz Generation** | Auto-generate quiz questions at multiple difficulty levels from course content | Medium | High |
| **AI Content Translation** | Translate course content between Arabic/English preserving nuance | Medium | High |
| **AI-Powered Search** | Semantic search across courses, documents, and video transcripts in Arabic | Medium | High |
| **Predictive Analytics** | Forecast drop-off risk, identify at-risk learners, trigger interventions | Medium | Medium |
| **Document-to-Course Builder** | Upload PDF/DOCX, AI extracts and structures into interactive course | High | Medium |
| **AI Video Summarization** | Auto-generate summaries and key points from video content | Medium | Medium |

**Arabic NLP Considerations:**
- Arabic is morphologically complex with root-pattern systems
- Must handle MSA (Modern Standard Arabic) + Gulf dialect
- Available models: AraBERT, AceGPT, Jais (by G42), Claude/GPT-4 with Arabic capabilities
- Consider local model hosting for data sovereignty (PDPL compliance)

**Recommended Architecture:**
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Next.js App    │───▶│  AI Gateway  │───▶│  LLM Provider   │
│  (Frontend)     │    │  (API Route) │    │  (Claude/GPT-4) │
└─────────────────┘    └──────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Vector DB   │
                       │  (pgvector)  │
                       └──────────────┘
```

---

### 3.2 Enterprise Authentication & Identity (CRITICAL for B2B)

**Current State:** Email/password + MFA works well. SSO providers defined in Supabase config but all `enabled = false`.

**Industry Standard:** Enterprise buyers require SSO as table stakes. Without SAML/OIDC, enterprise deals are blocked.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **SAML 2.0 SSO** | Enterprise IdP integration (Azure AD, Okta, OneLogin) per tenant | High | Critical |
| **OIDC / OAuth 2.0** | OpenID Connect for modern identity providers | Medium | Critical |
| **SCIM 2.0 Provisioning** | Automated user sync from IdP (create, update, deactivate) | High | High |
| **Per-Tenant SSO Config** | Each org configures their own IdP (not platform-wide) | Medium | Critical |
| **Directory Sync** | Azure AD / Google Workspace directory sync for user management | Medium | High |
| **Bulk User Import (CSV)** | Upload CSV to create/update users in bulk | Low | High |
| **IP Whitelisting** | Restrict access by IP range per tenant | Low | Medium |
| **Session Management** | Configurable session timeout, concurrent session limits | Low | Medium |

---

### 3.3 Learning Paths, Prerequisites & Curricula

**Current State:** Each course is completely standalone. No sequencing, no prerequisites, no structured learning journeys.

**Industry Standard:** Learning paths are a core feature of every enterprise LMS. They enable structured onboarding, compliance programs, and career development.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Learning Path Builder** | Create ordered sequences of courses with optional/required modules | Medium | Critical |
| **Course Prerequisites** | Enforce completion of prerequisite courses before enrollment | Medium | Critical |
| **Path Progress Tracking** | Visual progress through multi-course paths | Medium | High |
| **Auto-Enrollment Rules** | Automatically enroll users in paths based on role/department/group | Medium | High |
| **Certification Programs** | Multi-course programs leading to certification with expiry/renewal | Medium | High |
| **Blended Learning Paths** | Mix self-paced, ILT, and on-the-job training in one path | High | Medium |
| **Path Templates** | Pre-built path templates (onboarding, compliance, leadership) | Low | Medium |

**Suggested Schema:**
```sql
-- learning_paths
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    title TEXT NOT NULL,
    ar_title TEXT,
    description TEXT,
    ar_description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- learning_path_courses (ordered)
CREATE TABLE learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    position INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    prerequisite_course_id UUID REFERENCES courses(id)
);

-- user_learning_paths
CREATE TABLE user_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    path_id UUID REFERENCES learning_paths(id),
    status TEXT DEFAULT 'in_progress', -- in_progress, completed
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);
```

---

### 3.4 Arabic/RTL & Localization (Core Differentiator)

**Current State:** RTL layout switching works via `LanguageContext`. Weglot handles translation at runtime. Category names are bilingual. Arabic month labels exist.

**Industry Standard:** Native Arabic-first platforms design the entire UX in RTL from the ground up, not as a translation layer.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Native i18n Framework** | Replace/supplement Weglot with `next-intl` or `react-i18next` for static strings | Medium | High |
| **Hijri Calendar** | Dual calendar support (Hijri + Gregorian) for date pickers, deadlines, reports | Medium | Critical (MENA) |
| **Arabic Morphological Search** | Root-based Arabic search that handles prefixes, suffixes, and word variations | High | High |
| **Arabic Number Formatting** | Consistent Arabic-Indic numeral support across all views | Low | Medium |
| **Bidirectional Content Containers** | `dir="auto"` on all content blocks, not just root HTML | Low | Medium |
| **Arabic Font Optimization** | Arabic-specific font stacking with proper glyph coverage | Low | Medium |
| **Cultural Localization** | Ramadan scheduling awareness, prayer time considerations, culturally appropriate imagery | Medium | High |
| **Friday-Saturday Weekend** | Configurable work week per tenant (SA: Sun-Thu, UAE: Mon-Fri) | Low | Medium |
| **Multiple Arabic Dialects** | Support for Gulf, Egyptian, Levantine in AI features | High | Medium |

**Recommendation:** Keep Weglot for dynamic content translation but add `next-intl` for all static UI strings. This gives you: (1) offline-capable translations, (2) type-safe translation keys, (3) no dependency on Weglot for core UI.

---

### 3.5 MENA Compliance & Nationalization (Market-Critical)

**Current State:** No compliance features exist. User `country` field exists but no nationality-specific logic.

**Industry Standard:** MENA B2B buyers (especially government and semi-government) require:
- PDPL compliance (Saudi data protection law, enforced since Sep 2024)
- Saudization/Emiratization tracking and reporting
- Audit trails for regulatory inspections

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Audit Trail System** | Log every admin action (user changes, enrollments, deletions) with timestamps and actor | Medium | Critical |
| **PDPL Compliance** | Consent management, data export (right of access), right to erasure, data residency controls | High | Critical |
| **Saudization Tracking** | Track Saudi/non-Saudi ratios, connect training to nationalization goals, generate Nitaqat reports | Medium | Critical (SA) |
| **Emiratization Tracking** | Similar to Saudization but for UAE workforce | Medium | Critical (UAE) |
| **HRDF Reporting** | Generate reports compliant with Saudi Human Resource Development Fund requirements | Medium | High |
| **Data Residency Controls** | Configurable data storage region per tenant (AWS Bahrain, Azure UAE) | High | High |
| **Compliance Dashboard** | At-a-glance compliance status across regulations and certifications | Medium | High |
| **Mandatory Training Workflows** | Assign regulatory-required training by role with deadlines and escalation | Medium | High |
| **Version-Controlled Policies** | Track which version of compliance training each user completed | Low | Medium |

**Suggested Schema Additions:**
```sql
-- audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    actor_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- 'user.created', 'course.deleted', 'enrollment.added'
    entity_type TEXT NOT NULL, -- 'user', 'course', 'enrollment'
    entity_id UUID,
    metadata JSONB, -- action-specific details
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- nationalization_records
CREATE TABLE nationalization_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    user_id UUID REFERENCES auth.users(id),
    nationality TEXT NOT NULL,
    is_national BOOLEAN DEFAULT false, -- Saudi/Emirati
    department TEXT,
    job_grade TEXT,
    training_hours_completed NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 3.6 Gamification

**Current State:** Zero gamification. No points, badges, leaderboards, or achievement system.

**Industry Standard:** Gamification significantly improves engagement in onboarding and compliance training. All major LMS platforms offer it.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Points/XP System** | Earn points for course completion, quiz scores, login streaks | Medium | High |
| **Badges & Achievements** | Configurable badge system for milestones (first course, 10 courses, perfect quiz) | Medium | High |
| **Leaderboards** | Organization/department/group leaderboards with time filters | Medium | High |
| **Streaks** | Daily/weekly learning streak tracking with visual indicators | Low | Medium |
| **Levels/Ranks** | Learner levels based on accumulated XP | Low | Medium |
| **Team Competitions** | Department or group-based challenges | Medium | Medium |
| **Unlockable Content** | Premium courses unlocked by achievements | Low | Low |

---

### 3.7 Communication & Notifications

**Current State:** Single enrollment email via Resend Edge Function. Toast notifications for in-app feedback only.

**Industry Standard:** Enterprise LMS platforms have comprehensive notification systems with multiple channels and configurable triggers.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **In-App Notification Center** | Bell icon with unread count, notification list, mark as read | Medium | Critical |
| **Email Notification Templates** | Configurable templates for: enrollment, completion, deadline reminder, certificate issued, new announcement | Medium | High |
| **Automated Reminders** | Deadline approaching, overdue training, certificate expiring, inactive learner | Medium | High |
| **Announcements System** | Platform-wide, org-wide, course-level announcements with targeting | Medium | High |
| **Push Notifications** | Web push and mobile push for time-sensitive alerts | Medium | Medium |
| **Discussion Forums** | Per-course discussion threads with moderation | High | High |
| **Notification Preferences** | Per-user settings for notification channels and frequency | Low | Medium |
| **SMS Notifications** | Twilio integration (config exists but disabled) | Low | Medium |

---

### 3.8 E-commerce & Course Monetization

**Current State:** No payment processing at all. Subscription tiers exist for internal SaaS pricing only.

**Industry Standard:** B2B LMS platforms offer e-commerce for extended enterprise training (selling courses to partners, customers, or public).

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Payment Gateway Integration** | Stripe, PayFort/Amazon Payment Services, HyperPay, Moyasar (MENA gateways) | High | High |
| **Course Pricing** | Per-course pricing, bundle pricing, subscription pricing | Medium | High |
| **Shopping Cart & Checkout** | Cart flow with promo codes, invoicing | Medium | High |
| **Invoicing & Receipts** | Auto-generated invoices with VAT support | Medium | High |
| **Discount Codes / Coupons** | Configurable discount campaigns | Low | Medium |
| **Revenue Reporting** | Sales dashboards, revenue per course/category/time period | Medium | Medium |
| **B2B Seat Licensing** | Sell course seats in bulk to partner organizations | Medium | Medium |

---

### 3.9 HRIS & Third-Party Integrations

**Current State:** Integrations limited to Coassemble (authoring), Placid.io (certificates), Resend (email), AWS S3 (storage), and Vimeo (video via Coassemble).

**Industry Standard:** Enterprise LMS platforms integrate with 10-50+ systems. HRIS integration is the most requested by B2B buyers.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Jisr Integration** | Saudi HR platform — sync users, departments, roles | High | Critical (SA) |
| **ZenHR Integration** | Pan-MENA HR platform — user sync, training tracking | High | Critical (MENA) |
| **SAP SuccessFactors** | Enterprise HCM — bidirectional data sync | High | High |
| **Zoom / Google Meet** | Virtual classroom integration for ILT sessions | Medium | High |
| **Microsoft Teams / Slack** | Learning in the flow of work — notifications, course links | Medium | High |
| **Google Calendar / Outlook** | Session scheduling, deadline sync, ILT calendar events | Medium | Medium |
| **Webhook System** | Outgoing webhooks for custom integrations (enrollment, completion, etc.) | Medium | High |
| **Zapier / Make.com Connector** | No-code integration marketplace | Medium | Medium |
| **LTI 1.3** | Connect with content provider ecosystems | Medium | Medium |

---

### 3.10 Skills & Competency Framework

**Current State:** Zero skills infrastructure. Courses have no skill tags, no competency mapping.

**Industry Standard:** Skills-based learning is the #1 trend in L&D for 2025-2026. Organizations are shifting from course catalogs to competency frameworks.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Skills Taxonomy** | Configurable skills/competency library per organization | Medium | High |
| **Course-to-Skills Mapping** | Tag courses with skills they develop, at proficiency levels | Medium | High |
| **Skills Gap Analysis** | Compare current user skills vs. target role requirements | Medium | High |
| **Skills Dashboard (Manager)** | Team skills heatmap showing gaps and strengths | Medium | High |
| **Micro-Credentials / Digital Badges** | Granular skill badges (not just course certificates) | Medium | Medium |
| **Competency-Based Progression** | Unlock advanced content based on demonstrated competency | Medium | Medium |
| **Skills Profile (Learner)** | Personal skills portfolio with verified credentials | Low | Medium |

---

### 3.11 Mobile & Offline

**Current State:** Responsive design is solid with Tailwind breakpoints, mobile drawer components, and viewport optimization.

**Industry Standard:** 85%+ of adults worldwide own smartphones. Enterprise learners expect native-quality mobile experiences with offline access.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **PWA Setup** | Service worker, manifest.json, installable app experience | Medium | High |
| **Offline Content Download** | Download courses for offline consumption with progress sync | High | High |
| **Push Notifications (Web)** | Browser push for deadlines, new content, reminders | Medium | Medium |
| **Native Mobile App** | React Native or Capacitor wrapper for iOS/Android | High | Medium |
| **White-Label Mobile Apps** | Per-tenant branded mobile apps | High | Medium |
| **Touch Gesture Navigation** | Swipe gestures for course navigation, card interactions | Low | Low |

---

### 3.12 Assessment & Quiz Engine

**Current State:** Relies entirely on Coassemble for assessments. No native quiz builder exists.

**Industry Standard:** LMS platforms provide built-in assessment engines for flexibility and data ownership.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Native Quiz Builder** | Multiple question types: MCQ, true/false, fill-in-blank, matching, ordering, essay | High | High |
| **Question Bank** | Reusable question pool with random selection per attempt | Medium | High |
| **Configurable Grading** | Pass marks, weighted sections, partial credit, unlimited/limited attempts | Medium | High |
| **Timed Assessments** | Time-limited quizzes with auto-submission | Medium | Medium |
| **AI-Assisted Grading** | LLM-based grading for essay/open-ended questions with rubric adherence | Medium | Medium |
| **Proctoring Integration** | Basic proctoring (tab-switch detection, fullscreen enforcement) | Medium | Medium |
| **Assessment Analytics** | Question-level analytics: difficulty index, discrimination index, common wrong answers | Medium | Medium |

---

### 3.13 Infrastructure & DevOps

**Current State:** No test coverage, no database migrations, no CI/CD evidence, no API documentation.

**Industry Standard:** Production SaaS requires comprehensive testing, reproducible schemas, automated deployments, and API documentation.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Database Migrations** | Export current schema, establish migration system (Supabase CLI or Prisma) | Medium | Critical |
| **Unit Tests** | Vitest/Jest for utility functions, server actions, business logic | High | Critical |
| **Integration Tests** | API route testing, database interaction testing | High | Critical |
| **E2E Tests** | Playwright/Cypress for critical user flows (login, enrollment, course play) | High | High |
| **CI/CD Pipeline** | GitHub Actions for lint, test, build, deploy on PR/merge | Medium | High |
| **API Documentation** | OpenAPI/Swagger spec for all API routes and RPCs | Medium | High |
| **Error Monitoring** | Sentry or similar for production error tracking | Low | High |
| **Performance Monitoring** | Vercel Analytics, Web Vitals, Lighthouse CI | Low | Medium |
| **Load Testing** | k6/Artillery for multi-tenant load testing | Medium | Medium |

---

### 3.14 Social & Collaborative Learning

**Current State:** Zero social features. Learning is entirely individual.

**Industry Standard:** Social learning increases retention rates. Peer-driven platforms like 360Learning are growing rapidly.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Course Discussion Threads** | Per-course/per-module discussion forums | Medium | High |
| **Peer Reviews** | Learners review each other's assignments with rubrics | Medium | Medium |
| **Cohort-Based Learning** | Time-bound groups progressing through content together | Medium | Medium |
| **Activity Feed** | Social feed showing team learning activity | Medium | Medium |
| **Expert Q&A** | Tag subject matter experts for answers | Low | Medium |
| **Collaborative Assignments** | Group projects with shared submissions | High | Low |

---

### 3.15 Microlearning

**Current State:** No dedicated microlearning format. Courses have a `timeline` field but no enforcement of short-form content.

**Industry Standard:** 58% of employees prefer learning in shorter segments. Microlearning market is $3.4B+ and doubling.

**Gaps to Close:**

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Micro-Module Format** | 5-10 minute content cards with video, text, quiz | Medium | High |
| **Daily Learning Cards** | Push a daily micro-lesson to learners (spaced repetition) | Medium | High |
| **Swipeable Content** | Mobile-optimized card-based content consumption | Medium | Medium |
| **Content Chunking Tool** | AI-powered tool to break long courses into micro-modules | Medium | Medium |

---


---

## 4. Priority Feature Specifications

### 4.1 AI Chatbot with Per-Organization Configuration

**Current State:** Feature flags exist (`ai_builder`, `document_builder`) but zero AI code is implemented. No LLM API calls, no AI packages installed, no AI pipelines in the codebase.

**What to Build:**

- Floating chat widget accessible on all learner pages (bottom-right corner, RTL-aware — flips to bottom-left in Arabic)
- 24/7 Arabic/English bilingual learning assistant
- Course-context-aware: when a learner is viewing or playing a course, the chatbot answers questions about that specific course content
- Navigation helper: responds to queries like "Where are my certificates?" or "Show me advanced courses"
- RAG (Retrieval-Augmented Generation) pipeline using course content indexed in pgvector
- Per-organization AI configuration: org admins choose provider, model, system prompt, and toggle AI on/off
- Streaming responses via Vercel AI SDK `useChat` hook
- Conversation history stored per user with course context
- Multi-provider support: OpenAI, Anthropic Claude, Google Gemini, Jais (Arabic-optimized)
- Rate limiting: configurable per org (default 50 messages/hour)
- Token usage tracking for cost analytics per organization

**Architecture:**

```
Learner UI (useChat hook)
    │
    ▼
/api/chat (Next.js API Route, Node.js runtime)
    │
    ├─► Read org_ai_config (provider, model, system prompt)
    ├─► Fetch course context from pgvector (RAG)
    ├─► Route to selected LLM provider
    │     ├── OpenAI (gpt-4o, gpt-4o-mini)
    │     ├── Anthropic (claude-sonnet)
    │     ├── Google (gemini-pro)
    │     └── Jais (jais-30b, Arabic-optimized)
    │
    └─► Stream response back to client
```

**Database Schema:**

```sql
CREATE TABLE org_ai_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id) UNIQUE,
    is_enabled BOOLEAN DEFAULT false,
    provider TEXT DEFAULT 'openai',
    model TEXT DEFAULT 'gpt-4o-mini',
    api_key_encrypted TEXT,
    system_prompt TEXT DEFAULT 'You are a helpful learning assistant. Answer questions about course content. Respond in the same language the user writes in.',
    system_prompt_ar TEXT,
    temperature NUMERIC DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1024,
    rate_limit_per_hour INTEGER DEFAULT 50,
    allowed_topics TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organization(id),
    course_id UUID REFERENCES courses(id),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model_used TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE course_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Key Packages to Install:**
- `ai` — Vercel AI SDK core
- `@ai-sdk/openai` — OpenAI provider
- `@ai-sdk/anthropic` — Anthropic provider
- `@ai-sdk/google` — Google provider
- `@ai-sdk/react` — React hooks (`useChat`)

**UI Components:**
- `ChatWidget` — Floating bubble (bottom-right LTR / bottom-left RTL) with unread indicator
- `ChatWindow` — Expandable panel with message list, input, typing indicator, minimize/maximize
- `ChatMessage` — Individual message bubble with avatar, timestamp, copy button, RTL text support
- `OrgAIConfigForm` — Admin settings panel: provider select, model select, API key input, system prompt textarea, rate limit slider, enable/disable toggle

**Implementation Notes:**
- Use `export const runtime = 'nodejs'` for the chat API route (Edge runtime has streaming stability issues)
- Encrypt API keys with AES-256 before storing in database
- Arabic support: system prompt instructs model to respond in the user's language
- Use pgvector Supabase extension for embeddings — no separate vector DB needed
- Index course content on publish/update via background job

---

### 4.2 Learning Points System

**Current State:** Zero points/XP infrastructure exists in the codebase.

**What to Build:**

A configurable points engine where learners earn XP for learning activities. LMS admins set point values per course, and org admins configure global multipliers.

**Point Calculation Formula:**
```
Course Completion = base_points × difficulty_multiplier
Quiz Bonus        = (quiz_score / 100) × quiz_points
Streak Bonus      = streak_days × points_per_streak_day (capped daily)
Badge Bonus       = badge.points_value (one-time award)

Total XP = Course Points + Quiz Bonus + Streak Bonus + Badge Bonus
```

**Default Difficulty Multipliers:**
| Level | Multiplier | Example (100 base) |
|-------|-----------|-------------------|
| Beginner | 1.0x | 100 XP |
| Intermediate | 1.5x | 150 XP |
| Advanced | 2.0x | 200 XP |

**Database Schema:**

```sql
CREATE TABLE learning_points_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id) UNIQUE,
    points_per_completion INTEGER DEFAULT 100,
    points_per_quiz_percent NUMERIC DEFAULT 1.0,
    points_per_streak_day INTEGER DEFAULT 5,
    streak_cap_per_day INTEGER DEFAULT 50,
    beginner_multiplier NUMERIC DEFAULT 1.0,
    intermediate_multiplier NUMERIC DEFAULT 1.5,
    advanced_multiplier NUMERIC DEFAULT 2.0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE course_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) UNIQUE,
    base_points INTEGER DEFAULT 100,
    quiz_points INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organization(id),
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, organization_id)
);

CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organization(id),
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('course_completion', 'quiz_score', 'streak', 'badge', 'admin_adjustment')),
    source_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organization(id),
    date DATE NOT NULL,
    activity_count INTEGER DEFAULT 1,
    UNIQUE(user_id, organization_id, date)
);
```

**UI Components:**
- `PointsDisplay` — Animated counter showing current XP on learner dashboard
- `PointsHistory` — Transaction log table with type/date/source filters
- `StreakIndicator` — Flame icon with streak count (Duolingo-style), pulse animation when at risk
- `LevelBadge` — Current level with progress bar to next level
- `CoursePointsConfig` — Form in course creation/editing to set base_points and quiz_points
- `OrgPointsConfig` — Org admin settings for multipliers, caps, enable/disable

**Trigger Logic:**
- On course completion (`user_courses.status = 'completed'`): calculate and insert points transaction
- On daily login: check `user_streaks`, increment or reset streak, award streak bonus
- Streak reset via Vercel Cron job at midnight: reset streaks for users with no activity yesterday

---

### 4.3 Quiz Results Display for LMS Admin

**Current State:** Assessments are handled entirely by Coassemble. SCORM courses track `lesson_status` and `score` in `scorm_data`, but this data is not surfaced to LMS admins in any dedicated view.

**What to Build:**

- New "Quiz Results" tab under LMS Admin Insights section
- Per-course quiz results table: learner name, score (%), attempts, pass/fail status, date completed
- Score distribution histogram (Recharts — already installed but unused)
- Pass rate trend line chart over time
- Per-question analytics: difficulty index, most common wrong answers
- Export quiz results to CSV/Excel (reuse existing `exportToExcel` and `exportToCSV` utilities)
- Filters: course, department, group, date range, pass/fail status

**Data Sources:**
1. **SCORM courses**: Extract score from existing `scorm_data` stored per user/course (fields: `cmi.core.score.raw`, `cmi.core.lesson_status`)
2. **Coassemble courses**: Use Coassemble Reporting API to fetch quiz results
3. **Native quizzes** (future): Direct database queries from `quiz_results` table

**Database Schema:**

```sql
CREATE TABLE quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    course_id UUID REFERENCES courses(id),
    organization_id UUID REFERENCES organization(id),
    quiz_title TEXT,
    score NUMERIC NOT NULL,
    max_score NUMERIC DEFAULT 100,
    passed BOOLEAN,
    passing_score NUMERIC DEFAULT 70,
    attempt_number INTEGER DEFAULT 1,
    time_spent_seconds INTEGER,
    answers JSONB,
    source TEXT DEFAULT 'scorm' CHECK (source IN ('scorm', 'coassemble', 'native')),
    completed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    organization_id UUID REFERENCES organization(id),
    question_text TEXT,
    total_attempts INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    difficulty_index NUMERIC GENERATED ALWAYS AS (
        CASE WHEN total_attempts > 0 THEN correct_count::NUMERIC / total_attempts ELSE 0 END
    ) STORED,
    common_wrong_answers JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**UI Components:**
- `QuizResultsPage` — New page at `/dashboard/@lms_admin/insights/quiz-results/`
- `QuizResultsTable` — Filterable DataTable with columns: learner, course, score, pass/fail badge, attempts, date
- `QuizScoreDistribution` — Histogram chart using Recharts
- `QuizPassRateChart` — Line chart showing pass rates over time
- `QuestionAnalytics` — Expandable section per question showing difficulty and common wrong answers
- `QuizResultDetail` — Modal showing individual learner's full attempt (questions, answers, correct/incorrect)
- `QuizExportButton` — Reuses existing `exportToExcel()` and `exportToCSV()` utilities

**Admin Location:** Insights sidebar → new "Quiz Results" link between "Completions" and "Enrollments"

---

### 4.4 Course Status Tracking

**Current State:** The `user_courses` table tracks enrollment. Progress percentage is updated via the SCORM player's `update_course_percentage` RPC. Status is effectively binary: enrolled or completed (at 100%). Courses themselves have no publishing lifecycle — they are either visible or not.

**What to Build:**

Two distinct status systems:
1. **Course Publishing Status** (admin-side): Controls course visibility and availability
2. **Learner Enrollment Status** (learner-side): Tracks individual learner progress through a course

---

#### A. Course Publishing Status (Draft / Private / Published)

The admin-side course lifecycle that controls who can see and access a course.

**Publishing Lifecycle:**
```
Draft → Private → Published
  ↑        ↓         ↓
  └── (unpublish) ←──┘
```

**Status Definitions:**
| Status | Definition | Badge Color | Visibility |
|--------|-----------|-------------|------------|
| `draft` | Course is being created/edited, incomplete | Gray | Only visible to course creator and LMS admins |
| `private` | Course is complete but restricted — only accessible via direct enrollment by admin | Yellow | Visible to LMS admins; learners see it only if explicitly enrolled |
| `published` | Course is live and available in the catalog | Green | Visible to all learners in the organization |

**Database Changes:**

```sql
-- Add publishing status to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS publishing_status TEXT DEFAULT 'draft'
    CHECK (publishing_status IN ('draft', 'private', 'published'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);
```

**Admin UI:**
- `PublishingStatusBadge` — Colored pill on course cards and course list: gray (Draft), yellow (Private), green (Published)
- `PublishingStatusDropdown` — Status change dropdown on course edit page with confirmation dialog
- `CoursePublishingFilter` — Filter courses by publishing status in admin course list
- `PublishConfirmModal` — "Are you sure you want to publish this course? It will be visible to all learners." confirmation
- Only `published` courses appear in the learner catalog; `private` courses appear only for directly enrolled learners; `draft` courses are admin-only

---

#### B. Learner Enrollment Status

Granular learner-side status with automatic transitions based on learner activity.

**Status Lifecycle:**
```
enrolled → not_started → in_progress → completed
                                     → failed (if pass mark not met)
                                     → expired (course expiration date passed)
                                     → overdue (deadline passed, not completed)
```

**Status Definitions:**
| Status | Definition | Badge Color | Auto-Trigger |
|--------|-----------|-------------|-------------|
| `not_started` | Enrolled but never accessed | Gray | Default on enrollment |
| `in_progress` | Accessed, 0 < progress < 100% | Blue | On first course access |
| `completed` | 100% progress or passed | Green | On progress = 100% or SCORM `passed` |
| `failed` | Attempted but didn't meet pass mark | Red | On SCORM `failed` status |
| `expired` | Course expiration date passed | Orange | Vercel Cron daily check |
| `overdue` | Enrollment deadline passed | Red | Vercel Cron daily check |

**Database Changes:**

```sql
-- Add columns to existing user_courses table
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'expired', 'overdue'));
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC DEFAULT 0;
ALTER TABLE user_courses ADD COLUMN IF NOT EXISTS score NUMERIC;
```

**UI Components:**
- `CourseStatusBadge` — Colored pill component: `<Badge variant={statusColor}>{statusLabel}</Badge>`
- `CourseStatusFilter` — Multi-select dropdown for filtering by status on all course listing pages
- `CourseStatusPieChart` — Donut chart on LMS admin dashboard showing status distribution (both publishing + enrollment)
- `OverdueCourseAlert` — Warning banner on learner dashboard when courses are overdue
- `StatusTimeline` — Visual timeline showing when status changed (enrollment → started → completed)
- `CourseStatusSummary` — Admin widget: "X enrolled, Y in progress, Z completed, W overdue"

**Integration Points:**
- SCORM player: on `LMSInitialize()`, update status to `in_progress` and set `started_at`
- SCORM player: on `LMSFinish()` with `passed`, update status to `completed` and set `completed_at`
- Vercel Cron (`/api/cron/overdue-courses`): daily check for enrollments past deadline → set `overdue`
- Existing `update_course_percentage` RPC: also update `progress_percentage` and `last_accessed_at`
- Course catalog query: filter by `publishing_status = 'published'` for learner views

---

### 4.5 Leaderboard

**Current State:** No leaderboard exists anywhere in the codebase.

**What to Build:**

- Organization-wide leaderboard ranked by total learning points
- Department and group sub-leaderboards
- Time filters: this week, this month, this quarter, all time
- Top 3 featured prominently (gold/silver/bronze podium)
- Full list scrollable below top 3
- Learner's own rank always visible: "You are #23 of 450"
- Privacy: opt-out option (learner can hide from leaderboard)
- Anonymized mode option per org (show initials or avatar only)
- Animated rank changes (up/down arrows with position delta since last period)

**Database Schema:**

```sql
CREATE TABLE leaderboard_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organization(id),
    is_visible BOOLEAN DEFAULT true,
    UNIQUE(user_id, organization_id)
);

-- Materialized view for fast leaderboard queries
CREATE MATERIALIZED VIEW leaderboard_rankings AS
SELECT
    up.user_id,
    up.organization_id,
    up.total_points,
    up.current_streak,
    up.level,
    u.name,
    u.avatar_url,
    u.department,
    u.group_id,
    COALESCE(lp.is_visible, true) as is_visible,
    RANK() OVER (PARTITION BY up.organization_id ORDER BY up.total_points DESC) as org_rank,
    RANK() OVER (PARTITION BY up.organization_id, u.department ORDER BY up.total_points DESC) as dept_rank
FROM user_points up
JOIN users u ON up.user_id = u.id
LEFT JOIN leaderboard_preferences lp ON up.user_id = lp.user_id AND up.organization_id = lp.organization_id;

-- Refresh every 30 min via Vercel Cron
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings;
```

**UI Components:**
- `LeaderboardPage` — Full page at `/dashboard/@learner/leaderboard/`
- `LeaderboardPodium` — Top 3 display with gold/silver/bronze styling and avatars
- `LeaderboardRow` — Individual rank row: position, avatar, name, points, streak, level badge, trend arrow
- `MyRankCard` — Compact card always showing learner's own rank (sticky at bottom or highlighted in list)
- `LeaderboardFilters` — Time range (week/month/quarter/all), department dropdown, group dropdown
- `LeaderboardWidget` — Compact version for dashboard sidebar (top 5 + "You are #X")
- `LeaderboardPrivacyToggle` — Toggle in learner profile settings to opt out

**Vercel Cron:** `/api/cron/leaderboard-refresh` runs every 30 minutes: `REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_rankings`

---

### 4.6 Gamification Engine

**Current State:** Zero gamification. No points, badges, levels, streaks, or challenges.

**What to Build:**

A unified gamification system that ties together points (3.2), badges (3.7), leaderboards (3.5), and adds levels, streaks, and challenges.

**Level System:**
| Level | Title (EN) | Title (AR) | Points Required |
|-------|-----------|-----------|-----------------|
| 1 | Beginner | مبتدئ | 0 |
| 2 | Explorer | مستكشف | 500 |
| 3 | Learner | متعلم | 1,500 |
| 4 | Achiever | منجز | 3,500 |
| 5 | Expert | خبير | 7,000 |
| 6 | Master | متقن | 12,000 |
| 7 | Champion | بطل | 20,000 |
| 8 | Legend | أسطورة | 35,000 |

**Challenges (time-bound goals):**
- "Complete 3 courses this month" → 200 bonus XP
- "Maintain a 7-day streak" → 100 bonus XP + badge
- "Score 90%+ on 5 quizzes" → 300 bonus XP + badge

**Database Schema:**

```sql
CREATE TABLE gamification_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    level INTEGER NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    points_required INTEGER NOT NULL,
    icon_url TEXT,
    UNIQUE(organization_id, level)
);

CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    title TEXT NOT NULL,
    ar_title TEXT,
    description TEXT,
    ar_description TEXT,
    type TEXT NOT NULL CHECK (type IN ('course_count', 'streak_days', 'points_earned', 'quiz_score')),
    target_value INTEGER NOT NULL,
    points_reward INTEGER DEFAULT 100,
    badge_reward_id UUID REFERENCES badges(id),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    challenge_id UUID REFERENCES challenges(id),
    current_value INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, challenge_id)
);
```

**Gamification Event Flow:**
```
Learner Action (course complete, quiz pass, login)
    │
    ▼
Gamification Event Handler (server action or DB trigger)
    ├── 1. Calculate points → INSERT points_transaction
    ├── 2. Update streak → UPSERT user_streaks, UPDATE user_points.current_streak
    ├── 3. Check badge triggers → evaluate all badge rules, INSERT user_badges if new
    ├── 4. Check level → compare total_points vs gamification_levels, UPDATE user_points.level
    ├── 5. Check challenges → UPDATE user_challenges.current_value, mark completed if target met
    └── 6. Send notification → INSERT notification (in-app) + trigger celebration UI
```

**UI Components:**
- `LevelProgressBar` — XP bar showing progress to next level with level title
- `LevelUpModal` — Full-screen celebration on level up (use existing `framer-motion` + `lottie-react`)
- `ChallengeCard` — Active challenge with progress bar and countdown timer
- `ChallengesPage` — List of active/completed challenges at `/dashboard/@learner/challenges/`
- `StreakCalendar` — GitHub-style contribution heatmap showing daily activity (past 90 days)
- `CompletionCelebration` — Confetti animation on course completion (framer-motion)
- `GamificationWidget` — Dashboard sidebar: level, streak, active challenges summary

---

### 4.7 Learner Badges

**Current State:** No badge system exists. The `badge.tsx` in `src/components/ui/` is a shadcn/ui generic Badge component, not a gamification badge.

**What to Build:**

- **System badges**: Automatically triggered by milestones (not deletable by admin)
- **Custom badges**: Created by LMS admin per organization
- Badge gallery on learner profile page
- Badge sharing to LinkedIn and social media
- In-app notification + celebration animation when badge earned
- Badge rarity levels with visual distinction

**Default System Badges:**
| Badge | Trigger | Rarity | Points |
|-------|---------|--------|--------|
| First Steps | Complete first course | Common | 25 |
| Quick Learner | Complete course in < 50% estimated time | Uncommon | 50 |
| Perfect Score | Score 100% on any quiz | Rare | 100 |
| Streak Master | Maintain 30-day streak | Epic | 200 |
| Course Collector | Complete 10 courses | Uncommon | 75 |
| Knowledge Seeker | Complete 25 courses | Rare | 150 |
| Top of Class | Reach #1 on department leaderboard | Legendary | 500 |
| Team Player | Complete all courses in a learning path | Rare | 100 |
| Night Owl | Complete a lesson between 10 PM - 6 AM | Common | 25 |

**Rarity Visual Styling:**
| Rarity | Border Color | Glow Effect |
|--------|-------------|-------------|
| Common | Gray (#9CA3AF) | None |
| Uncommon | Green (#10B981) | Subtle |
| Rare | Blue (#3B82F6) | Medium |
| Epic | Purple (#8B5CF6) | Strong |
| Legendary | Gold (#F59E0B) | Animated shimmer |

**Database Schema:**

```sql
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    name TEXT NOT NULL,
    ar_name TEXT,
    description TEXT,
    ar_description TEXT,
    icon_url TEXT,
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    points_value INTEGER DEFAULT 50,
    is_system BOOLEAN DEFAULT false,
    trigger_type TEXT CHECK (trigger_type IN ('course_complete', 'streak', 'quiz_score', 'leaderboard', 'points_total', 'manual')),
    trigger_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    badge_id UUID REFERENCES badges(id),
    organization_id UUID REFERENCES organization(id),
    earned_at TIMESTAMPTZ DEFAULT now(),
    source_id UUID,
    UNIQUE(user_id, badge_id)
);
```

**UI Components:**
- `BadgeCard` — Individual badge with icon, name, rarity glow, earned/locked state
- `BadgeGallery` — Grid layout on learner profile: earned badges full color, locked badges greyed out with "?" icon
- `BadgeEarnedModal` — Celebration modal with animation when badge earned (framer-motion scale + lottie confetti)
- `BadgeShareButton` — Share to LinkedIn with Open Graph image generation
- `BadgeManagement` — Admin CRUD at `/dashboard/@lms_admin/badges/`: create, edit, delete custom badges
- `BadgeRarityIndicator` — Colored ring/border component with optional shimmer animation for legendary

---

### 4.8 Course Marketplace (Org Admin)

**Current State:** Org admins can edit organization settings and manage users/groups but have no control over which courses are available to their learners. All course management is handled by LMS admins.

**What to Build:**

- Org Admin can browse a course marketplace — a catalog of all courses published by super admin / platform
- Org Admin selects which courses to enable for their organization's learners
- Course cards show: title, description, category, difficulty, estimated time, thumbnail, preview option
- Search and filter by category, difficulty, duration
- "Request Course" form for org admins to request new courses not in the catalog
- Enabled/disabled toggle per course with confirmation
- Marketplace analytics: most popular courses across organizations, trending courses

**Database Schema:**

```sql
CREATE TABLE marketplace_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    is_published BOOLEAN DEFAULT false,
    price NUMERIC,
    currency TEXT DEFAULT 'SAR',
    preview_url TEXT,
    featured BOOLEAN DEFAULT false,
    featured_order INTEGER,
    tags TEXT[],
    total_enrollments INTEGER DEFAULT 0,
    avg_rating NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE organization_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    course_id UUID REFERENCES courses(id),
    enabled_at TIMESTAMPTZ DEFAULT now(),
    enabled_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(organization_id, course_id)
);

CREATE TABLE course_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    requested_by UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**UI Components:**
- `MarketplacePage` — Full catalog at `/dashboard/@org_admin/marketplace/`
- `MarketplaceCourseCard` — Course card with "Enable" / "Disable" toggle button, preview, metadata
- `CoursePreviewModal` — Modal with course description, outcomes, sample content before enabling
- `EnabledCoursesManager` — Table of currently enabled courses with bulk enable/disable
- `CourseRequestForm` — Form for requesting new courses: title, description, category, urgency
- `CourseRequestsList` — Admin view of all requests with status management
- `MarketplaceFilters` — Category, difficulty, duration, featured/trending tabs

**Navigation:** Add "Course Marketplace" to Org Admin sidebar navigation items in `navigationItems.tsx`

---

### 4.9 Vercel Integration

**Current State:** No Vercel configuration exists. The app uses Next.js 14 but deployment platform is not configured in the codebase. No `vercel.json`, no Vercel-specific packages.

**What to Build:**

**Deployment Configuration:**
```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/streak-reset", "schedule": "0 0 * * *" },
    { "path": "/api/cron/certificate-expiry", "schedule": "0 8 * * *" },
    { "path": "/api/cron/learning-reminders", "schedule": "0 9 * * 1-5" },
    { "path": "/api/cron/leaderboard-refresh", "schedule": "*/30 * * * *" },
    { "path": "/api/cron/overdue-courses", "schedule": "0 7 * * *" }
  ]
}
```

**Multi-Tenant Middleware Enhancement:**
The existing `src/middleware.ts` handles Supabase session updates. Extend it for tenant resolution:
- Extract hostname from `request.headers.get('host')`
- Resolve tenant from subdomain (`acme.jadarat.com` → tenant `acme`)
- Support custom domains via CNAME (lookup in DB or Vercel Edge Config)
- Set `x-tenant-slug` header for downstream route handlers
- Cache tenant config in Vercel KV for fast resolution

**Key Integrations:**
| Integration | Purpose | Package |
|-------------|---------|---------|
| Vercel AI SDK | Streaming chatbot responses | `ai`, `@ai-sdk/react` |
| Vercel Cron | Streak resets, reminders, leaderboard refresh | Built-in (vercel.json) |
| Vercel Analytics | Web Vitals, performance monitoring | `@vercel/analytics` |
| Vercel KV | Tenant config caching, rate limiting | `@vercel/kv` |
| ISR | Course catalog page caching | Built-in (revalidate) |

**ISR for Course Catalog:**
```typescript
// Course catalog pages revalidate every hour
export const revalidate = 3600;

// On-demand revalidation when admin publishes a course
import { revalidatePath } from 'next/cache';
revalidatePath('/courses');
```

**CI/CD Pipeline:**
- Every push → Vercel preview deployment with unique URL
- PR comments show preview URL + deployment status
- Merge to main → production deployment
- Environment variables scoped per environment (dev/preview/production)

**Pricing:** Start with Vercel Pro ($20/user/mo). Unlimited custom domains, 1TB bandwidth, 40hrs serverless execution. Enterprise only needed for multi-region, WAF, SLA.

---

### 4.10 Certificate Builder & Per-Course Certificate Assignment

**Current State:** Certificates generated via Placid.io with a single template per organization. Customization limited to logo, signature, background color, and auth title in `organization_settings`. All courses in an org use the same certificate template.

**What to Build:**

**Certificate Builder:**
- Drag-and-drop certificate template editor
- Elements: static text, dynamic text fields (learner name, course title, date, org name), images, QR code, shapes/borders
- Multiple templates per organization
- Template preview with sample data
- Arabic and English template variants
- Duplicate template for quick creation

**Per-Course Certificate Assignment:**
- When creating/editing a course, admin selects which certificate template to use from a dropdown
- Different courses can have different certificate designs
- Option: "No certificate" for courses that don't award certificates
- Certificate preview on course detail page showing what learner will receive

**Database Schema:**

```sql
CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organization(id),
    name TEXT NOT NULL,
    ar_name TEXT,
    template_data JSONB NOT NULL,
    thumbnail_url TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_template_id UUID REFERENCES certificate_templates(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN DEFAULT true;

-- Enhance user_certificates
ALTER TABLE user_certificates ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES certificate_templates(id);
ALTER TABLE user_certificates ADD COLUMN IF NOT EXISTS certificate_data JSONB;
ALTER TABLE user_certificates ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT now();
```

**Template Data Structure (JSONB):**
```json
{
  "width": 1200,
  "height": 850,
  "orientation": "landscape",
  "background": { "color": "#FFFFFF", "image_url": null },
  "elements": [
    {
      "id": "1",
      "type": "text",
      "x": 600, "y": 100,
      "content": "Certificate of Completion",
      "style": { "fontSize": 36, "fontWeight": "bold", "color": "#1a1a1a", "textAlign": "center" }
    },
    {
      "id": "2",
      "type": "dynamic_text",
      "x": 600, "y": 250,
      "field": "learner_name",
      "style": { "fontSize": 28, "color": "#333" }
    },
    {
      "id": "3",
      "type": "dynamic_text",
      "x": 600, "y": 350,
      "field": "course_title",
      "style": { "fontSize": 20, "color": "#666" }
    },
    {
      "id": "4",
      "type": "dynamic_text",
      "x": 600, "y": 450,
      "field": "completion_date",
      "style": { "fontSize": 16, "color": "#999" }
    },
    {
      "id": "5",
      "type": "image",
      "x": 100, "y": 50,
      "width": 150, "height": 150,
      "field": "org_logo"
    },
    {
      "id": "6",
      "type": "qr_code",
      "x": 1000, "y": 650,
      "size": 100,
      "field": "verification_url"
    }
  ]
}
```

**PDF Generation Options:**
1. **Keep Placid.io** — Use dynamic templates via Placid API (current approach, external dependency)
2. **`@react-pdf/renderer`** — Generate PDFs from React components server-side (full control, no external dependency, supports Arabic fonts)
3. **`jsPDF` + Canvas** — Render certificate on HTML5 Canvas, convert to PDF

**Recommendation:** Migrate to `@react-pdf/renderer` for full control, Arabic font support, and zero external dependency. Keep Placid.io as fallback during transition.

**UI Components:**
- `CertificateBuilder` — Canvas-based drag-and-drop editor (use HTML5 Canvas or a library like `fabric.js`)
- `CertificateCanvas` — Live preview rendering with sample data
- `ElementToolbar` — Add text, image, QR code, dynamic field elements
- `ElementProperties` — Edit panel for selected element (position, style, content)
- `TemplateSelector` — Dropdown in course form to select certificate template
- `TemplateGallery` — Grid of templates with edit/delete/duplicate/set-as-default actions
- `CertificatePreview` — Modal preview with real learner data before issuing

---

### 4.11 Authoring Tool

**Current State:** Uses Coassemble headless API for course authoring via iframe-based editor. Coassemble provides drag-and-drop course building, interactive lessons, and assessments. The integration is functional and production-ready.

**Strategic Assessment:** Building a full authoring tool is a **major product effort** equivalent to building a standalone SaaS product. Coassemble, Articulate, and Adobe Captivate each represent years of dedicated product development. This should be treated as a separate initiative with its own team and timeline.

**Phased Approach:**

**Phase 1 — Enhanced Coassemble Integration (Short-term, within current sprints):**
- Better API integration for syncing content metadata back to Jadarat
- Extract quiz/assessment data from Coassemble Reporting API for local analytics (feeds into Quiz Results feature)
- AI-assisted content suggestions that feed into Coassemble authoring

**Phase 2 — Simple Native Authoring (Medium-term, 3-6 months):**
- Document-based course builder: upload PDF/DOCX, auto-structure into lessons
- Simple lesson builder: rich text + images + embedded video (TipTap editor)
- Native quiz builder with question bank (ties directly into Quiz Results feature 3.3)
- Template-based course creation from learning objectives

**Phase 3 — Full Authoring Tool (Long-term, separate product, 12+ months):**
- Drag-and-drop lesson builder with interactive elements
- Rich media: video recording, screen capture, image annotation
- Interactive elements: hotspots, drag-and-drop activities, branching scenarios
- Collaborative authoring (multiple authors on same course)
- SCORM/xAPI package export
- AI-powered full course generation from objectives

**Phase 2 Database Schema (Native Quiz + Simple Lessons):**

```sql
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ar_title TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE module_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    ar_title TEXT,
    type TEXT NOT NULL CHECK (type IN ('text', 'video', 'document', 'quiz')),
    content JSONB,
    position INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    module_id UUID REFERENCES course_modules(id),
    question_text TEXT NOT NULL,
    ar_question_text TEXT,
    type TEXT NOT NULL CHECK (type IN ('mcq', 'true_false', 'fill_blank', 'matching', 'essay')),
    options JSONB,
    correct_answer TEXT,
    points INTEGER DEFAULT 10,
    explanation TEXT,
    ar_explanation TEXT,
    position INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

**Recommendation:** For the immediate roadmap, keep Coassemble for rich interactive content. Build Phase 2 (native quiz builder + simple lessons) to reduce Coassemble dependency and own quiz data locally. Defer Phase 3 entirely until the core platform features are mature.

---

## 5. UI/UX Overhaul Plan

Based on a thorough audit of the current codebase, the platform has a functional UI built with shadcn/ui and Tailwind CSS but needs significant improvements for enterprise-grade UX.

### 5.1 Current UI/UX Issues

**Navigation & Layout:**
- Inconsistent navigation across roles: the learner role has a dedicated sidebar (`LearnerHOC` renders a 300px `<aside>` with search, recent courses, and insights), while admin roles (LMS Admin, Org Admin, Super Admin) use only a top-level horizontal `<nav>` inside the `Navbar` component with no sidebar
- No breadcrumbs anywhere in the app (zero files reference "breadcrumb" across the entire codebase)
- Weak active state indicators: active links differ only by `text-foreground` vs `text-muted-foreground` color swap via `twMerge` -- no underline, background highlight, or left border indicator
- Mobile nav (`SideNavMobile`) is a flat list of text links inside a `Sheet` component with no hierarchy, no icons, and no grouping by section
- No loading state for route transitions: no `loading.tsx` files exist in the app directory, and no `NProgress` or `Suspense` boundaries are used for page transitions (though `nextjs-toploader` is installed in `package.json`, its usage is minimal)

**Design System Gaps:**
- Only 8 semantic color tokens defined in `globals.css`: `primary`, `secondary`, `destructive`, `success`, `muted`, `accent`, `popover`, `card` -- missing `info`, `warning`, primary shade scale (50-900), and dark mode `success` token
- No typography scale defined: text sizes are used arbitrarily (`text-2xl`, `text-sm`, `text-lg`, `text-4xl`) without a centralized scale or responsive size system
- Inconsistent spacing: `p-6` on the learner dashboard, `p-4 sm:p-6` on admin insights, `p-4 md:px-6` on the navbar, `gap-4` and `gap-6` and `gap-8` used interchangeably
- Border radius defined only at three levels (`lg`, `md`, `sm`) all derived from a single `--radius: 0.5rem` variable, but components apply `rounded-md`, `rounded-lg`, `rounded-full` inconsistently
- `Skeleton` component is a single `<div>` with `animate-pulse rounded-md bg-muted` -- no preset variants for cards, tables, forms, or profile avatars

**Component Issues:**
- `Button` component (`src/components/ui/button.tsx`) has no loading state: no `isLoading` prop, no spinner, no disabled-while-loading behavior -- async operations (logout, form submit, enrollment) show no pending feedback
- Form fields lack help text slots, real-time validation display, and required field indicators (no asterisk on labels, no `FormDescription` component usage)
- `DataTable` (`src/components/ui/data-table.tsx`) is missing: row selection (no checkbox column), bulk actions (no select-all + action bar), global search/filter input, row expansion, and mobile card view (on small screens, the table wraps in `overflow-auto` with horizontal scroll)
- Error page (`src/app/error.tsx`) is bare: displays only `error.message` in red text and a "Back to home page" button -- no illustration, no error code display, no retry button, no contextual help
- Toast notifications (both Radix `toast.tsx` and `sonner`) have no grouping/deduplication, no persistent option, and no action buttons

**Course UI:**
- Course cards (`src/components/app/home/learnerDashboard/Course.tsx`) have inconsistent heights in grids: cards with descriptions use `ReadMore` (variable text length), cards with progress bars show percentage -- no `line-clamp` or fixed height container enforced
- Course catalog (`LearnerDashboard`) lacks sorting options (no sort by name, date, popularity) and proper pagination (all courses rendered at once via `.map()`)
- Course player has no breadcrumb trail, no "Next Lesson" button, no keyboard shortcuts for video control or lesson navigation
- Missing course metadata display: no enrollment count, no rating/stars, no instructor name, no estimated completion time shown on cards

**Responsive Design:**
- Inconsistent breakpoint usage: some components start responsive at `sm:` (640px), others skip directly to `md:` (768px); the learner sidebar hides at `md:hidden` while the navbar hides at `lg:hidden`
- Tables use horizontal scroll on mobile (`min-w-full lg:max-w-[700px] overflow-auto`) instead of switching to a card/list layout
- Forms not optimized for mobile: no taller touch targets, no `enterKeyHint` attributes, no auto-zoom prevention on focus
- No safe area support for notched phones (`env(safe-area-inset-*)` not used anywhere)
- Dashboard stat grids use different column counts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` in admin insights vs `grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3` for course cards -- breaking at inconsistent tablet widths

**RTL Issues:**
- Inconsistent `isRTL` checks: 16 files reference `isRTL` from `useLanguage()`, but most components do not check it at all -- layout direction depends entirely on the root `document.dir` set by the `LanguageContext`
- Icon mirroring incomplete: arrow icons and chevrons (e.g., `ArrowUpRight` in DataTable "View All" button) are not flipped in RTL mode
- Dialog positioning: `DropdownMenuContent` aligns via `isRTL ? "start" : "end"` in the navbar, but other dropdown instances and dialogs do not perform this check
- `SheetContent side="left"` in `SideNavMobile` is hardcoded and does not swap to `"right"` in RTL mode
- No Hijri calendar: `react-day-picker` is installed but only supports Gregorian dates, with no Hijri calendar integration

### 5.2 Design System Recommendations

**Color System Enhancement:**
```css
:root {
  /* Primary scale (add these to existing HSL vars) */
  --primary-50: 203.41 30% 96%;
  --primary-100: 203.41 30% 88%;
  --primary-200: 203.41 30% 72%;
  --primary-300: 203.41 30% 55%;
  --primary-400: 203.41 30% 40%;
  --primary-500: 203.41 30% 33%;
  --primary-600: 203.41 30% 26%; /* current primary */
  --primary-700: 203.41 30% 20%;
  --primary-800: 203.41 30% 14%;
  --primary-900: 203.41 30% 10%;

  /* Semantic additions */
  --info: 217 91% 60%;
  --info-foreground: 0 0% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 9%;
}
```

**Typography Scale:**
```
Display: 36px / 40px line-height (page titles)
Heading 1: 30px / 36px (section titles)
Heading 2: 24px / 32px (card titles)
Heading 3: 20px / 28px (subsection titles)
Body Large: 18px / 28px (hero text)
Body: 16px / 24px (default)
Body Small: 14px / 20px (secondary text)
Caption: 12px / 16px (timestamps, labels)

Use responsive sizes: text-xl md:text-2xl lg:text-3xl
```

**Spacing Scale (standardize):**
```
xs: 4px (0.25rem) - tight spacing between inline elements
sm: 8px (0.5rem) - compact spacing
md: 16px (1rem) - default gap between elements
lg: 24px (1.5rem) - section padding
xl: 32px (2rem) - major section gaps
2xl: 48px (3rem) - page-level spacing
```

**Standardized Responsive Grid:**
```
Cards: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4
Dashboard stats: grid-cols-2 md:grid-cols-4 gap-4
Two-column layout: grid-cols-1 md:grid-cols-[300px_1fr] gap-6
Content + sidebar: grid-cols-1 lg:grid-cols-[1fr_350px] gap-6
```

### 5.3 Learner Experience Redesign

**Enhanced Learner Dashboard Layout:**

```
+------------------------------------------------------+
| TOP BAR: Search | Notifications | AI Chat | Profile  |
+------------------------------------------------------+
|                                                        |
|  HERO: Continue Learning                              |
|  +----------------------------------------------------+
|  | [Thumbnail]  Course: Advanced Data Analysis        |
|  |              Module 4: Regression Models            |
|  |              ################......  67%            |
|  |              ~45 min left  [> Resume Learning]      |
|  +----------------------------------------------------+
|                                                        |
|  STATS ROW                                            |
|  +------+ +------+ +------+ +------+                  |
|  | 14   | |23.5h | | 8    | |Top   |                  |
|  | day  | |this  | |courses| |15%   |                  |
|  |streak| |month | |done  | |dept  |                  |
|  +------+ +------+ +------+ +------+                  |
|                                                        |
|  IN PROGRESS (3)                    [View All ->]      |
|  +--------+ +--------+ +--------+                      |
|  |[thumb] | |[thumb] | |[thumb] |                      |
|  |#### 45%| |## 20%  | |#####80%|                      |
|  |Due:Mar | |Due:Apr | |No DL   |                      |
|  +--------+ +--------+ +--------+                      |
|                                                        |
|  RECOMMENDED FOR YOU                [View All ->]      |
|  +--------+ +--------+ +--------+                      |
|  |****    | |*****   | |****    |                      |
|  |2.5h Med| |1h Beg  | |4h Adv  |                      |
|  |12 peers| |Trending| |New!    |                      |
|  +--------+ +--------+ +--------+                      |
|                                                        |
|  ACHIEVEMENTS | DEADLINES                              |
|  +------------------+ +--------------------+           |
|  | Quick Learner    | | Quiz Due Feb 22    |           |
|  | 7-day streak     | | Cert Due Mar 1     |           |
|  | First Course     | |                    |           |
|  +------------------+ +--------------------+           |
|                                                        |
|  LEADERBOARD WIDGET      ANNOUNCEMENTS                |
|  +------------------+ +--------------------+           |
|  | 1. Ahmad  1250pts| | New course launch  |           |
|  | 2. Sara   1100pts| | Q1 review starts   |           |
|  | 3. Omar    980pts| |                    |           |
|  | #23 You    420pts| |                    |           |
|  +------------------+ +--------------------+           |
+------------------------------------------------------+
```

**Key Learner Experience Improvements:**
1. **One-click resume**: Hero section shows current course with resume button that drops into exact lesson and timestamp where the learner left off
2. **Learning streaks**: Duolingo-style streak counter with flame icon, streak freeze (purchasable with XP), and push notification reminders to maintain streak
3. **Spaced repetition**: Schedule review prompts at 1, 3, 7, 14, 30 days after course completion to reinforce retention
4. **Social proof**: "12 peers in your department completed this" displayed on course cards; "Trending in your organization" badges on popular courses
5. **Progress visualization**: Skill radar chart (Recharts is already installed in `package.json`), weekly completion heatmap, monthly learning hours trend line
6. **Micro-interactions**: Confetti on course completion (framer-motion and lottie-react are already installed), XP counter animation on point earn, badge pop-in animation on achievement unlock
7. **Quick actions bar**: Browse catalog, view certificates, ask AI assistant, join discussion -- always accessible from dashboard
8. **Smart notifications**: Deadline warnings (7 days, 3 days, 1 day before due), streak risk alerts ("Your 14-day streak ends tomorrow!"), personalized new course recommendations based on completed topics

**Course Player Improvements:**
```
+--------------------------------------------------+
| [<- Back] Course Title              [?] [gear] [X]|
+--------------------------------------------------+
| SIDEBAR (collapsible) | MAIN CONTENT              |
| ----------------      |                            |
| [done] Module 1       | [Video/SCORM/Content]      |
|   [done] Lesson 1.1   |                            |
|   [>] Lesson 1.2 <-   |                            |
|   [ ] Lesson 1.3      |                            |
|   [locked] Quiz 1     | [Notes] [Bookmarks]        |
| [ ] Module 2          |                            |
|   [ ] Lesson 2.1      |                            |
|                        | -------------------------  |
| Progress: 45%          | [<- Prev]  3/12  [Next ->] |
| ######........         |                            |
+--------------------------------------------------+
```

Key improvements:
- Collapsible sidebar with module/lesson tree showing completion indicators (checkmark, current dot, empty circle, lock icon)
- Bottom navigation bar with Previous / Lesson counter / Next controls
- Notes panel: per-lesson note-taking with auto-save and export
- Bookmarks: mark any lesson or timestamp for quick return
- Keyboard shortcuts: Space = play/pause video, N = next lesson, P = previous lesson, B = add bookmark, S = toggle sidebar, F = toggle fullscreen/distraction-free mode
- Distraction-free mode: collapse sidebar, minimize header to thin strip, maximize content area

### 5.4 Admin Dashboard Improvements

**LMS Admin Dashboard Enhancements:**
- Add trend indicators (up/down arrows with green/red coloring) on stat cards -- the `CardStatus` component currently receives a `percent` prop but does not display trend direction
- Add responsive font sizes on stat numbers (`text-lg md:text-2xl`) to prevent overflow on mobile
- Add quiz results tab in the insights navigation -- currently only General, Students, Enrollments, Completions, Courses tabs exist in `nav-lms.hoc.tsx`
- Add course status pie chart (draft/published/archived breakdown) using Recharts or Nivo (both already installed)
- Add leaderboard overview widget showing top 5 learners by completion rate
- Add announcement management section for creating and targeting org-wide or course-level announcements
- Replace horizontal scroll tables with card layout on mobile: `DataTable` currently wraps in `overflow-auto` for all screen sizes

**Org Admin Dashboard Enhancements:**
- Course marketplace access button: allow org admins to browse and enable/disable courses from a shared catalog
- Organization learning metrics: total learning hours this month, overall completion rate, number of active learners this week
- Subscription usage indicators: current user count vs. tier limit, courses used vs. tier limit, managers assigned vs. tier limit -- with visual progress bars showing consumption
- Quick enable/disable course toggles directly on the course list view
- Certificate template management access: link to certificate builder for creating org-branded templates

### 5.5 Component Upgrade Plan

| Component | Current Issue | Upgrade |
|-----------|--------------|---------|
| `Button` | No loading state -- `ButtonProps` extends only `HTMLButtonAttributes` with no `isLoading` prop; async actions (logout, enroll, form submit) give no pending feedback | Add `isLoading` prop with inline `Loader2` spinner from lucide-react; auto-disable when loading; maintain button width during loading state |
| `Skeleton` | Single `<div>` with `animate-pulse rounded-md bg-muted` and no variants; usage across the app is ad-hoc (e.g., `<Skeleton className="w-[120px] h-[40px]" />` for logo, inline for table rows) | Add `CardSkeleton`, `TableSkeleton`, `FormSkeleton`, `AvatarSkeleton`, `StatCardSkeleton` preset components with consistent dimensions matching their real counterparts |
| `DataTable` | No global search input, no row selection checkboxes, no bulk action bar, no row expansion, no mobile responsive card view; empty state is plain "No results." text | Add global search filter input, row checkbox column with select-all, bulk action toolbar (delete, export, assign), expandable row detail, responsive card layout below `md` breakpoint |
| `Form fields` | No help text below inputs, no required field asterisk on labels, validation errors show only via toast not inline, border color does not change on error state | Add `FormDescription` component for help text, render red asterisk on required `FormLabel`, show inline error message below field with `text-destructive`, apply `border-destructive` on error |
| `Error page` | Shows only `error.message` in `text-destructive` and a "Back to home page" button; no retry, no error code, no illustration | Add SVG illustration (animated face from `not-found.tsx` pattern), add `reset()` retry button, display error code/type, add "Contact support" link, add contextual breadcrumb |
| `Navigation` | No breadcrumb component exists; active link state is only `text-foreground` color change with no visual weight | Add a `Breadcrumb` component using Radix primitives; upgrade active link to include `border-b-2 border-primary` underline or `bg-primary/10` background highlight |
| `Course Card` | Inconsistent height: `ReadMore` with variable word count and optional progress bar create jagged grid layouts; no metadata (rating, duration, enrollment count) | Enforce fixed card height with `line-clamp-2` on title, `line-clamp-3` on description; add metadata row showing duration estimate, star rating, and enrollment count |
| `Mobile Nav` | `SideNavMobile` renders flat `grid gap-6 text-lg` list of `Link` elements; no icons, no grouping, no section dividers | Group navigation items by section (e.g., "Analytics", "Content", "Management"); add lucide-react icons per item; add active state background; add section dividers |
| `Toast` | Sonner and Radix toast both available but with no deduplication; toasts auto-dismiss with no persistent option; no action button support | Add deduplication logic (prevent duplicate messages within 2s), add `persistent: true` option for critical alerts, add action button slot for "Undo" / "Retry" patterns |

---

## 6. Architecture & Infrastructure

### 6.1 Vercel Deployment Architecture

```
+-----------------------------------------------------+
|                  Vercel Platform                      |
|                                                       |
|  +-------------+  +--------------+  +-------------+  |
|  | Edge        |  | Serverless   |  | Vercel Cron  | |
|  | Middleware   |  | Functions    |  | Jobs         | |
|  | (tenant     |  | (API routes, |  | (streaks,    | |
|  |  routing)   |  |  AI chat)    |  |  reminders)  | |
|  +------+------+  +------+-------+  +------+-------+ |
|         |                |                  |         |
|  +------v----------------v------------------v-------+ |
|  |              Next.js 14 App Router                | |
|  |  ISR catalog pages | SSR dashboard | Static assets| |
|  +---------------------------+-----------------------+ |
+-----------------------------|-------------------------+
                              |
              +---------------+---------------+
              v               v               v
       +------------+  +-----------+  +------------+
       | Supabase   |  | LLM APIs  |  | AWS S3     |
       | (DB, Auth, |  | (OpenAI,  |  | (certs,    |
       |  Storage,  |  |  Claude,  |  |  SCORM)    |
       |  Realtime) |  |  Gemini)  |  |            |
       +------------+  +-----------+  +------------+
```

The current codebase uses Next.js 14 App Router with server components and server actions. Supabase provides authentication (email/password + MFA), Postgres database with RLS, and file storage. The deployment target is Vercel, which enables:

- **Edge Middleware**: Tenant resolution from domain/subdomain, auth token validation, and locale detection at the edge before hitting serverless functions
- **Serverless Functions**: API routes and server actions run as isolated serverless functions; AI chat endpoints will use streaming responses via Vercel AI SDK
- **Vercel Cron Jobs**: Scheduled tasks for streak calculation (daily at midnight per timezone), deadline reminders (daily scan), certificate expiry checks (weekly), and leaderboard materialized view refresh (hourly)
- **ISR (Incremental Static Regeneration)**: Course catalog pages can be statically generated and revalidated on publish events, reducing database load for high-traffic browse pages
- **Preview Deploys**: Every pull request gets a unique preview URL for QA and stakeholder review before merging

### 6.2 AI Gateway Architecture

```
+------------------------------------------------------+
|                    AI Gateway                          |
|                                                        |
|  +----------------------------------------------------+
|  |              Vercel AI SDK (useChat)                |
|  |  Streaming | Tool calling | Multi-provider          |
|  +--------------------+-------------------------------+
|                       |                                 |
|  +--------------------v-------------------------------+
|  |           Per-Org AI Config Router                  |
|  |  Reads org_ai_config -> selects provider/model      |
|  |  Injects org-specific system prompt                 |
|  |  Rate limits per org (50 msg/hr default)            |
|  +--------------------+-------------------------------+
|                       |                                 |
|  +---------+----------+--------+----------------------+
|  | OpenAI  | Claude   | Gemini | Jais (Arabic)        |
|  | gpt-4o  | sonnet   | pro    | jais-30b             |
|  +---------+----------+--------+----------------------+
|                       |                                 |
|  +--------------------v-------------------------------+
|  |     pgvector (Supabase) -- Course Embeddings        |
|  |     RAG: retrieve relevant course chunks            |
|  +----------------------------------------------------+
+------------------------------------------------------+
```

The AI Gateway is the central routing layer for all AI features. Key design decisions:

- **Per-Organization Configuration**: Each organization stores its AI preferences in an `org_ai_config` table (provider, model, API key, system prompt, rate limits). This allows enterprise clients to bring their own API keys or choose providers based on data sovereignty requirements.
- **Vercel AI SDK**: The `useChat` hook provides streaming responses, tool calling (for structured actions like "enroll me in course X"), and automatic provider abstraction. The SDK handles SSE streaming, message history, and retry logic.
- **RAG Pipeline**: Course content is chunked and embedded into pgvector (Supabase extension). When a learner asks a question, the system retrieves the top-K relevant chunks from enrolled courses and injects them as context into the LLM prompt.
- **Arabic-First Routing**: When the user's language context is Arabic, the router can prefer Jais (G42's Arabic-optimized model) for conversational queries while falling back to Claude or GPT-4o for complex reasoning tasks.
- **Rate Limiting**: Per-organization rate limits prevent runaway costs. Default: 50 messages/hour per user, configurable per subscription tier.

### 6.3 Gamification Event Architecture

```
+-------------------+
| Learner Action     |  (course complete, quiz pass, login, badge trigger)
+--------+----------+
         |
+--------v----------+
| Gamification       |
| Event Handler      |  (Supabase DB trigger or API middleware)
+--------------------+
| 1. Calculate pts   |  (base x multiplier x bonuses)
| 2. Update streak   |  (check last_activity_date, increment/reset)
| 3. Check badges    |  (evaluate all badge triggers)
| 4. Check level     |  (total_points -> level lookup)
| 5. Check challs    |  (update challenge progress)
| 6. Notify learner  |  (in-app + push: "You earned 150 XP!")
+--------+-----------+
         |
+--------v----------+
| Points Transaction |  (INSERT into points_transactions)
| Leaderboard Sync   |  (REFRESH materialized view)
| Badge Award        |  (INSERT into user_badges if new)
| Level Up           |  (UPDATE user_points.level)
| Notification       |  (INSERT into notifications)
+--------------------+
```

The gamification system is event-driven. Every qualifying learner action triggers a pipeline that:

1. **Calculates points**: Base points (defined per action type in `points_config`) multiplied by any active multipliers (e.g., 2x weekend bonus, 1.5x streak bonus) plus any challenge-specific bonuses
2. **Updates streak**: Compares `last_activity_date` with current date. If consecutive day, increment streak counter. If gap > 1 day and no streak freeze active, reset to 1. Update `longest_streak` if current exceeds it.
3. **Checks badge triggers**: Iterates all badge definitions with `trigger_type` matching the action. For threshold badges (e.g., "Complete 10 courses"), checks current count against threshold. Awards badge if met and not already earned.
4. **Checks level**: Compares new `total_points` against level thresholds. If threshold crossed, updates level and triggers level-up celebration.
5. **Checks challenges**: If active time-bound challenges exist, updates progress counters. Marks challenge complete if target met within deadline.
6. **Sends notification**: Creates in-app notification with animation trigger data (confetti type, XP amount, badge image URL). Optionally sends push notification for significant achievements.

### 6.4 Notification System Architecture

```
+---------------+     +----------------+     +---------------------+
| Event Source   |---->| Event Bus      |---->| Notification         |
| (DB trigger,  |     | (Supabase      |     | Workers              |
|  API action,  |     |  Realtime or   |     | +-- In-App (WS)      |
|  Cron job)    |     |  pg_notify)    |     | +-- Email (Resend)    |
+---------------+     +----------------+     | +-- Push (FCM)        |
                                              | +-- SMS (Twilio)      |
                                              +---------------------+
```

The notification system uses Supabase Realtime (WebSocket subscriptions) for instant in-app delivery and workers for asynchronous channels:

- **In-App**: Supabase Realtime subscription on the `notifications` table filtered by `user_id`. The client receives new rows instantly and renders them in the notification center bell icon. Supports mark-as-read, mark-all-as-read, and bulk delete.
- **Email**: Resend API (already integrated for enrollment emails) with HTML templates for each notification type. Batched delivery for non-urgent notifications (daily digest option). Respects user notification preferences.
- **Push**: Firebase Cloud Messaging (FCM) for web push. Service worker registration during PWA install. Used for streak risk alerts, deadline warnings, and achievement celebrations.
- **SMS**: Twilio integration (config structure exists in codebase) for critical alerts: overdue mandatory training, certificate expiry, account security. Optional per-org, billed separately.

### 6.5 Certificate Builder Architecture

```
+-------------------------------------------------+
|              Certificate Builder                  |
|                                                   |
|  Admin UI (React)                                |
|  +----------------------------------------------+
|  | Canvas Editor (drag-and-drop)                 |
|  | +------+ +------+ +------+ +----------------+|
|  | | Text | |Image | | QR   | | Dynamic        ||
|  | |fields| |upload| | Code | | Variables       ||
|  | +------+ +------+ +------+ +----------------+|
|  +----------------------------------------------+
|                    |                              |
|                    v  save template_data (JSONB)  |
|  +----------------------------------------------+
|  | Template Storage (certificate_templates)       |
|  +----------------------+-----------------------+
|                          |                        |
|                          v  on course completion  |
|  +----------------------------------------------+
|  | PDF Renderer (@react-pdf/renderer)            |
|  | 1. Load template_data                         |
|  | 2. Inject dynamic vars (name, course...)      |
|  | 3. Render PDF with Arabic font support        |
|  | 4. Upload to S3                               |
|  | 5. Store URL in user_certificates             |
|  +----------------------------------------------+
+-------------------------------------------------+
```

The certificate builder replaces the current Placid.io dependency with an in-house solution:

- **Canvas Editor**: A React-based drag-and-drop editor where admins position text fields, images, QR codes, and decorative elements on a certificate canvas. Templates are stored as JSONB in the `certificate_templates` table.
- **Dynamic Variables**: Placeholders like `{{learner_name}}`, `{{course_title}}`, `{{completion_date}}`, `{{certificate_id}}`, `{{organization_name}}` are injected at render time. Arabic names render correctly using embedded Arabic fonts.
- **PDF Rendering**: `@react-pdf/renderer` (already partially in the dependency tree via `@react-pdf-viewer/thumbnail`) generates server-side PDFs. For Arabic text, the renderer uses a bundled Arabic font (e.g., Noto Naskh Arabic) with RTL text direction.
- **QR Verification**: Each certificate includes a QR code linking to a public verification page (`/verify/{certificate_id}`) that displays certificate authenticity, issue date, and course details without requiring login.
- **Multi-Template Support**: Organizations can create multiple templates (formal, casual, achievement-specific) and assign different templates to different courses.

---

## 7. Prioritized Roadmap

### Phase 0: Foundation & Infrastructure
> **Focus: DevOps, quality, and deployment**

1. **Vercel Integration** -- Create `vercel.json` configuration, enhance Edge Middleware for tenant routing with CNAME support, set up CI/CD with preview deploys on every PR, configure environment variables and secrets
2. **Database Migrations** -- Export current Supabase schema as baseline migration, establish Supabase CLI migration workflow (`supabase db diff`, `supabase db push`), create migration files for all new tables
3. **Testing Framework** -- Set up Vitest for unit tests and Playwright for E2E tests, write tests for critical flows: authentication (login, MFA, registration), enrollment lifecycle, SCORM player initialization, role-based access control
4. **Error Monitoring** -- Sentry integration with source maps, custom error boundaries per route segment, performance tracing for server actions and API routes
5. **CI/CD Pipeline** -- GitHub Actions workflow: lint (ESLint), type-check (TypeScript), unit test (Vitest), E2E test (Playwright), build verification, automatic Vercel deploy on merge to main

### Phase 1: Core Engagement Features
> **Focus: The 13 priority features that define Jadarat's differentiator in the MENA LMS market**

1. **Learning Points System** -- Create `points_config` table (action types, base points, multipliers), `points_transactions` ledger table, `user_points` aggregate table; build admin UI for configuring point values per action; display points in learner dashboard stats row
2. **Course Status Tracking** -- Implement granular course status lifecycle (`draft` -> `review` -> `published` -> `archived` -> `suspended`), add color-coded status badges in admin course list, add status filter/sort in DataTable, add status change audit trail
3. **Gamification Engine** -- Build levels system (XP thresholds per level, level names), daily/weekly streaks with streak freeze mechanic, time-bound challenges with configurable goals, celebration animations on level-up and challenge completion
4. **Leaderboard** -- Create materialized view for organization-wide and department-level rankings, build leaderboard page with time filters (weekly, monthly, all-time), add privacy controls (opt-out, anonymous mode), add leaderboard widget to learner dashboard
5. **Learner Badges** -- Define system badges (First Course, Speed Learner, Perfect Quiz, 30-Day Streak) with automatic triggers, allow LMS admins to create custom badges with custom icons and trigger conditions, build badge gallery page, add LinkedIn sharing for earned badges
6. **Quiz Results for LMS Admin** -- Parse SCORM `cmi.interactions` data to extract individual question results, build quiz analytics dashboard with question-level difficulty and discrimination indices, add export to Excel, add charts for score distribution and pass/fail rates

### Phase 2: AI & Intelligence
> **Focus: Deliver the "Arabic AI-Powered LMS" promise -- the primary market differentiator**

1. **AI Chatbot** -- Install Vercel AI SDK, implement `useChat` hook with streaming responses, build chat UI panel (slide-in drawer on learner pages), integrate RAG pipeline: embed course content into pgvector, retrieve relevant chunks per query, inject as context; store conversation history in `ai_conversations` table
2. **Per-Org AI Configuration** -- Create `org_ai_config` table (provider, model, API key encrypted, system prompt, rate limits, enabled flag), build Org Admin settings page for AI configuration, implement config router in AI Gateway that reads org config and selects appropriate provider
3. **AI Content Recommendations** -- Analyze learner's completed courses, quiz performance, and role/department to generate personalized "Recommended For You" section; use collaborative filtering (learners in similar roles) combined with content-based similarity (course embeddings); display recommendations on dashboard and catalog pages
4. **AI-Powered Arabic Search** -- Enable pgvector extension in Supabase, create embedding pipeline for course titles/descriptions/content in both Arabic and English, implement semantic search API route that embeds query and performs cosine similarity search, build search UI with results ranked by relevance

### Phase 3: Content & Certificates
> **Focus: Content management and credential infrastructure -- replacing external dependencies**

1. **Certificate Builder** -- Build drag-and-drop template editor with React DnD or similar, support text fields (with Arabic font selection), image upload (org logo, decorative elements), QR code placement, and dynamic variable insertion; store templates as JSONB; implement PDF renderer with `@react-pdf/renderer` supporting Arabic typography
2. **Per-Course Certificate Assignment** -- Add certificate template selector in course settings (dropdown of org's templates), add enable/disable certificate toggle per course, auto-generate certificate on course completion when enabled, store issued certificates with S3 URL in `user_certificates` table
3. **Course Marketplace** -- Build shared course catalog that Org Admins can browse, create "enable for my organization" workflow with approval, track which organizations have enabled which courses, add usage analytics per marketplace course
4. **Native Quiz Builder** -- Build question creation UI supporting MCQ, true/false, fill-in-blank, matching, ordering, and essay types; implement question bank with tagging and difficulty levels; add configurable grading (pass mark, attempts, time limit, question randomization); store in native `quizzes` and `questions` tables
5. **Simple Native Authoring** -- Build text/document-based lesson creator: rich text editor (Tiptap or similar) for text lessons, file upload for PDF/document lessons, video embed for video lessons; structured as modules containing lessons; outputs stored natively (not Coassemble)

### Phase 4: UI/UX Overhaul
> **Focus: Enterprise-grade user experience across all roles and devices**

1. **Design System** -- Implement full primary color scale (50-900) in `globals.css`, add `info` and `warning` semantic tokens, define and enforce typography scale via Tailwind `fontSize` extension, standardize spacing usage across all pages, document component patterns
2. **Learner Dashboard Redesign** -- Build "Continue Learning" hero section with one-click resume, add stats row (streak, hours, completions, department rank), add "Recommended For You" section (powered by Phase 2 AI), add achievements/deadlines sidebar widgets, add leaderboard preview widget
3. **Course Player Improvements** -- Add collapsible sidebar with module/lesson tree and completion indicators, add bottom Previous/Next navigation bar, implement per-lesson notes and bookmarks, add keyboard shortcuts (Space, N, P, B, S, F), add distraction-free mode
4. **Admin Dashboard Enhancement** -- Add trend direction indicators to stat cards, implement responsive font sizes, add quiz results tab in insights navigation, add course status pie chart, replace horizontal-scroll tables with responsive card layout on mobile
5. **Navigation Overhaul** -- Build `Breadcrumb` component and add to all nested routes, upgrade active link indicators (underline + weight, not just color), add icons to mobile navigation, group navigation items by section with dividers, fix `SheetContent` side for RTL
6. **Component Upgrades** -- Add `isLoading` prop to Button with spinner, create Skeleton presets (Card, Table, Form, Avatar, StatCard), upgrade DataTable with search/selection/mobile-card-view, add FormDescription and required asterisks to form fields, redesign error page with illustration/retry/error-code
7. **RTL Consistency** -- Audit all 16+ files using `isRTL` and standardize approach using CSS logical properties (`margin-inline-start` instead of `ml/mr`), flip all directional icons (chevrons, arrows) in RTL via `rtl:scale-x-[-1]`, fix dialog/dropdown positioning for RTL, swap `SheetContent side` based on direction

### Phase 5: Enterprise & Integrations
> **Focus: Enterprise sales readiness -- features required to close B2B deals with large organizations**

1. **SSO / SAML 2.0** -- Per-tenant IdP configuration stored in `tenant_sso_config` table, support Azure AD, Okta, and OneLogin; use Supabase Auth's SAML provider with per-org metadata URL; add SSO-only login enforcement option per tenant
2. **Learning Paths** -- Build learning path builder with ordered course sequences, enforce prerequisites (must complete Course A before accessing Course B), track path-level progress with visual path map, support auto-enrollment rules based on role/department/group membership
3. **In-App Notifications** -- Build notification center UI (bell icon with unread count, notification list with mark-as-read), create notification templates for all event types (enrollment, completion, deadline, achievement, announcement), implement configurable triggers per org, add multi-channel delivery (in-app, email, push, SMS)
4. **Compliance & Audit Trails** -- Log every admin action (user CRUD, enrollment changes, course publish/unpublish, settings changes) with actor, timestamp, IP address, and before/after state; implement PDPL compliance (consent management, data export endpoint, right-to-erasure workflow); add Saudization tracking (nationality field, Saudi ratio dashboards, Nitaqat-aligned reporting)
5. **HRIS Integrations** -- Build connector framework with OAuth token management and event logging; implement Jisr connector (Saudi HR: sync users, departments, job titles), ZenHR connector (pan-MENA: similar sync), SAP SuccessFactors connector (enterprise: bidirectional training record sync); add sync status dashboard for Org Admins
6. **Hijri Calendar** -- Integrate Hijri calendar library (e.g., `hijri-converter` or `moment-hijri`), add dual calendar mode to all `react-day-picker` instances (toggle between Gregorian and Hijri), display Hijri dates in reports and certificates when enabled per organization

### Phase 6: Authoring Tool (Dedicated Product Initiative)
> **Focus: Building a full course authoring platform — this is a standalone product-level effort with its own team and timeline**
>
> **Why a separate phase:** Authoring tools like Coassemble, Articulate Storyline, and Adobe Captivate each represent years of dedicated product development with specialized teams. This cannot be squeezed into a sprint alongside other features. It deserves its own dedicated phase, budget, and engineering track.

**Phase 6A — Enhanced Coassemble Integration (Quick wins):**
1. **Coassemble API Sync** -- Better metadata sync from Coassemble back to Jadarat (course structure, quiz data, completion events)
2. **Coassemble Reporting Integration** -- Extract quiz/assessment data from Coassemble Reporting API for local analytics (feeds into Quiz Results feature in Phase 1)
3. **AI Content Suggestions** -- AI-assisted content outlines and suggestions that feed into Coassemble authoring workflow

**Phase 6B — Simple Native Authoring (Reduce Coassemble dependency):**
1. **Document-Based Course Builder** -- Upload PDF/DOCX, AI auto-structures into lessons with module/lesson hierarchy
2. **Rich Text Lesson Editor** -- TipTap-based editor for text lessons with images, embedded video, and code blocks
3. **Native Quiz Builder** -- Question creation UI (MCQ, true/false, fill-blank, matching, essay) with question bank, tagging, difficulty levels, configurable grading
4. **Template-Based Course Creation** -- Generate course structure from learning objectives using AI

**Phase 6C — Full Authoring Tool (Standalone product):**
1. **Drag-and-Drop Lesson Builder** -- Visual editor with interactive elements (hotspots, click-to-reveal, tabs, accordions)
2. **Rich Media** -- In-browser video recording, screen capture, image annotation, audio narration
3. **Interactive Elements** -- Drag-and-drop activities, branching scenarios, simulations, embedded H5P content
4. **Collaborative Authoring** -- Multiple authors on same course with real-time co-editing, review/approval workflow, version history
5. **SCORM/xAPI Export** -- Package authored content as SCORM 1.2/2004 or xAPI packages for use in other LMS platforms
6. **AI-Powered Course Generation** -- Full end-to-end course generation from learning objectives: AI generates content, quizzes, images, and interactive elements

---

## 8. Competitive Positioning

### Jadarat vs. Top Competitors (Updated)

| Feature | Jadarat (Current) | Jadarat (Target) | Docebo | TalentLMS | Cornerstone |
|---------|-------------------|------------------|--------|-----------|-------------|
| Arabic-First UI | Weglot translation layer | Native Arabic-first with `next-intl` | No native Arabic | No native Arabic | Partial Arabic support |
| Arabic AI Chatbot | Not implemented | Native Arabic AI with Jais + Claude | Not available | Not available | Not available |
| Per-Org AI Config | Not implemented | Full provider/model selection per org | Not available | Not available | Not available |
| Learning Points | Not implemented | Full XP system with multipliers | Basic points | Points system | Limited |
| Leaderboard | Not implemented | Org/dept rankings with privacy | Organization-level | Organization-level | Limited |
| Badges | Not implemented | System + custom badges with triggers | Badge system | Badge system | Limited |
| Certificate Builder | Placid.io (external) | Native drag-and-drop with Arabic fonts | Template-based | Template-based | Full builder |
| Course Marketplace | Not implemented | Org-level course sharing/enabling | Full marketplace | Limited sharing | Full marketplace |
| Quiz Analytics | Not implemented | Question-level analytics from SCORM | Full analytics | Full analytics | Full analytics |
| SCORM | Implemented (1.2/2004) | Maintained | Supported | Supported | Supported |
| Learning Paths | Not implemented | Ordered sequences with prerequisites | Full paths | Full paths | Full paths |
| SSO/SAML | Not implemented | Per-tenant SAML 2.0 | Supported | Supported | Supported |
| Saudization | Not implemented | Nationality tracking + Nitaqat reports | Not available | Not available | Not available |
| HRIS (MENA) | Not implemented | Jisr, ZenHR, SAP SuccessFactors | No MENA connectors | No MENA connectors | No MENA connectors |
| Hijri Calendar | Not implemented | Dual Gregorian/Hijri with org toggle | Not available | Not available | Not available |
| White-Label | Basic branding (logo, colors, auth bg) | Full white-label (domain, theme, email) | Full white-label | Limited branding | Full white-label |
| Vercel + AI SDK | Not implemented | Edge-first with streaming AI | Not applicable | Not applicable | Not applicable |

### Unique Value Proposition

**Jadarat's moat = Arabic-First + AI (per-org configurable) + Gamification + MENA Compliance**

No competitor in the LMS market offers all four pillars together. The strategic positioning breaks down as follows:

1. **Natively Arabic-first AI chatbot with per-organization model configuration**: Global competitors bolt on Arabic as a translation layer. Jadarat builds Arabic into the foundation -- from UI strings to AI system prompts to semantic search embeddings. Per-org AI configuration lets enterprise clients choose their provider (OpenAI, Claude, Gemini, Jais) based on data sovereignty, cost, or quality preferences. No other LMS offers this.

2. **Built-in gamification (points, badges, leaderboards) designed for Arabic-speaking learners**: While TalentLMS and Docebo offer gamification, their implementations are English-centric. Jadarat's gamification uses Arabic-appropriate metaphors, RTL-native leaderboard layouts, and culturally relevant achievement imagery. The tight integration between gamification and the AI chatbot ("Ask the AI for tips to earn your next badge") creates a unique engagement loop.

3. **MENA-specific compliance (Saudization, PDPL, Hijri calendar)**: Saudi Arabia's Personal Data Protection Law (PDPL, enforced since September 2024) and Saudization/Nitaqat requirements are non-negotiable for Saudi B2B deals. No global LMS platform has implemented these. Jadarat builds compliance into the data model from day one, not as an afterthought integration.

4. **Certificate builder with Arabic typography support**: Generating professional certificates with Arabic calligraphy, RTL text flow, and Hijri dates requires purpose-built infrastructure. Global certificate builders (Accredible, Credly) have minimal Arabic support. Jadarat's native builder handles bidirectional text, Arabic fonts, and dual-date display natively.

5. **Course marketplace for regional B2B content distribution**: A shared catalog of Arabic-language professional development courses that organizations can enable/disable creates a network effect. As more organizations join Jadarat, the content library grows, making the platform more valuable for each new customer. This marketplace model does not exist in the MENA LMS market today.

---

## 9. Add Your Features

> **Use this section to add your own features, priorities, and notes.**

| Feature Name | Description | Priority (P0/P1/P2) | Target Phase |
|--------------|-------------|---------------------|--------------|
| | | | |
| | | | |
| | | | |

---

*This document was generated from a comprehensive audit of the Jadarat LMS codebase combined with industry research on B2B SaaS LMS best practices, AI capabilities, Arabic/RTL requirements, MENA market needs, and competitor analysis.*
