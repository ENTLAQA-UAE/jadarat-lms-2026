## 4. UI/UX Overhaul Plan

Based on a thorough audit of the current codebase, the platform has a functional UI built with shadcn/ui and Tailwind CSS but needs significant improvements for enterprise-grade UX.

### 4.1 Current UI/UX Issues

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

### 4.2 Design System Recommendations

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

### 4.3 Learner Experience Redesign

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

### 4.4 Admin Dashboard Improvements

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

### 4.5 Component Upgrade Plan

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

## 5. Architecture & Infrastructure

### 5.1 Vercel Deployment Architecture

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

### 5.2 AI Gateway Architecture

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

### 5.3 Gamification Event Architecture

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

### 5.4 Notification System Architecture

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

### 5.5 Certificate Builder Architecture

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

## 6. Prioritized Roadmap

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
7. **Authoring Tool Phase 3** -- Full drag-and-drop course authoring with interactive elements (hotspots, branching scenarios, embedded quizzes), multimedia support (video recording, screen capture, audio narration), SCORM export capability; this is a separate product timeline and may warrant its own dedicated development track

---

## 7. Competitive Positioning

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

## 8. Add Your Features

> **Use this section to add your own features, priorities, and notes.**

### Custom Features to Add

| Feature Name | Description | Priority (P0/P1/P2) | Target Phase |
|--------------|-------------|---------------------|--------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

### Client-Specific Requirements

-
-
-

### Notes & Decisions

-
-
-
