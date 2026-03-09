# TELEMETRY.md
## OpenDraft — Admin Telemetry, Observability, and Feedback Loop
*Version target: v1.5 — Build after v1.0 ships and real users are in the system.*
*Add to project root. Reference in CLAUDE.md under "Planned Features."*
*Last updated: March 9, 2026*

---

## Purpose

OpenDraft's competitive advantage is not the persona pipeline. The persona pipeline is visible and replicable. The advantage is the feedback loop — the ability to observe exactly what real users do, where they stop, which slots they struggle with, and which changes to the system improve outcomes. This document specifies the full telemetry system that makes that loop possible.

The loop has three parts:

1. **Event capture** — every meaningful action in a session logged to Supabase in real time
2. **Admin dashboard** — a private `/admin` route where the data becomes readable, filterable, and actionable
3. **Weekly PDF report** — a structured export designed to be dropped directly into Cursor or Claude as a feedback document

When all three are running, the build cycle becomes: ship → observe → report → improve → ship. That is the flywheel.

---

## Guiding Questions This System Must Answer

These are the questions that matter. The telemetry schema, the dashboard, and the PDF report are all designed to answer these — and nothing else.

**Drop-off:**
- Where in the conversation do users leave?
- Which slot has the highest abandonment rate on each path?
- At what percentage of sessions does the user submit at least one message?
- At what percentage do they reach Slot 3? Slot 5? All 7?

**Conversion:**
- What percentage of started sessions result in a completed draft?
- What percentage of completed drafts are published?
- Does completion rate differ between policy path and product path?
- How many sessions end in a publish within the same sitting vs. return visits?

**Persona performance:**
- Which existence check scenarios are being triggered most frequently?
- Which slots have the most multi-turn exchanges before being filled (hardest slots)?
- Which slots fill in a single exchange (easiest — and possibly too easy)?

**User behavior:**
- What is the average session length in minutes?
- What is the average number of messages per completed session?
- What percentage of users return after their first session?
- What is the average time between session start and publish?

**Feed health:**
- How many drafts published per week?
- What is the upvote distribution across published drafts?
- Which path (policy vs. product) produces more published drafts?
- Which categories generate the most engagement?

---

## Part 1 — Supabase Telemetry Schema

### New Table: `events`

Every meaningful event in a session is its own row. This table is the foundation of everything else.

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  event_type text not null,
  path text, -- 'policy' | 'product' | 'unrouted'
  slot_number integer, -- 1-7, null if not slot-specific
  persona text, -- which persona was active at this event
  metadata jsonb -- flexible additional context per event type
);

create index events_session_id_idx on events(session_id);
create index events_created_at_idx on events(created_at);
create index events_event_type_idx on events(event_type);
```

---

### Event Type Taxonomy

Every event in the system maps to one of these types. No other events are logged.

**Session events:**
| Event Type | Fires When |
|---|---|
| `session_started` | User submits their first message |
| `session_abandoned` | User closes or navigates away before publishing |
| `session_completed` | All 7 slots confirmed, draft assembled |
| `draft_published` | User taps Publish and draft saves to Supabase |

**Path events:**
| Event Type | Fires When |
|---|---|
| `path_routed_policy` | AI routes user to Legislative Launchpad |
| `path_routed_product` | AI routes user to Silicon Valley Handoff |
| `path_routing_ambiguous` | Heifetz gate triggered — path unclear |
| `path_confirmed` | User confirms path after routing |

**Slot events:**
| Event Type | Fires When | Metadata |
|---|---|---|
| `slot_entered` | AI begins interrogating a slot | `{ slot_number, slot_name, persona }` |
| `slot_filled` | Slot confirmed with valid content | `{ slot_number, turn_count }` |
| `slot_partial` | Slot has content but AI flagged as incomplete | `{ slot_number, turn_count }` |
| `slot_abandoned` | Session ends while slot is active | `{ slot_number, turn_count }` |

**Existence check events:**
| Event Type | Fires When |
|---|---|
| `existence_check_identical_law` | AI detects identical legislation exists |
| `existence_check_similar_law` | AI detects similar law elsewhere |
| `existence_check_prior_bill_failed` | AI detects prior bill on same topic failed |
| `existence_check_feature_exists_target` | AI detects feature exists at target company |
| `existence_check_feature_exists_competitor` | AI detects feature exists at competitor |

**Feed events:**
| Event Type | Fires When |
|---|---|
| `draft_upvoted` | User upvotes a published draft |
| `draft_downvoted` | User downvotes a published draft |
| `draft_resent` | 50-upvote threshold crossed, draft resent |

---

### Additions to Existing Tables

**`conversations` table — add columns:**
```sql
alter table conversations
  add column path text,
  add column slots_filled integer default 0,
  add column total_turns integer default 0,
  add column completed boolean default false,
  add column published boolean default false,
  add column abandoned_at_slot integer,
  add column session_duration_seconds integer;
```

**`drafts` table — add columns:**
```sql
alter table drafts
  add column path text,
  add column turns_to_complete integer,
  add column time_to_publish_seconds integer;
```

---

### Event Logging Function

Add to `/lib/supabase-client.ts`:

```typescript
export async function logEvent(
  sessionId: string,
  eventType: string,
  options?: {
    path?: string
    slotNumber?: number
    persona?: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  // Fire and forget — never block the UI
  supabase.from('events').insert({
    session_id: sessionId,
    event_type: eventType,
    path: options?.path ?? null,
    slot_number: options?.slotNumber ?? null,
    persona: options?.persona ?? null,
    metadata: options?.metadata ?? null,
  }).then(({ error }) => {
    if (error) console.error('Event log failed:', error)
  })
}
```

Usage in conversation engine:
```typescript
// When a slot is filled
logEvent(sessionId, 'slot_filled', {
  path: state.path,
  slotNumber: 2,
  persona: 'matthew_desmond',
  metadata: { turn_count: exchangeCount }
})
```

---

## Part 2 — Admin Dashboard

### Route and Access

- Route: `/admin`
- Access: Supabase Row Level Security — only rows where `user_id` matches the admin UUID
- Alternatively: environment variable `ADMIN_EMAIL` checked against session user email on load
- No public link. No nav item. Direct URL only.

---

### Dashboard Sections

#### Section 1 — Overview (Top of Page)
Four stat cards. Updates in real time or on page load.

| Card | Value |
|---|---|
| Total sessions (all time) | Count of `session_started` events |
| Completion rate | `session_completed` / `session_started` as % |
| Publish rate | `draft_published` / `session_completed` as % |
| Active this week | Unique session IDs with events in last 7 days |

Date range filter at top right: Last 7 days / Last 30 days / All time.

---

#### Section 2 — Drop-off Funnel
Horizontal bar chart. One bar per stage. Shows how many sessions reached each gate.

```
Session started          ████████████████████  100%
First message sent       ████████████████████   97%
Path routed              ██████████████████     89%
Slot 1 filled            ████████████████       82%
Slot 2 filled            ████████████           74%
Slot 3 filled            ██████████             61%
Slot 4 filled            ████████               52%
Slot 5 filled            ███████                44%
Slot 6 filled            ██████                 38%
Slot 7 filled            █████                  31%
Draft completed          ████                   28%
Draft published          ███                    19%
```

Split by path (policy vs. product) with a toggle.

---

#### Section 3 — Slot Difficulty Analysis
Table. One row per slot. Shows average number of turns required to fill each slot.

| Slot | Name | Avg Turns to Fill | Fill Rate | Hardest Gate |
|---|---|---|---|---|
| 1 | Specific Harm / User Pain | 2.1 | 82% | — |
| 2 | The Gap / User Story | 3.4 | 74% | — |
| 3 | Mechanism / Specific Feature | 4.8 | 61% | ← |
| ... | ... | ... | ... | |

High turn count = the persona interrogation is working but the slot is hard. Low fill rate + low turn count = users are abandoning before the slot can fill. These two signals together tell you different things.

---

#### Section 4 — Path Distribution
Donut chart.

- Policy path: X%
- Product path: X%
- Abandoned before routing: X%

---

#### Section 5 — Existence Check Triggers
Table. How often each existence check fires and what happens after.

| Scenario | Times Triggered | Sessions Continued | Sessions Abandoned |
|---|---|---|---|
| Identical law exists | 12 | 8 (67%) | 4 (33%) |
| Similar law elsewhere | 31 | 29 (94%) | 2 (6%) |
| Prior bill failed | 7 | 4 (57%) | 3 (43%) |
| Feature exists at target | 19 | 11 (58%) | 8 (42%) |
| Feature at competitor | 14 | 13 (93%) | 1 (7%) |

This table tells you which existence check scenarios are killing momentum. High abandonment after a specific trigger = the Roger Fisher or Kim Scott reframe is not landing. Needs system prompt adjustment.

---

#### Section 6 — Feed Health
Three metrics side by side.

- Drafts published this period
- Average upvotes per published draft
- Drafts that crossed the 50-vote re-send threshold

---

#### Section 7 — Recent Sessions
Paginated table. Last 50 sessions. Each row shows:
- Session ID (truncated)
- Date/time
- Path (policy / product / abandoned)
- Slots filled (e.g. 4/7)
- Outcome (abandoned / completed / published)
- Duration

Click any row to expand the full event log for that session.

---

### Admin Dashboard Tech Stack

- `app/admin/page.tsx` — server component with admin auth check
- `app/admin/components/` — client components for each section
- Supabase queries using aggregate functions — no new API routes needed
- Chart library: recharts (already in the stack)
- PDF export: browser `window.print()` with a print-specific CSS stylesheet, or jsPDF for more control
- No new dependencies if using recharts + jsPDF

---

## Part 3 — Weekly PDF Report

### Purpose

The PDF is not a dashboard export. It is a structured narrative report — designed to be dropped into Cursor or Claude as a feedback document. The AI reads it and proposes specific changes to the system prompt, persona pipeline, or slot structure.

### Report Structure

```
OPENDRAFT — WEEKLY TELEMETRY REPORT
Week of [DATE] — Generated [TIMESTAMP]

───────────────────────────────────────
EXECUTIVE SUMMARY
───────────────────────────────────────
[3-4 sentences: what changed this week vs. last week,
the single most important signal in the data]

───────────────────────────────────────
SESSION OVERVIEW
───────────────────────────────────────
Total sessions:           [N]
Completion rate:          [X%] (vs. [Y%] last week)
Publish rate:             [X%] (vs. [Y%] last week)
Policy path:              [X%] of routed sessions
Product path:             [X%] of routed sessions

───────────────────────────────────────
DROP-OFF ANALYSIS
───────────────────────────────────────
Highest abandonment point:  Slot [N] — [Slot Name] ([X%] drop)
Second highest:             Slot [N] — [Slot Name] ([X%] drop)
Sessions abandoning before routing: [X%]

Notable changes vs. last week:
[1-2 sentences on what shifted]

───────────────────────────────────────
SLOT DIFFICULTY
───────────────────────────────────────
Hardest slot (avg turns):   Slot [N] — [Name] ([X] avg turns)
Easiest slot (avg turns):   Slot [N] — [Name] ([X] avg turns)
Slots with fill rate < 50%: [List]

───────────────────────────────────────
EXISTENCE CHECK PERFORMANCE
───────────────────────────────────────
[Table: scenario / triggers / continuation rate]
Lowest continuation rate:  [Scenario] ([X%])
Recommended review:        [Yes/No based on threshold]

───────────────────────────────────────
FEED HEALTH
───────────────────────────────────────
Drafts published:          [N]
Avg upvotes per draft:     [X]
Re-send threshold crossed: [N] drafts

───────────────────────────────────────
RAW DATA APPENDIX
───────────────────────────────────────
[Full event counts by type for the period]
[Full slot fill rates]
[Full existence check table]
```

---

### How to Use the Report in Cursor

Drop the PDF into a Cursor session and use this prompt:

> This is OpenDraft's weekly telemetry report for the week of [DATE].
>
> OpenDraft is an AI-guided civic drafting platform. The conversation pipeline has 4 phases, 7 slots per path, and a set of named personas assigned to each gate. The system prompt and persona pipeline are in PERSONAS.md and opendraft-system-prompt-v1.md in the project root.
>
> Read this report. Based on the data:
> 1. Which slots have the highest abandonment and what does that suggest about the current persona methodology or question framing?
> 2. Which existence check scenarios have the lowest continuation rate and what does that suggest about the reframe technique?
> 3. What specific changes to the system prompt would you recommend based on this data?
> 4. Are there any signals in the data that suggest a structural problem (wrong slot order, wrong phase boundary, wrong path routing) rather than a prompt problem?
>
> Propose specific changes. Do not restructure the entire pipeline. Make targeted edits to what the data says is underperforming.

---

## Part 4 — Build Order for v1.5

### Pre-requisite: Data collection starts at v1.0 launch

The `events` table and `logEvent` function should be added before or at v1.0 launch. Data starts accumulating from day one. The admin dashboard and PDF export can wait — but the underlying events cannot. An event that was never logged cannot be recovered.

**Add to Playbook 5 (Ship):**
- Create `events` table in Supabase
- Add `logEvent` to `/lib/supabase-client.ts`
- Wire `logEvent` calls into `conversation-engine.ts` at each slot transition and phase gate
- Wire `logEvent` into `app/draft/page.tsx` for session start and session abandon (beforeunload)

**v1.5 sprint — after first users are in:**

| Prompt | Task |
|---|---|
| v1.5 Prompt 1 | Build admin auth gate — `/admin` route, environment variable check |
| v1.5 Prompt 2 | Build Section 1 (Overview) and Section 2 (Drop-off Funnel) |
| v1.5 Prompt 3 | Build Section 3 (Slot Difficulty) and Section 4 (Path Distribution) |
| v1.5 Prompt 4 | Build Section 5 (Existence Checks) and Section 6 (Feed Health) |
| v1.5 Prompt 5 | Build Section 7 (Recent Sessions + event log expansion) |
| v1.5 Prompt 6 | Build date range filter wired across all sections |
| v1.5 Prompt 7 | Build PDF export — structured report format, download button |
| v1.5 Prompt 8 | End-to-end test — seed mock events, verify all sections render correctly |

---

## Part 5 — The Flywheel in Full

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   SHIP  ──▶  USERS USE OPENDRAFT                   │
│                      │                              │
│                       ▼                             │
│              EVENTS LOG TO SUPABASE                 │
│              (every gate, every slot,               │
│               every drop-off, every publish)        │
│                      │                              │
│                       ▼                             │
│          ADMIN DASHBOARD — WEEKLY REVIEW            │
│          (where are people leaving,                 │
│           which slots are hardest,                  │
│           which existence checks kill momentum)     │
│                      │                              │
│                       ▼                             │
│              DOWNLOAD PDF REPORT                    │
│                      │                              │
│                       ▼                             │
│         DROP PDF INTO CURSOR + CLAUDE               │
│         "What should we change?"                    │
│                      │                              │
│                       ▼                             │
│         AI PROPOSES TARGETED CHANGES TO:            │
│         - System prompt                             │
│         - Persona methodology per slot              │
│         - Slot order or structure                   │
│         - Existence check reframe language          │
│                      │                              │
│                       ▼                             │
│         ANDREW REVIEWS + APPROVES CHANGES           │
│                      │                              │
│                       ▼                             │
│              DEPLOY UPDATED SYSTEM                  │
│                      │                              │
│                       ▼                             │
│   SHIP  ──▶  USERS USE OPENDRAFT  (better)         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Every cycle of this loop produces a system that is specifically better at the things real users were actually struggling with — not the things the founder assumed they would struggle with. That specificity, accumulated over time, is the moat.

---

## How This Document Is Used

**In Cursor sessions:** Reference TELEMETRY.md when building v1.5 components. Each section of the admin dashboard has a corresponding Cursor prompt in Part 4. Use them in order.

**In CLAUDE.md:** Add under "Planned Features — v1.5": "Admin telemetry dashboard, event logging, weekly PDF report. See TELEMETRY.md."

**In Supabase:** The `events` table schema in Part 1 is production-ready. Run it in the Supabase SQL editor before v1.0 launches.

**In the system prompt:** The telemetry system does not affect the system prompt directly. It informs changes to the system prompt through the weekly feedback loop described in Part 3.

---

*OpenDraft — opendraft.dev*
*TELEMETRY.md v1.0 — v1.5 Feature Specification*
*Last updated: March 9, 2026*
