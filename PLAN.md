# Subscription Management — Implementation Plan

## Overview
Add full subscription lifecycle management for super admins: control start/end dates, activate/suspend subscriptions, and review upgrade requests — all from a side sheet accessible on each organization row.

---

## Phase 1: Database Migration

**File:** `supabase/migrations/20260223110000_subscription_management.sql`

### 1.1 Convert `start_date` and `expires_at` from TEXT to TIMESTAMPTZ
```sql
ALTER TABLE public.subscriptions
  ALTER COLUMN start_date TYPE timestamptz USING start_date::timestamptz,
  ALTER COLUMN expires_at TYPE timestamptz USING expires_at::timestamptz;
```

### 1.2 Add `is_active` column
```sql
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
```

### 1.3 Add `status` column to `subscription_requests` for tracking approval
```sql
ALTER TABLE public.subscription_requests
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
-- Valid values: 'pending', 'approved', 'dismissed'
```

### 1.4 New RPC: `get_organization_subscription_details(p_org_id int)`
Returns subscription info + tier details + pending requests for a single org.
```
Returns TABLE:
  subscription_id, tier_name, start_date, expires_at, is_active,
  max_user, max_courses, max_lms_managers,
  create_courses, ai_builder, document_builder
```

### 1.5 New RPC: `update_organization_subscription(p_org_id, p_tier_id, p_start_date, p_expires_at, p_is_active)`
Updates the subscription record for an organization. If no subscription exists, creates one.

### 1.6 New RPC: `get_pending_subscription_requests(p_org_id int)`
Returns all pending requests for a given organization.
```
Returns TABLE:
  id, organization_id, requester_id, number_of_users, number_of_courses,
  number_of_content_creators, created_at, status
```

### 1.7 New RPC: `resolve_subscription_request(p_request_id int, p_status text)`
Sets the request status to 'approved' or 'dismissed'.

### 1.8 Update `get_all_organization()`
- Change `subscription_expiration_date` return type from `text` to `timestamptz`
- Add `subscription_start_date timestamptz`, `subscription_is_active boolean` to the return

### 1.9 Update `create_new_organization()`
- Add parameters: `p_start_date timestamptz DEFAULT now()`, `p_expires_at timestamptz DEFAULT (now() + interval '1 year')`
- Use these params instead of hardcoded values

### 1.10 Update `get_organization_subscription()` (used by org admin Redux)
- Return `is_active` in the result set so the org admin can see their status

---

## Phase 2: Type Updates

### 2.1 `src/action/super-admin/orgnizations/type.ts`
- Add to `Organization`: `subscriptionStartDate: Date | null`, `subscriptionIsActive: boolean`
- Update `status` type: `'Active' | 'Expired' | 'Suspended'`

### 2.2 `src/app/dashboard/@super_admin/organizations/type.ts`
- Same changes as 2.1 for the page-level type
- Add new interface `SubscriptionDetails` for the sheet data
- Add new interface `SubscriptionRequest` for pending requests

### 2.3 `src/redux/organization.slice.ts`
- Add `is_active: boolean` to the `Subscription` interface (for org admin visibility)

---

## Phase 3: Server Actions

### 3.1 `src/action/super-admin/orgnizations/organizationsActions.ts`
- Update `getOrganizations()` mapping to include `subscriptionStartDate`, `subscriptionIsActive`
- Update status logic to three-state:
  - `is_active === false` → "Suspended"
  - `now > expires_at` → "Expired"
  - else → "Active"
- Add `getSubscriptionDetails(orgId)` — calls `get_organization_subscription_details` RPC
- Add `updateSubscription(orgId, tierId, startDate, expiresAt, isActive)` — calls `update_organization_subscription` RPC
- Add `getSubscriptionRequests(orgId)` — calls `get_pending_subscription_requests` RPC
- Add `resolveSubscriptionRequest(requestId, status)` — calls `resolve_subscription_request` RPC

### 3.2 Update `createOrganization()`
- Pass `startDate` and `expiresAt` to the updated `create_new_organization` RPC

---

## Phase 4: UI Components

### 4.1 Update `OrganizationsForm.tsx` — Add Date Pickers to Create Form
- Add two `DatePicker` fields after the subscription package selector:
  - **Start Date** (default: today)
  - **End Date** (default: today + 1 year)
- Auto-set end date when start date changes (keep 1-year span, but editable)
- Update zod schema to include `startDate` and `endDate`
- Only show date pickers when a subscription package is selected

### 4.2 New `SubscriptionSheet.tsx` — The Main Feature
A `Sheet` (shadcn side panel) that opens from the right with:

**Header:**
- Organization name + current status badge (Active/Expired/Suspended)

**Section 1: Subscription Details (editable form)**
- Tier dropdown (changeable)
- Start Date picker
- End Date picker
- Active/Suspended toggle switch
- Quick extend buttons: +1mo, +3mo, +6mo, +1yr
- **Save Changes** button

**Section 2: Tier Limits (read-only, from selected tier)**
- Max Users / Max Courses / Max Content Creators
- Feature flags: Create Courses, AI Builder, Document Builder

**Section 3: Pending Upgrade Requests**
- List of pending requests (from `subscription_requests` where `status = 'pending'`)
- Each shows: requested users/courses/creators, date requested
- **Approve** / **Dismiss** buttons per request

### 4.3 Update `columns.tsx` — Add "Manage Subscription" Action
- Add a new dropdown menu item with a Settings/CreditCard icon
- Wire `onManageSubscription` callback
- Update status badge to handle three states with colors:
  - Active → green
  - Expired → red
  - Suspended → orange/yellow

### 4.4 Update `OrganizationsPage.tsx` — Wire Sheet State
- Add `subscriptionSheetOpen` + `currentOrganization` state for the sheet
- Add `onManageSubscription` to `dataWithActions` mapping
- Render `<SubscriptionSheet>` component
- Add `handleUpdateSubscription` and `handleResolveRequest` handlers

### 4.5 Update `OrganizationFormData` type and form
- Add `startDate?: string` and `endDate?: string` to `OrganizationFormData`
- Thread these through `handleCreateOrganization` → `createOrganization` server action

---

## Phase 5: Org Admin Side (Minor)

### 5.1 Update `src/redux/organization.slice.ts`
- Add `is_active: boolean` to the Subscription interface

### 5.2 Update `src/components/app/organizationSettings/subscription.tsx`
- Show status badge (Active/Expired/Suspended) based on `is_active` + dates
- Disable "Upgrade Subscription" button if subscription is suspended

---

## Files Changed (Summary)

| File | Action |
|------|--------|
| `supabase/migrations/20260223110000_subscription_management.sql` | **NEW** — migration |
| `src/action/super-admin/orgnizations/type.ts` | EDIT — add fields |
| `src/action/super-admin/orgnizations/organizationsActions.ts` | EDIT — add actions, update mapping |
| `src/app/dashboard/@super_admin/organizations/type.ts` | EDIT — add types |
| `src/app/dashboard/@super_admin/organizations/columns.tsx` | EDIT — add action, 3-state badge |
| `src/app/dashboard/@super_admin/organizations/OrganizationsPage.tsx` | EDIT — wire sheet |
| `src/app/dashboard/@super_admin/organizations/OrganizationsForm.tsx` | EDIT — add date pickers |
| `src/app/dashboard/@super_admin/organizations/SubscriptionSheet.tsx` | **NEW** — main feature UI |
| `src/redux/organization.slice.ts` | EDIT — add `is_active` |
| `src/components/app/organizationSettings/subscription.tsx` | EDIT — show status |

---

## Execution Order
1. Migration (Phase 1) — must run first, everything depends on schema
2. Types (Phase 2) — foundation for all TS code
3. Server Actions (Phase 3) — bridge between DB and UI
4. UI Components (Phase 4) — the visible feature
5. Org Admin Side (Phase 5) — minor follow-up

## Notes
- All existing UI components (Sheet, Calendar, DatePicker, Badge, Popover) already exist in the codebase
- No new npm packages needed
- The TEXT→TIMESTAMPTZ migration is safe because existing data is ISO strings from `now()::text`
- The `is_active` column defaults to `true`, so existing subscriptions remain active
- The `status` column on `subscription_requests` defaults to `'pending'`, so existing requests are preserved
