# AI Content Intelligence & Personal Brand Automation — Foundation

Build the database, auth, layout, and dashboard foundation on the connected Supabase project. No mock data: every screen reads real rows (empty states where there are none).

## 1. Database (Supabase migration)

Create all 14 tables exactly as specified: `brand_profiles`, `audiences`, `content_pillars`, `content_calendar`, `research_items`, `content_opportunities`, `content_drafts`, `content_versions`, `visual_prompts`, `gamma_generations`, `personal_stories`, `case_studies`, `content_analytics`, `automation_runs`.

Additions on top of the field list:

- `user_id uuid not null default auth.uid()` on every table (spec only lists it on some). Data is private per user, and every RLS policy needs an owner column. n8n writes with the service role and sets `user_id` explicitly.
- `created_at` / `updated_at` as `timestamptz default now()`, with a shared trigger keeping `updated_at` current.
- Foreign keys per the relationship list (calendar → audience/pillar/opportunity/draft/visual, opportunity → research item, draft → calendar/opportunity, version/visual/analytics → draft, gamma → visual prompt), nullable where the spec says nullable, `on delete set null` for soft links and `on delete cascade` for owned children (versions, gamma generations, analytics).
- Unique index on `research_items (user_id, hash)` to block duplicate research.
- Indexes on the fields automations query most: `content_calendar(user_id, scheduled_date, status)`, `content_opportunities(user_id, status, overall_score)`, `content_drafts(user_id, status)`, `visual_prompts(draft_id)`, `research_items(user_id, published_at)`, `automation_runs(user_id, run_date)`, plus each foreign key column.
- Score columns as `numeric`, counters in `content_analytics` as `integer default 0`, statuses as `text` with sensible defaults (`planned`, `new`, `draft`, `pending`, `running`) so n8n can insert partial rows.
- Grants: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`, `ALL` to `service_role` (n8n). No `anon` access.
- RLS enabled on all tables with owner-scoped policies (`auth.uid() = user_id`) for select/insert/update/delete.

## 2. Auth

Email + password. Public `/auth` route with sign-in and sign-up (plus forgot-password and a `/reset-password` page). Everything else lives under the protected `_authenticated` layout. Public `/` becomes a short landing/redirect: signed-in users go to `/dashboard`.

## 3. App layout

Persistent sidebar shell with the nine nav items — Dashboard, Content Calendar, Research, Content Opportunities, Drafts, Visuals, Analytics, Brand Profile, Settings — a top bar with the account menu and sign-out, and a dark, engineering-toned SaaS design system (no default purple-on-white template look).

Each nav item gets its own route file. For this foundation pass, Dashboard is built out; the other eight are functional shells that list their table's real rows in a simple table/empty state — no editing, filtering, or generation features yet.

## 4. Dashboard

Reads live data through authenticated server functions:

- Today's card: today's `content_calendar` row → audience name, pillar name, topic, objective, format, status.
- Opportunity score from the linked opportunity, draft status from the linked draft, visual status from the linked visual prompt.
- Recent research: latest `research_items`.
- Recent automation runs: latest `automation_runs` with status and timing.

Empty states describe what the n8n workflow will populate.

## Technical notes

- Schema applied via the Supabase migration tool; RLS + grants in the same migration.
- Data access through `createServerFn` with `requireSupabaseAuth`, so RLS applies as the signed-in user; loaders under `_authenticated` use TanStack Query.
- No Supabase Edge Functions; n8n will talk to the database directly (service role) or to `/api/public/*` routes added later.
- Each route defines its own `head()` metadata.
