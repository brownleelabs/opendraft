# OpenDraft — Playbook 4
## Prompts 32–38: Polish and Ship Preparation
> One component. One job. Verify before moving on.

---

## What This Playbook Builds

The product loop is complete. This playbook makes it feel real. By the end every screen is correct, every interaction is wired, the product has a real identity in the browser, and it is ready to deploy.

Seven steps:
1. `Screen 1` — rebuild app/page.tsx to spec
2. `InfoModal` — ① button opens an explanation of the product
3. `LiveDraftContent` — paper updates live as slots fill during conversation
4. `Auto-save` — conversation saves to Supabase on every message
5. `PaperLines` — wire ruled lines to empty state on Screen 2
6. `Metadata` — real page title and description
7. `End-to-end test` — full conversation to publish to feed, verified

---

## Before You Start

- [ ] Playbook 3 fully verified and all four post-audit fixes applied
- [ ] `npx tsc --noEmit` runs clean
- [ ] Supabase dashboard accessible — you will check rows during testing

---

## Prompt 32 — Screen 1 (Home Feed)

> Read CLAUDE.md. Rebuild `app/page.tsx` to match the Screen 1 specification exactly.
>
> Screen 1 is the home feed. It is not a conversation screen. It has no InputField.
>
> The screen structure:
> - `TopNav` fixed at top
> - `Paper` with `PaperLines` inside — ruled lines only, no content, no onboarding copy
> - `Toolbar` with all four slots empty for now — no badges, no icons yet (Screen 1 toolbar is inactive)
> - `PaginationDots` with `activeDot={1}` — left dot active
> - A "CREATE A DRAFT" CTA button centered below the dots — navy background, white text, all caps, `rounded-none` with a slight `skew-x-[-6deg]` transform to create the parallelogram shape from the design spec. The text inside uses `skew-x-[6deg]` to counter-skew so it reads straight.
> - `BottomNav` with `variant="default"` fixed at bottom
>
> The CTA button navigates to `/draft` using `next/link` or `useRouter`.
>
> Done when: Screen 1 renders correctly at 390px and 1280px. Paper shows ruled lines. "CREATE A DRAFT" button visible. No InputField.
>
> **Notes:**
> - Remove all leftover test content from the previous page.tsx — AppShell test text, stacked BottomNavs, stacked PaginationDots, Paper with placeholder paragraphs
> - The paper on Screen 1 should feel like a blank document waiting to be filled
> - Do not modify any other file

**Verify:** `localhost:3001` at 390px. Blank ruled paper. "CREATE A DRAFT" button. No input field. Tap button — navigates to `/draft`.

---

## Prompt 33 — InfoModal

> Read CLAUDE.md. Build `InfoModal` in `/components/modals/InfoModal.tsx`. Wire it to the ① button in `TopNav.tsx`.
>
> InfoModal opens as a bottom sheet when the user taps ①. It explains what OpenDraft is in plain language — no jargon, no "AI-powered" language.
>
> ```typescript
> interface InfoModalProps {
>   open: boolean
>   onClose: () => void
> }
> ```
>
> Content:
> - Title: "What is OpenDraft?"
> - Body (3 short paragraphs):
>   1. "OpenDraft helps you turn a raw idea into a structured proposal — either a bill for your representative or a feature request for a company."
>   2. "You describe what you want to change. We ask questions until the idea is specific enough to act on. The result is a formatted document that gets sent to the right person."
>   3. "Every published draft is public. Others can read and vote on it. The more support a draft gets, the more times it gets sent."
> - A "Get Started" button at the bottom — navy, full width — that closes the modal and navigates to `/draft`
>
> Wiring: `TopNav` needs to accept an optional `onInfoTap?: () => void` prop. The ① button calls it. In `app/layout.tsx` or the relevant page, pass the handler down. Since TopNav is used across multiple pages, the cleanest approach is to make each page manage the InfoModal state and pass `onInfoTap` to TopNav.
>
> Done when: tapping ① on any screen opens the modal. "Get Started" closes it and goes to `/draft`.
>
> **Notes:**
> - Use `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
> - Add InfoModal state to `app/page.tsx` and `app/draft/page.tsx` — both screens have a TopNav
> - `app/feed/page.tsx` is a server component — handle InfoModal differently there (can omit for now or convert the feed page to a client component)
> - Do not modify any other file than `InfoModal.tsx`, `TopNav.tsx`, `app/page.tsx`, and `app/draft/page.tsx`

**Verify:** Tap ① on Screen 1 and Screen 3. Modal opens with correct copy. "Get Started" navigates to `/draft`.

---

## Prompt 34 — LiveDraftContent

> Read CLAUDE.md. Build `LiveDraftContent` in `/components/paper/LiveDraftContent.tsx`.
>
> LiveDraftContent renders inside the paper during an active conversation (Phase 3). As the AI fills slots through questioning, the paper shows what has been captured so far — not the final formatted draft, but a live preview of confirmed slot content building up on the page.
>
> ```typescript
> interface LiveDraftContentProps {
>   state: GoalTreeState
>   path: 'policy' | 'product' | 'unrouted'
> }
> ```
>
> For each slot that has `status: 'filled'` or `status: 'partial'`, render a labeled section inside the paper:
> - Section label in small forest green caps (e.g. "SPECIFIC HARM", "USER PAIN")
> - Content below in navy serif
> - A subtle divider between sections
>
> Slots with `status: 'empty'` render nothing.
>
> When `path === 'unrouted'` render nothing — the paper shows only onboarding copy and AI responses until the path is confirmed.
>
> Done when: filled slots appear as labeled sections inside the paper. Empty slots show nothing.
>
> **Notes:**
> - Use the same slot label names as GoalTreeModal — policy and product labels from CLAUDE.md
> - Add `<LiveDraftContent state={state} path={state.path} />` to `PaperScrollContainer` in `app/draft/page.tsx`, between `PaperOnboardingCopy` and the messages map
> - For now test by temporarily setting one slot to `status: 'filled'` with mock content in initial state
> - Do not modify any other file than `LiveDraftContent.tsx` and `app/draft/page.tsx`

**Verify:** Temporarily set slot1 to filled with mock content. Label and content appear in paper. Set back to empty — nothing shows. No console errors.

---

## Prompt 35 — Auto-save

> Read CLAUDE.md. Wire auto-save to `app/draft/page.tsx`.
>
> Every time a message is successfully processed, save the current conversation state to Supabase. This is a background operation — it should not block the UI or show any indicator to the user.
>
> In `app/draft/page.tsx`, after the `setMessages` and `setState` calls in `handleSubmit`, add:
>
> ```typescript
> // Auto-save in background — do not await, do not block UI
> saveConversation(sessionId, updatedState, updatedHistory, updatedState.path).catch(
>   (err) => console.error('Auto-save failed:', err)
> )
> ```
>
> Import `saveConversation` from `@/lib/supabase-client`.
>
> Done when: after each message submission, a row is created or updated in the Supabase `conversations` table.
>
> **Notes:**
> - This must not block the UI — fire and forget with `.catch` for silent error logging
> - `updatedHistory` is the new history array after appending the latest exchange
> - Check the Supabase dashboard after submitting a message to confirm the row appears
> - Do not modify any other file than `app/draft/page.tsx`

**Verify:** Submit a message. Open Supabase dashboard → conversations table. Row appears with correct session_id. Submit again — same row updates.

---

## Prompt 36 — Metadata

> Read CLAUDE.md. Update the page metadata in `app/layout.tsx` and add page-specific metadata to each route.
>
> In `app/layout.tsx`, update the `metadata` export:
> ```typescript
> export const metadata: Metadata = {
>   title: 'OpenDraft — Turn your idea into a proposal',
>   description: 'OpenDraft helps citizens turn raw ideas into structured bill proposals and product feature requests through AI-guided questions.',
> }
> ```
>
> In `app/page.tsx`, add page-specific metadata:
> ```typescript
> export const metadata: Metadata = {
>   title: 'OpenDraft — Public Drafts',
>   description: 'Browse citizen-drafted proposals and product feature requests.',
> }
> ```
>
> In `app/feed/page.tsx`, add:
> ```typescript
> export const metadata: Metadata = {
>   title: 'OpenDraft — Feed',
>   description: 'All published drafts from OpenDraft citizens.',
> }
> ```
>
> Done when: browser tab shows correct title on each page.
>
> **Notes:**
> - `app/draft/page.tsx` is a client component (`'use client'`) — metadata exports do not work in client components in Next.js App Router. Leave the draft page with the default layout title for now.
> - Do not modify any other file than `app/layout.tsx`, `app/page.tsx`, and `app/feed/page.tsx`

**Verify:** Browser tab shows "OpenDraft — Turn your idea into a proposal" on home. "OpenDraft — Feed" on feed page.

---

## Prompt 37 — Wire PaperLines to Empty State

> Read CLAUDE.md. Wire `PaperLines` to the correct empty state in `app/draft/page.tsx`.
>
> Currently `PaperLines` may not be rendered at all, or may always be visible. The correct behavior:
> - Screen 2 (no messages yet): Paper shows `PaperLines` (ruled lines) behind `PaperOnboardingCopy`
> - Screen 3 (messages exist): Paper shows conversation content — `PaperLines` hidden
>
> In `app/draft/page.tsx`, add a condition:
> ```typescript
> const hasMessages = messages.length > 0
> ```
>
> Inside `PaperScrollContainer`:
> - When `!hasMessages`: render `<PaperLines />` and `<PaperOnboardingCopy />`
> - When `hasMessages`: render `<LiveDraftContent />`, the messages map, and `<DraftDocument />`
>
> Done when: fresh load of `/draft` shows ruled paper with onboarding copy. After first message — lines disappear, conversation takes over.
>
> **Notes:**
> - `PaperLines` should sit behind content visually — render it first in the container
> - Do not modify any other file than `app/draft/page.tsx`

**Verify:** Load `/draft` fresh — ruled lines visible, onboarding copy visible. Submit a message — lines disappear, AIResponseBlock appears. No console errors.

---

## Prompt 38 — End-to-End Test

> Read CLAUDE.md. This is not a build prompt. Run a full end-to-end test of the product and report what works and what breaks.
>
> Test this exact sequence:
>
> 1. Open `localhost:3001` — Screen 1 loads. Ruled paper. "CREATE A DRAFT" button visible.
> 2. Tap "CREATE A DRAFT" — navigates to `/draft`. Ruled paper with onboarding copy. Input field visible.
> 3. Tap ① — InfoModal opens. "Get Started" closes it.
> 4. Type an idea and submit — ruled lines disappear. AIResponseBlock appears with real Understood + Question.
> 5. Continue the conversation for 3-4 exchanges — paper scrolls, each response appears correctly.
> 6. Open MemoryButton — GoalTreeModal shows current slot state.
> 7. Open ProgressButton — ProgressChartModal shows 0% (slots still empty since slot detection is not yet wired).
> 8. Tap LikelihoodBadge — LikelihoodDetailPanel opens.
> 9. Check Supabase conversations table — row exists and updates on each message.
> 10. Temporarily force allFilled=true with mock slot content — DraftDocument renders. PublishButton appears.
> 11. Tap "PUBLISH DRAFT" — row appears in Supabase drafts table. Redirects to `/feed`.
> 12. `/feed` shows the published draft as a card with CategoryTag, title, excerpt, vote buttons.
>
> For each step report: PASS or FAIL with one sentence of detail on failures.
>
> Fix any failures that are single-file changes. Flag anything that requires more work.
>
> Do not build new features. Fix only what is broken.

**Verify:** All 12 steps pass or failures are documented and either fixed or flagged.

---

## After Prompt 38 — Ship Checklist

When all 12 steps pass, OpenDraft v1 is ready to deploy.

- [ ] All 12 end-to-end steps pass
- [ ] `npx tsc --noEmit` clean
- [ ] No console errors on any screen
- [ ] Supabase rows saving correctly
- [ ] Browser tab titles correct on all pages
- [ ] "CREATE A DRAFT" navigates correctly
- [ ] ① button works on all screens

When this checklist is green — Playbook 5 is deploy to opendraft.dev.

---

## How to Start Each Cursor Session

> "Read CLAUDE.md. We are on [current component]. The last thing completed was [previous component]. Today we are building [today's component]. Do not build anything else."

---

## What Comes After — Playbook 5 (Ship)

- Add environment variables to Vercel dashboard
- Push to main — Vercel auto-deploys
- Smoke test on opendraft.dev
- Submit the first real draft through the live product
- Share with first users

---

*OpenDraft — opendraft.dev*
*Playbook 4 — Polish and Ship Preparation*
*Last updated: March 8, 2026*
