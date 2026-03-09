# OpenDraft — Playbook 3
## Prompts 25–31: The Output Layer
> One component. One job. Verify before moving on.

---

## What This Playbook Builds

This is the payoff. By the end of this playbook a completed conversation becomes a real formatted document that can be published to a public feed. The paper shows the draft. The user confirms it. It goes live.

Seven steps:
1. `PolicyDraftTemplate` — Legislative Launchpad structure
2. `ProductDraftTemplate` — Silicon Valley Handoff structure
3. `DraftDocument` — assembles from confirmed slot content
4. `PublishButton` — fires only when all 7 slots confirmed
5. `SupabaseClient` — database wrapper
6. `PublicFeedScreen` — all published drafts
7. `DraftCard` + `VoteButtons` — feed cards with upvote/downvote

---

## Before You Start

- [ ] Playbook 2B fully verified — all toolbar components working
- [ ] `npx tsc --noEmit` runs clean
- [ ] Supabase project created at supabase.com
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Supabase schema created (see below)

---

## Supabase Setup — Do This Before Prompt 25

Go to supabase.com, create a project, open the SQL editor, and run this:

```sql
-- conversations: session state and full history
create table conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  goal_tree_state jsonb not null,
  message_history jsonb not null,
  path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- drafts: completed, published documents
create table drafts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  title text not null,
  slot_content jsonb not null,
  formatted_document text not null,
  likelihood_score integer,
  existence_check_status text,
  published_at timestamptz default now()
);

-- votes: upvote and downvote records
create table votes (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references drafts(id),
  device_fingerprint text not null,
  value integer not null,
  created_at timestamptz default now(),
  unique(draft_id, device_fingerprint)
);
```

Then install the Supabase client: `npm install @supabase/supabase-js`

---

## Prompt 25 — PolicyDraftTemplate

> Read CLAUDE.md. Build `PolicyDraftTemplate` in `/components/output/PolicyDraftTemplate.tsx`.
>
> This component renders the Legislative Launchpad draft structure from filled slot content. It is a pure display component — it receives slot content as props and renders formatted sections. It does not call any API or modify any state.
>
> ```typescript
> interface PolicyDraftTemplateProps {
>   slot1: string  // Specific Harm
>   slot2: string  // Gap and Consequences
>   slot3: string  // Proposed Mechanism
>   slot4: string  // Enforcement
>   slot5: string  // Jurisdiction
>   slot6: string  // Precedent and Fiscal Note
>   slot7: string  // Political Landscape
>   title?: string // Optional bill title
> }
> ```
>
> Render five sections in Playfair Display serif, navy text, with clear section headers:
>
> ```
> DRAFT POLICY PROPOSAL
>
> I. Title & Summary
> II. The Problem (Findings)
> III. The Solution (Statutory Changes)
> IV. Impact & Feasibility
> V. Political Landscape
>
> Submitted by: Anonymous — OpenDraft
> ```
>
> Each section maps to slots as defined in CLAUDE.md. Use `font-serif` for all body text. Section headers in small caps or bold. Clean document spacing.
>
> Done when: component renders all five sections with placeholder prop values passed in.
>
> **Notes:**
> - This is a display component only — no state, no API, no logic
> - After building, add a temporary render in `app/draft/page.tsx` with hardcoded placeholder strings for each slot to verify it looks like a real document
> - Do not modify any other file

**Verify:** Document renders with all five sections. Looks like a real policy document at 390px.

---

## Prompt 26 — ProductDraftTemplate

> Read CLAUDE.md. Build `ProductDraftTemplate` in `/components/output/ProductDraftTemplate.tsx`.
>
> Same pattern as PolicyDraftTemplate but for the Silicon Valley Handoff structure.
>
> ```typescript
> interface ProductDraftTemplateProps {
>   slot1: string  // User Pain and Evidence
>   slot2: string  // User Story and Happy Path
>   slot3: string  // Specific Feature
>   slot4: string  // Target Company and Success Metric
>   slot5: string  // Existing Landscape
>   slot6: string  // Value Proposition and OKR Alignment
>   slot7: string  // Risks and Non-Goals
>   targetCompany?: string
> }
> ```
>
> Render six sections:
>
> ```
> DRAFT PRODUCT PROPOSAL
> To: [targetCompany]
>
> I. Executive Summary
> II. The Problem Statement
> III. User Story & Happy Path
> IV. Functional Requirements
> V. Business Case
> VI. Landscape & Risk
>
> Submitted by: Anonymous — OpenDraft
> ```
>
> Same styling as PolicyDraftTemplate — font-serif, navy, clean document spacing.
>
> Done when: component renders all six sections with placeholder prop values.
>
> **Notes:**
> - After building, add a temporary render in `app/draft/page.tsx` alongside PolicyDraftTemplate to verify both look correct
> - Do not modify any other file

**Verify:** Both templates visible in draft page. Both look like real documents at 390px.

---

## Prompt 27 — DraftDocument

> Read CLAUDE.md. Build `DraftDocument` in `/components/output/DraftDocument.tsx`.
>
> DraftDocument is the orchestration component. It receives `GoalTreeState` and renders the correct template based on `state.path`. It only renders when `allFilled` is true — when all 7 slots are confirmed. Before that it renders nothing.
>
> ```typescript
> interface DraftDocumentProps {
>   state: GoalTreeState
>   allFilled: boolean
> }
> ```
>
> When `allFilled` is false: return null.
> When `allFilled` is true and `state.path === 'policy'`: render `PolicyDraftTemplate` with slot content from state.
> When `allFilled` is true and `state.path === 'product'`: render `ProductDraftTemplate` with slot content from state.
>
> Extract slot content from `state.slots.slot1.content` through `slot7.content`. Pass each as the corresponding prop.
>
> Done when: component renders the correct template when allFilled=true, renders nothing when false.
>
> **Notes:**
> - `allFilled` comes from `useSlotTracker` — already wired in `app/draft/page.tsx`
> - Add `<DraftDocument state={state} allFilled={allFilled} />` inside `PaperScrollContainer` in `app/draft/page.tsx`, after the messages map
> - For now test by temporarily setting `allFilled={true}` and `state.path='policy'` with mock slot content in page state
> - Do not modify any other file than `DraftDocument.tsx` and `app/draft/page.tsx`

**Verify:** With allFilled=true renders PolicyDraftTemplate. With allFilled=false renders nothing.

---

## Prompt 28 — PublishButton

> Read CLAUDE.md. Build `PublishButton` in `/components/output/PublishButton.tsx`.
>
> PublishButton appears below the paper when all 7 slots are confirmed. It does not appear before that. Tapping it triggers the publish flow.
>
> ```typescript
> interface PublishButtonProps {
>   allFilled: boolean
>   onPublish: () => void
>   isPublishing: boolean
> }
> ```
>
> When `allFilled` is false: return null.
> When `allFilled` is true: render a full-width navy button with white text: "PUBLISH DRAFT". All caps, no rounded pill shape — use `rounded-md`. When `isPublishing` is true show "Publishing..." and disable the button.
>
> Done when: button appears when allFilled=true, disappears when false, shows loading state.
>
> **Notes:**
> - Use shadcn `Button` from `@/components/ui/button` as the base
> - Add `<PublishButton allFilled={allFilled} onPublish={() => {}} isPublishing={false} />` to `app/draft/page.tsx` below the Paper block
> - For now `onPublish` is a no-op — it gets wired to Supabase in Prompt 30
> - Do not modify any other file than `PublishButton.tsx` and `app/draft/page.tsx`

**Verify:** Button appears with allFilled=true. Hidden with allFilled=false. Loading state disables button.

---

## Prompt 29 — SupabaseClient

> Read CLAUDE.md. Build the Supabase wrapper in `/lib/supabase-client.ts`.
>
> This file is the only place in the codebase that calls Supabase. Export three functions:
>
> ```typescript
> // Save or update a conversation session
> export async function saveConversation(
>   sessionId: string,
>   goalTreeState: GoalTreeState,
>   messageHistory: ConversationMessage[],
>   path: string | null
> ): Promise<void>
>
> // Publish a completed draft
> export async function publishDraft(
>   sessionId: string,
>   path: string,
>   title: string,
>   slotContent: Record<string, string>,
>   formattedDocument: string,
>   likelihoodScore: number
> ): Promise<string>  // returns the new draft id
>
> // Fetch all published drafts for the feed
> export async function fetchDrafts(): Promise<Draft[]>
> ```
>
> Also export a `Draft` type:
> ```typescript
> export type Draft = {
>   id: string
>   path: string
>   title: string
>   formatted_document: string
>   likelihood_score: number
>   published_at: string
>   vote_count?: number
> }
> ```
>
> Use `createClient` from `@supabase/supabase-js` with `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
>
> Done when: all three functions exported, TypeScript clean, no calls on import.
>
> **Notes:**
> - Install first if not done: `npm install @supabase/supabase-js`
> - `saveConversation` uses upsert on `session_id`
> - `publishDraft` inserts into `drafts` table and returns the new `id`
> - `fetchDrafts` selects all from `drafts` ordered by `published_at` descending
> - Wrap all in try/catch with clear error messages
> - Do not modify any other file

**Verify:** `npx tsc --noEmit` clean. No Supabase calls fire on import.

---

## Prompt 30 — Wire Publish

> Read CLAUDE.md. Wire the publish flow in `app/draft/page.tsx` and `app/api/publish/route.ts`.
>
> When the user taps PublishButton:
> 1. Set `isPublishing = true`
> 2. Call `POST /api/publish` with `{ state, sessionId, path, formattedDocument }`
> 3. On success, redirect to `/feed`
> 4. On failure, show a Sonner toast error: "Publish failed. Please try again."
>
> In `app/api/publish/route.ts`:
> 1. Read body: `{ state, sessionId, path, formattedDocument }`
> 2. Extract slot content from state
> 3. Generate a title from slot 1 content (first 60 characters)
> 4. Call `publishDraft` from `@/lib/supabase-client`
> 5. Return `{ success: true, draftId }`
>
> Done when: tapping PublishButton calls the API, saves to Supabase, redirects to `/feed`.
>
> **Notes:**
> - Generate a `sessionId` in `app/draft/page.tsx` using `useState` initialized with `crypto.randomUUID()`
> - Use `useRouter` from `next/navigation` for the redirect
> - Import `toast` from `sonner` for the error toast
> - Test by temporarily setting `allFilled=true` with mock slot content, tapping publish, and checking the Supabase dashboard for the new row
> - Do not modify any other file than `app/draft/page.tsx` and `app/api/publish/route.ts`

**Verify:** Tap PublishButton → row appears in Supabase drafts table → page redirects to `/feed`.

---

## Prompt 31 — PublicFeedScreen + DraftCard + VoteButtons

> Read CLAUDE.md. Build the public feed in `app/feed/page.tsx`, `DraftCard` in `/components/feed/DraftCard.tsx`, and `VoteButtons` in `/components/feed/VoteButtons.tsx`.
>
> **`app/feed/page.tsx`:** Fetches all published drafts using `fetchDrafts()` from `@/lib/supabase-client`. Renders TopNav, a scrollable list of DraftCards, and BottomNav variant="active". Title above the list: "Public Drafts" in navy Playfair Display.
>
> **`DraftCard`:**
> ```typescript
> interface DraftCardProps {
>   id: string
>   path: 'policy' | 'product'
>   title: string
>   excerpt: string      // first 120 chars of formatted_document
>   likelihoodScore: number
>   publishedAt: string
>   voteCount: number
>   onVote: (value: 1 | -1) => void
> }
> ```
> Use shadcn `Card`. Show: CategoryTag (navy for policy, forest green for product), title in Playfair, excerpt in Inter, LikelihoodBadge, VoteButtons, published date.
>
> **`VoteButtons`:**
> ```typescript
> interface VoteButtonsProps {
>   voteCount: number
>   onVote: (value: 1 | -1) => void
> }
> ```
> Two buttons: upvote (▲) and downvote (▼). Vote count between them. Navy text. Tapping calls `onVote`.
>
> **`CategoryTag`:** Simple Badge variant — navy background for policy, forest green for product. Text: "Policy" or "Product".
>
> Done when: feed renders published drafts as cards with vote buttons at 390px.
>
> **Notes:**
> - Feed page is a server component — use `async/await` with `fetchDrafts()` directly, no `useEffect`
> - VoteButtons call `POST /api/vote` — stub this endpoint for now, real vote logic is v1.5
> - Use device fingerprint via `navigator.userAgent` hash for anonymous voting — v1.5
> - Do not modify any other file

**Verify:** Navigate to `/feed`. Published drafts appear as cards. Upvote/downvote buttons visible. No console errors.

---

## After Prompt 31 — Full Output Layer Verify

Stop. Check every item.

- [ ] PolicyDraftTemplate renders all five sections correctly
- [ ] ProductDraftTemplate renders all six sections correctly
- [ ] DraftDocument renders correct template based on path, hidden when not allFilled
- [ ] PublishButton appears only when allFilled=true, shows loading state
- [ ] SupabaseClient — `npx tsc --noEmit` clean, no calls on import
- [ ] Publish flow — tap button → row in Supabase → redirect to `/feed`
- [ ] Feed renders published drafts as cards
- [ ] DraftCard shows CategoryTag, title, excerpt, score, vote buttons
- [ ] No console errors
- [ ] `npx tsc --noEmit` clean

When all boxes are checked, the v1 product loop is complete:

**Conversation → 7 slots → Draft → Publish → Feed → Upvote**

---

## After Playbook 3 — What Remains for v1 Ship

- [ ] Wire `saveConversation` to auto-save on every message
- [ ] Replace hardcoded `score={24}` with real likelihood calculation
- [ ] Screen 1 (Home Feed) — replace test content with real feed
- [ ] `InfoModal` — opens from ① button, explains the product
- [ ] End-to-end test: full conversation → publish → appears in feed
- [ ] Deploy to opendraft.dev on Vercel
- [ ] Update page title and meta description from "Create Next App"

---

## How to Start Each Cursor Session

> "Read CLAUDE.md. We are on [current component]. The last thing completed was [previous component]. Today we are building [today's component]. Do not build anything else."

---

*OpenDraft — opendraft.dev*
*Playbook 3 — The Output Layer*
*Last updated: March 8, 2026*
