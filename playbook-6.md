# Playbook 6 — Telemetry & Admin Dashboard
**Version:** v1.5  
**Goal:** Build the feedback loop. Events are writing. Now surface them.  
**Output:** A working `/admin` dashboard that tells you — after every real usage cycle — exactly where the conversation breaks down, which slots are hardest, and what the feed looks like. This is the system that makes OpenDraft self-improving.

**Prerequisites (confirm before starting):**
- [ ] `supabase-conversations-unique.sql` run in Supabase SQL Editor
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in `.env.local` and Vercel
- [ ] At least one real session in the `events` table (verify in Supabase dashboard)
- [ ] `npx tsc --noEmit` passes on master

**Commit cadence:** One commit per prompt. Message format: `p6-XX: description`

---

## Prompt 46 — Analytics Query Layer

**What this builds:** A server-side analytics module (`lib/analytics.ts`) with typed query functions that back every section of the admin dashboard. All queries run server-side using the service role client. No raw SQL in components — ever.

```
Read lib/supabase-server.ts and the Supabase schema (conversations, drafts, 
events, votes tables — see TELEMETRY.md and supabase-rls-policies.sql for 
column definitions).

Create lib/analytics.ts. This is a server-only module — add a comment at 
the top: "Server-only. Do not import from client code."

Implement the following typed functions. Each uses getServiceRoleClient() 
from lib/supabase-server.ts. Each returns a typed result object (define 
types inline or in types/analytics.ts). Each throws on Supabase error.

1. getOverviewStats(): Promise<OverviewStats>
   Query conversations for:
   - total_sessions: count of all rows
   - completed_sessions: count where completed = true
   - published_sessions: count where published = true
   - completion_rate: completed / total (0 if total = 0)
   - publish_rate: published / completed (0 if completed = 0)
   - avg_session_duration_seconds: avg of session_duration_seconds 
     where session_duration_seconds is not null
   - sessions_last_7_days: count where created_at >= now() - interval '7 days'

2. getDropOffFunnel(): Promise<DropOffFunnelStage[]>
   Return an array of stages in order:
   - { stage: 'started', count } — all conversations rows
   - { stage: 'routed', count } — where path IS NOT NULL and path != 'unrouted'
   - { stage: 'slot_1', count } — where slots_filled >= 1
   - { stage: 'slot_3', count } — where slots_filled >= 3
   - { stage: 'slot_5', count } — where slots_filled >= 5
   - { stage: 'slot_7', count } — where slots_filled = 7
   - { stage: 'completed', count } — where completed = true
   - { stage: 'published', count } — where published = true

3. getSlotDifficulty(): Promise<SlotDifficulty[]>
   Query events for event_type = 'slot_filled', group by slot_number.
   For each slot 1–7, return:
   - slot_number
   - fill_count: how many times this slot was filled
   - drop_rate: for slot N, (fill_count[N-1] - fill_count[N]) / fill_count[N-1]
     (0 for slot 1, null if no data)
   Order by slot_number ascending.

4. getPathDistribution(): Promise<PathDistribution>
   Query conversations for:
   - policy_count: where path = 'policy'
   - product_count: where path = 'product'
   - unrouted_count: where path = 'unrouted' or path is null
   - policy_pct, product_pct, unrouted_pct (as percentages of total, 0 if total = 0)

5. getFeedHealth(): Promise<FeedHealth>
   Query drafts (published) for:
   - total_published: count
   - policy_published: count where path = 'policy'
   - product_published: count where path = 'product'
   - avg_upvotes: avg vote count (join votes, count per draft, then avg)
   - drafts_with_votes: count of drafts that have at least 1 vote
   - most_recent_published_at: max(created_at)

6. getRecentSessions(limit = 20): Promise<RecentSession[]>
   Query conversations ordered by created_at desc, limit as given.
   For each row return:
   - session_id, created_at, path, slots_filled, completed, published,
     total_turns, session_duration_seconds, abandoned_at_slot
   Do not fetch events here — events are fetched per-session on demand 
   (see Prompt 49).

7. getSessionEvents(sessionId: string): Promise<SessionEvent[]>
   Query events where session_id = sessionId, ordered by created_at asc.
   Return: id, event_type, created_at, path, slot_number, metadata.

Run npx tsc --noEmit. Fix any type errors. Do not create any UI yet.
Commit: p6-46: analytics query layer
```

---

## Prompt 47 — Admin Route Scaffold + Auth Guard

**What this builds:** The `/admin` route with layout, nav, and a hard-coded password guard. Simple but real — this is not a public page.

```
Create app/admin/layout.tsx and app/admin/page.tsx.

AUTH GUARD:
- The admin password is stored in env var ADMIN_PASSWORD.
- On GET /admin, if the request does not include a cookie 
  admin_authenticated=true, redirect to /admin/login.
- Create app/admin/login/page.tsx: a minimal server action form 
  (plain HTML, no shadcn). Input type=password, submit button labeled 
  "Enter". On submit, if value === process.env.ADMIN_PASSWORD, set 
  cookie admin_authenticated=true (httpOnly, sameSite=strict, 
  maxAge=86400) and redirect to /admin. If wrong, re-render login 
  with error: "Incorrect password."
- In app/admin/layout.tsx, check the cookie. If not present, 
  redirect to /admin/login. Do this check server-side using cookies() 
  from next/headers.
- Add ADMIN_PASSWORD to .env.local (value: your choice, document in 
  CLAUDE.md under Environment Variables). Add to Vercel env vars too 
  (note in prompt summary).

LAYOUT:
- app/admin/layout.tsx: full-width, white background, no TopNav/BottomNav 
  (admin is a separate context from the product UI).
- Simple top bar: "OpenDraft Admin" in navy Playfair Display on the left. 
  "opendraft.dev ↗" link on the right. No other nav.
- Main content area below the bar: full width, max-w-5xl mx-auto, 
  padding 24px.

PAGE STUB (app/admin/page.tsx):
- Server component. Import and call all 6 analytics functions from 
  lib/analytics.ts in parallel using Promise.all.
- For now, render a single <pre> tag dumping the JSON of all results 
  (pretty-printed). This confirms the data pipeline works end-to-end 
  before we build the UI.
- Add a <p> at the top: "Data as of {new Date().toISOString()}"

Run npx tsc --noEmit. Confirm /admin renders in browser (localhost:3001/admin) 
and shows real data from Supabase. Fix any errors.
Commit: p6-47: admin route scaffold and auth guard
```

---

## Prompt 48 — Overview Stats + Drop-Off Funnel

**What this builds:** The first two dashboard sections — the numbers at a glance, and the funnel that shows you exactly where users leave.

```
Replace the <pre> stub in app/admin/page.tsx with real sections.
All components go in components/admin/. All are server components unless 
noted. Use Tailwind only — no new shadcn components unless already installed.

SECTION 1 — Overview Stats
Create components/admin/OverviewStats.tsx.
Props: stats: OverviewStats (imported from lib/analytics.ts types).

Render a row of 5 stat cards. Each card:
- White background, 1px border (#E5E7EB), rounded-sm, padding 20px
- Label: small uppercase Inter, color #6B7280, letter-spacing wide
- Value: large Playfair Display, navy (#1B2A4A)
- No icons

Cards (in order):
1. "Sessions (7d)" — sessions_last_7_days
2. "Total Sessions" — total_sessions
3. "Completion Rate" — completion_rate as percentage (e.g. "42%")
4. "Publish Rate" — publish_rate as percentage
5. "Avg Duration" — avg_session_duration_seconds formatted as "Xm Ys" 
   (e.g. "3m 42s"). If null, show "—"

SECTION 2 — Drop-Off Funnel
Create components/admin/DropOffFunnel.tsx.
Props: stages: DropOffFunnelStage[].

Render a vertical funnel table. For each stage:
- Stage name (formatted: 'slot_1' → 'Slot 1 Filled', 'routed' → 'Path Routed', 
  'completed' → 'Session Completed', 'published' → 'Draft Published', etc.)
- Count (right-aligned, navy, monospace)
- A horizontal bar: width proportional to count / stages[0].count, 
  filled forest green (#2D5016) at 20% opacity, 4px height
- Drop % from previous stage: small grey text, e.g. "↓ 34% from previous"
  (skip for 'started')

Section header style (use for all sections):
- "OVERVIEW" / "DROP-OFF FUNNEL" in small uppercase Inter, navy, 
  border-bottom 1px #E5E7EB, padding-bottom 8px, margin-bottom 16px

In app/admin/page.tsx, replace the <pre> with:
<OverviewStats stats={overviewStats} />
<DropOffFunnel stages={funnelStages} />
(with the section headers above each)

Run npx tsc --noEmit. Verify visually in browser.
Commit: p6-48: overview stats and drop-off funnel
```

---

## Prompt 49 — Slot Difficulty + Path Distribution

**What this builds:** The two analytical sections that directly inform system prompt improvements — which slots cause drop-off, and how the routing is splitting.

```
Add two more sections to app/admin/page.tsx.

SECTION 3 — Slot Difficulty
Create components/admin/SlotDifficulty.tsx.
Props: slots: SlotDifficulty[].

Render a 7-row table. Columns:
- Slot # (1–7)
- Slot Name (hard-coded map:
    1 → "Specific Harm / User Pain"
    2 → "The Gap / User Story"
    3 → "Mechanism / Specific Feature"
    4 → "Enforcement / Target Company"
    5 → "Jurisdiction / Existing Landscape"
    6 → "Precedent / Value Prop"
    7 → "Political Landscape / Risks"
  Format: "Policy Name / Product Name" — both paths share a slot number)
- Fill Count (monospace, navy)
- Drop Rate from previous slot: shown as a colored badge
    < 10%: green background (#D1FAE5), green text (#065F46) — "Easy"
    10–30%: yellow background (#FEF3C7), yellow text (#92400E) — "Moderate"  
    > 30%: red background (#FEE2E2), red text (#991B1B) — "Hard"
    Slot 1 / no data: grey badge — "—"

Table header: standard Tailwind th styling, small uppercase, grey.
Table: full width, border-collapse, alternating row bg (#FAF8F3 / white).

SECTION 4 — Path Distribution
Create components/admin/PathDistribution.tsx.
Props: distribution: PathDistribution.

Render two large number blocks side by side, then a row below for unrouted:
- Left: "POLICY" — policy_count large, policy_pct below in grey
- Right: "PRODUCT" — product_count large, product_pct below in grey
- Below: "Unrouted / Abandoned Before Routing" — unrouted_count, unrouted_pct

Below the numbers, render a single horizontal stacked bar (full width, 
height 8px, rounded):
- Forest green segment: policy_pct width
- Navy segment: product_pct width  
- Light grey segment: unrouted_pct width
Add a small legend below the bar (colored dot + label for each).

Add both sections to app/admin/page.tsx with correct section headers:
"SLOT DIFFICULTY" and "PATH DISTRIBUTION".

Run npx tsc --noEmit. Verify in browser.
Commit: p6-49: slot difficulty and path distribution
```

---

## Prompt 50 — Feed Health + Recent Sessions

**What this builds:** Feed health (what's been published and how it's performing) and a live sessions table with expandable event log — the closest thing to a real-time view of the product.

```
Add the final two sections to app/admin/page.tsx.

SECTION 5 — Feed Health
Create components/admin/FeedHealth.tsx.
Props: health: FeedHealth.

Render a 2x2 grid of stat cards (same style as OverviewStats):
- "Total Published" — total_published
- "Policy / Product Split" — "{policy_published} Policy · {product_published} Product"
- "Drafts With Votes" — drafts_with_votes
- "Avg Upvotes" — avg_upvotes formatted to 1 decimal place (e.g. "2.4"). 
  If null, "—"
Below the grid, one line in grey italic:
"Most recent draft published {X} ago" — format most_recent_published_at as 
relative time (e.g. "3 hours ago", "2 days ago"). If null, "No drafts published yet."

SECTION 6 — Recent Sessions
Create components/admin/RecentSessions.tsx as a CLIENT component 
('use client' at top). This is the only client component in /admin.
Props: sessions: RecentSession[], and a server action 
getEvents: (sessionId: string) => Promise<SessionEvent[]>

Render a table. Columns:
- Time (created_at formatted as "Mar 9, 2:34pm")
- Path (badge: "policy" navy bg white text, "product" forest green bg white text, 
  "unrouted" grey)
- Slots (slots_filled / 7, e.g. "3 / 7")
- Turns (total_turns or "—")
- Duration (session_duration_seconds as "Xm Ys" or "—")
- Status (badge: "Published" green, "Completed" blue, "Abandoned" red, 
  "In Progress" grey)
- Expand button: chevron icon (use lucide-react ChevronDown / ChevronUp)

On expand: call getEvents(session_id) via the passed server action. 
While loading show a subtle "Loading events..." row. 
On success, render an indented sub-table of events:
- Time (formatted as relative: "0s", "+12s", "+1m 4s" from session start)
- Event type (monospace, small, grey)
- Details: if slot_number present show "Slot {N}". 
  If metadata is non-null, show JSON.stringify(metadata) truncated to 80 chars.

Only one session can be expanded at a time (collapse on second click of same 
row, or auto-collapse previous when a new row is expanded).

Create a server action in app/admin/actions.ts:
'use server'
export async function fetchSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  // calls getSessionEvents(sessionId) from lib/analytics.ts
}

Pass this server action as the getEvents prop from app/admin/page.tsx.

Add section header "RECENT SESSIONS (LAST 20)" to page.tsx.

Run npx tsc --noEmit. Test expand/collapse in browser. Verify event rows appear.
Commit: p6-50: feed health and recent sessions
```

---

## Prompt 51 — Weekly Report Export

**What this builds:** A "Download Weekly Report" button that generates and downloads a structured JSON/text report — the artifact you drop into Cursor each week to get system prompt improvement recommendations.

```
Add a download button to the admin dashboard that generates a structured 
weekly report and downloads it as a .txt file.

Create app/api/admin/report/route.ts (GET handler).
- Check cookie admin_authenticated=true. If missing, return 401.
- Call all 6 analytics functions in parallel.
- Build a plain text report with this structure:

OPENDRAFT WEEKLY REPORT
Generated: {ISO timestamp}
Period: Last 7 days
─────────────────────────────────────────

EXECUTIVE SUMMARY
Sessions (7d): {N}
Completion Rate: {X}%
Publish Rate: {X}%
Avg Session Duration: {Xm Ys}

DROP-OFF ANALYSIS
[For each funnel stage: "  {stage}: {count} ({drop_pct}% drop from previous)"]

SLOT DIFFICULTY
[For each slot: "  Slot {N} ({name}): {fill_count} fills, {drop_rate}% drop — {Easy/Moderate/Hard/—}"]
Hardest slot: Slot {N} ({name}) with {X}% drop rate

PATH DISTRIBUTION
Policy: {N} ({X}%)
Product: {N} ({X}%)
Unrouted/Abandoned: {N} ({X}%)

FEED HEALTH
Total Published: {N}
Policy/Product Split: {N} / {N}
Avg Upvotes: {X}
Drafts with Votes: {N}

RECOMMENDED FOCUS AREAS FOR SYSTEM PROMPT REVIEW
[Auto-generate 3 bullets based on data:
 - If hardest slot drop_rate > 30%: "Slot N has {X}% drop rate — review question framing for {slot name}"
 - If unrouted_pct > 20%: "High unrouted rate ({X}%) — review path routing logic"
 - If completion_rate < 30%: "Low completion rate ({X}%) — consider reducing friction in early slots"
 - If publish_rate < 20%: "Low publish rate ({X}%) — review completion experience and publish CTA"
 - Always add: "Drop this report into Cursor with: 'Based on this data, propose targeted changes to opendraft-system-prompt-v1.md'"]

─────────────────────────────────────────
END OF REPORT

- Return with headers:
    Content-Type: text/plain
    Content-Disposition: attachment; filename="opendraft-report-{YYYY-MM-DD}.txt"

In app/admin/page.tsx, add a "Download Weekly Report ↓" button 
(navy bg, white text, small, positioned top-right of the dashboard next to 
the "Data as of..." timestamp). On click, it does:
  window.location.href = '/api/admin/report'

The download triggers immediately from the route — no client-side generation.

Run npx tsc --noEmit. Test the download — open the file and confirm it 
contains real data. 
Commit: p6-51: weekly report export
```

---

## Prompt 52 — Final Wiring, CLAUDE.md Update, Deploy

**What this builds:** End-to-end verification, CLAUDE.md update to reflect v1.5 architecture, and clean deploy to production.

```
This is the final prompt in Playbook 6. Do not add features. Verify, 
document, and ship.

STEP 1 — CLAUDE.md UPDATE
Open CLAUDE.md. Add or update the following sections:

Under "Environment Variables", add:
  SUPABASE_SERVICE_ROLE_KEY — server-only, used by lib/supabase-server.ts 
    and app/api/log-event/route.ts. Never expose to client.
  ADMIN_PASSWORD — server-only, used by app/admin/login/page.tsx. 
    Never expose to client.

Under "Architecture", add a "Telemetry & Admin" subsection:
  Events are written via POST /api/log-event (server route, service role).
  Admin dashboard lives at /admin — password protected, server components only 
    except RecentSessions (client, for expand/collapse).
  Analytics queries live in lib/analytics.ts — server-only.
  Weekly report available at GET /api/admin/report.
  Server action for session events: app/admin/actions.ts.

Under "v1.5 Status", note:
  Playbook 6 complete. Events pipeline live. Admin dashboard live.
  Feedback loop: Ship → Supabase events → /admin weekly review → 
  Download report → Drop into Cursor → Improve system prompt → Deploy.

STEP 2 — END-TO-END SMOKE TEST (do manually in browser on localhost)
[ ] /admin redirects to /admin/login when no cookie
[ ] /admin/login with wrong password shows error, does not set cookie
[ ] /admin/login with correct password sets cookie, redirects to /admin
[ ] /admin loads — all 6 sections render with real data (not all zeros)
[ ] Recent Sessions table shows rows
[ ] Expand a session — event sub-table loads
[ ] "Download Weekly Report" downloads a .txt file with real content
[ ] npx tsc --noEmit exits 0

STEP 3 — DEPLOY
git add -A
git commit -m "p6-52: telemetry dashboard complete — v1.5"
git push origin master

STEP 4 — VERCEL ENV VARS (if not already set)
Confirm in Vercel dashboard that these are set for Production:
- SUPABASE_SERVICE_ROLE_KEY
- ADMIN_PASSWORD

STEP 5 — PRODUCTION SMOKE TEST
[ ] opendraft.dev/admin redirects to login on first visit
[ ] Login works with production password
[ ] Dashboard loads with real production data
[ ] Report downloads with production data

When all steps pass, Playbook 6 is complete.
```

---

## Playbook 6 Completion Checklist

| Prompt | Feature | Commit |
|--------|---------|--------|
| 46 | Analytics query layer (`lib/analytics.ts`) | `p6-46` |
| 47 | Admin route scaffold + auth guard | `p6-47` |
| 48 | Overview stats + drop-off funnel | `p6-48` |
| 49 | Slot difficulty + path distribution | `p6-49` |
| 50 | Feed health + recent sessions (with event expand) | `p6-50` |
| 51 | Weekly report export | `p6-51` |
| 52 | Final wiring, CLAUDE.md, deploy | `p6-52` |

## What Playbook 6 Unlocks

After Playbook 6 ships, you have a closed loop:

1. Real users submit drafts on opendraft.dev
2. Events write to Supabase via `/api/log-event`
3. You open `/admin` once a week
4. You download the report
5. You drop it into Cursor: *"Based on this data, propose targeted changes to opendraft-system-prompt-v1.md"*
6. You review and deploy the improved system prompt
7. The system gets measurably better

That loop — running on real behavioral data — is the moat. Playbook 7 (v2.0 persona pipeline) feeds into the same loop once the reading stack arrives March 16.
