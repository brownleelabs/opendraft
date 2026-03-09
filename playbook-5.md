# OpenDraft — Playbook 5
## Ship to opendraft.dev
> One clean motion. No surprises. The product goes live.

---

## Before You Start

Everything in this list must be true before Prompt 39 begins.

- [ ] Playbook 4 fully complete — all 12 E2E steps passed
- [ ] `npx tsc --noEmit` runs clean locally
- [ ] No console errors on any screen at 390px
- [ ] Supabase auto-save confirmed (conversations row appears and updates)
- [ ] `.env.local` open and all keys visible — you will need them for Vercel
- [ ] Supabase dashboard accessible — you will run SQL and review RLS policies
- [ ] opendraft.dev domain confirmed in Vercel dashboard (or ready to connect)
- [ ] GitHub repo connected to Vercel project

---

## Prompt 39 — Events Table (Supabase)

> Do not open Cursor for this prompt. This is a Supabase SQL editor task.
>
> Open the Supabase dashboard for the OpenDraft project. Go to the SQL editor. Run the following schema exactly as written. This creates the events table that will begin accumulating telemetry data from the moment v1.0 launches. Data that is never logged cannot be recovered retroactively.

```sql
-- Events table for OpenDraft telemetry
create table events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  event_type text not null,
  path text,
  slot_number integer,
  persona text,
  metadata jsonb
);

create index events_session_id_idx on events(session_id);
create index events_created_at_idx on events(created_at);
create index events_event_type_idx on events(event_type);

-- Add telemetry columns to conversations table
alter table conversations
  add column if not exists slots_filled integer default 0,
  add column if not exists total_turns integer default 0,
  add column if not exists completed boolean default false,
  add column if not exists published boolean default false,
  add column if not exists abandoned_at_slot integer,
  add column if not exists session_duration_seconds integer;
```

**Verify:** Table appears in Supabase dashboard under Table Editor. No SQL errors.

---

## Prompt 40 — Supabase RLS Review

> Do not open Cursor for this prompt. This is a Supabase dashboard task.
>
> Review Row Level Security on all four tables before real users hit the database.

Open Supabase → Authentication → Policies. For each table confirm the following:

**`conversations`**
- Users can insert their own rows
- Users can update their own rows
- Users cannot read other users' conversations
- Admin (your user ID) can read all rows

**`drafts`**
- Users can insert their own drafts
- Anyone can read published drafts (published = true)
- Only the owner can update or delete their draft

**`votes`**
- Authenticated users can insert one vote per draft
- Anyone can read vote counts

**`events`**
- Service role only — no public read or write
- Events are written server-side through the API, never directly from the client

If any policy is missing or incorrect, add it in the Supabase policy editor before proceeding. The events table should have no public access — telemetry is private.

**Verify:** All four tables have policies. Events table has no public policy.

---

## Prompt 41 — Wire logEvent into the Conversation Engine

> Read CLAUDE.md and TELEMETRY.md. Add event logging to the conversation engine. This is the only prompt that touches application code in Playbook 5.
>
> Four changes only. Do not modify any other file.
>
> **Change 1 — `/lib/supabase-client.ts`**
> Add the `logEvent` function exactly as specified in TELEMETRY.md Part 1:
>
> ```typescript
> export async function logEvent(
>   sessionId: string,
>   eventType: string,
>   options?: {
>     path?: string
>     slotNumber?: number
>     persona?: string
>     metadata?: Record<string, unknown>
>   }
> ): Promise<void> {
>   supabase.from('events').insert({
>     session_id: sessionId,
>     event_type: eventType,
>     path: options?.path ?? null,
>     slot_number: options?.slotNumber ?? null,
>     persona: options?.persona ?? null,
>     metadata: options?.metadata ?? null,
>   }).then(({ error }) => {
>     if (error) console.error('Event log failed:', error)
>   })
> }
> ```
>
> **Change 2 — `app/draft/page.tsx`**
> Import `logEvent` from `@/lib/supabase-client`.
>
> Add `logEvent(sessionId, 'session_started')` on first message submission — fire only when `messages.length === 0` before the submission (i.e. this is the first message).
>
> **Change 3 — `app/draft/page.tsx`**
> After each successful slot fill (when `updatedState` shows a slot moving to `filled` that was not `filled` before), call:
> ```typescript
> logEvent(sessionId, 'slot_filled', {
>   path: updatedState.path,
>   slotNumber: filledSlotNumber,
> })
> ```
>
> **Change 4 — `app/draft/page.tsx`**
> After a successful publish (in the publish handler), call:
> ```typescript
> logEvent(sessionId, 'draft_published', {
>   path: state.path,
> })
> ```
>
> All four `logEvent` calls are fire-and-forget. No `await`. No UI impact.
>
> Done when: `npx tsc --noEmit` passes. No console errors. Events table receives rows during a test session.

**Verify:** Run a test session. Open Supabase → events table. Confirm `session_started` row appears after first message. Confirm `draft_published` row appears after publish.

---

## Prompt 42 — Vercel Environment Variables

> Do not open Cursor for this prompt. This is a Vercel dashboard task.
>
> Open vercel.com → OpenDraft project → Settings → Environment Variables.
> Add every variable from your local `.env.local`. At minimum:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (if used in API routes) |

Set all variables for **Production**, **Preview**, and **Development** environments.

**Do not put these in the codebase. Do not commit `.env.local`. Confirm `.env.local` is in `.gitignore` before the next prompt.**

**Verify:** All variables appear in Vercel dashboard. `.env.local` is in `.gitignore`.

---

## Prompt 43 — Push to Main and Deploy

> Read CLAUDE.md. This is the deploy prompt. One action only.
>
> Confirm `npx tsc --noEmit` passes locally. Confirm no uncommitted changes that should not go to production. Then push to main.
>
> ```bash
> git add .
> git commit -m "feat: OpenDraft v1.0 — ship"
> git push origin main
> ```
>
> Vercel will auto-deploy on push. Watch the Vercel build log for errors.
>
> Common build errors and fixes:
> - **Missing environment variable** → add to Vercel dashboard, redeploy
> - **Type error that passes locally but fails in Vercel** → Vercel uses strict mode; fix the type and push again
> - **Module not found** → check import paths for case sensitivity (Vercel is case-sensitive, Windows is not)
>
> Do not move to Prompt 44 until the Vercel build log shows a green deployment.

**Verify:** Vercel dashboard shows successful deployment. opendraft.dev loads in the browser.

---

## Prompt 44 — Smoke Test on Production

> Do not open Cursor for this prompt. This is a manual browser test on the live URL.
>
> Open opendraft.dev on your phone. Not localhost. The real URL.
>
> Run this sequence:

| Step | Action | Expected |
|---|---|---|
| 1 | Open opendraft.dev | Screen 1 loads. Ruled paper. "CREATE A DRAFT" button. |
| 2 | Tap ① | InfoModal opens with correct copy. |
| 3 | Tap "Get Started" | Navigates to /draft. |
| 4 | Type an idea and submit | Real AI response. Understood + Question. Ruled lines gone. |
| 5 | Two more exchanges | Conversation builds correctly in the paper. |
| 6 | Open Supabase dashboard | conversations row exists for this session. |
| 7 | Open Supabase events table | session_started event logged. |
| 8 | Navigate to /feed | Feed loads. "OpenDraft — Feed" in tab. |

If any step fails on production but passed locally, the cause is almost always one of three things: missing environment variable, Supabase RLS policy blocking a write, or a case-sensitive import path. Check in that order.

**Verify:** All 8 steps pass on the live URL on your phone.

---

## Prompt 45 — First Real Draft

> This is not a Cursor prompt. This is a product moment.
>
> Open opendraft.dev. Submit a real idea — something you actually believe should change. Run it through the full pipeline. Answer every question the AI asks. Fill all seven slots. Publish the draft.
>
> This is the first real entry in the OpenDraft feed. It sets the standard for what a completed draft looks like. Make it count.
>
> After publishing, screenshot the draft card in the feed. That's the v1.0 proof of life.

---

## Ship Checklist

Work through this in order. Every item must be green before Prompt 43.

- [ ] Events table created in Supabase (Prompt 39)
- [ ] Supabase RLS reviewed and correct on all four tables (Prompt 40)
- [ ] `logEvent` wired into conversation engine (Prompt 41)
- [ ] `npx tsc --noEmit` passes after Prompt 41
- [ ] All environment variables set in Vercel dashboard (Prompt 42)
- [ ] `.env.local` confirmed in `.gitignore`
- [ ] Vercel build log shows green deployment (Prompt 43)
- [ ] Smoke test passes on live URL on your phone (Prompt 44)
- [ ] First real draft published to the feed (Prompt 45)

---

## What Comes After — The v1.5 and Beyond Roadmap

| Playbook | Version | Focus |
|---|---|---|
| ✅ Playbook 1 | v1.0 | Shell and Paper |
| ✅ Playbook 2 | v1.0 | AI connection and Toolbar |
| ✅ Playbook 3 | v1.0 | Output layer |
| ✅ Playbook 4 | v1.0 | Polish and wiring |
| ✅ Playbook 5 | v1.0 | Ship |
| Playbook 6 | v1.5 | Telemetry — see TELEMETRY.md for full spec |
| Playbook 7 | v2.0 | Persona pipeline — see PERSONAS.md. Awaits reading stack (March 16) and first telemetry cycle |
| Playbook 8 | v2.0 | Expert mode — faster path for users who know what they want |

---

## Documents in the Project Root

| File | Purpose |
|---|---|
| `CLAUDE.md` | Single source of truth for Cursor |
| `.cursorrules` | Cursor behavioral rules |
| `PERSONAS.md` | Full persona pipeline — all 21 personas with justifications |
| `TELEMETRY.md` | Admin dashboard and feedback loop spec for v1.5 |
| `opendraft-system-prompt-v1.md` | Current AI system prompt |
| `pipeline.md` | Full product spec |

---

*OpenDraft — opendraft.dev*
*Playbook 5 — Ship*
*Last updated: March 9, 2026*
