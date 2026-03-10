# CLAUDE.md — OpenDraft
> Read this file completely at the start of every session. It is the single source of truth for what this project is, where it stands, and how it is built. Do not make assumptions. Do not infer from partial context. Read this file.

---

## What This Is

OpenDraft is a free civic technology platform that helps regular citizens turn raw ideas into structured, formatted draft documents — either a bill proposal or a product proposal — that can be submitted to a representative or a company.

The core mechanic is Socratic AI interrogation. The AI never generates ideas. It asks questions until the user has articulated their own idea clearly enough to populate a structured output template. The document builds live on screen as the conversation progresses. When all slots are filled, the draft is published to a public feed where others can read and vote on it. Every completed draft is then manually routed by the OpenDraft team to the correct policymaker or product team.

**This is not a chatbot. It is a civic drafting tool.**

**Domain:** opendraft.dev (purchased, live on Vercel)
**Repository:** Private on GitHub — not open source. Free to use, self-funded, no monetization goal.
**Repository owner:** Andrew Brownlee — Chicago, IL
**Company:** Offbeat Options LLC

---

## Demo Path

**CANONICAL DEMO FLOW (on phone):**
1. Open opendraft.dev
2. Tap "CREATE A DRAFT"
3. Type: "I want Chicago to require landlords to disclose pending demolition permits before signing leases"
4. Follow the AI through 7 questions
5. Watch the paper fill in real time
6. Tap "PUBLISH DRAFT"
7. Show the feed — draft is live

**TALKING POINTS:**
- "The AI never writes for you — it asks questions until you've written it yourself"
- "Every published draft is a structured proposal ready to send to a real person"
- "The feed is a public record of civic ideas"
- "We track every session — which slots cause drop-off, which path users choose, how long it takes"

---

## The Founder

Andrew Brownlee. IBM Strategic Account Manager (HashiCorp portfolio — Vault, Terraform, Boundary). Previously: Corporate Account Manager at HashiCorp/IBM (123% attainment), Google Small Business Account Manager (108% attainment, $2M quota, Gemini AI adoption focus), MongoDB Associate AE (114% attainment, Verizon and Disney accounts). Apple Genius Bar background. University of Toledo. 500+ LinkedIn connections.

**Why this matters for the build:** Andrew's background is enterprise sales, not engineering. He builds deliberately, prompts carefully, and does not let AI run ahead of understanding. Every component is built to be understood, not just to work. The sales discipline applies here — close each component before opening the next.

---

## The Five Foundation Documents

These files exist in the project root and contain the full product specification. Read them when context is needed beyond what this file provides.

| File | Purpose |
|---|---|
| `pipeline.md` | Full product spec — Goal Tree, 4 levels, both paths, 7 slots each, phase transitions, invisible tracking layer |
| `opendraft-system-prompt-v1.md` | The complete AI system prompt — persona, all 7 slots for both paths, edge cases, output templates |
| `opendraft-design-decisions.md` | Every UI/UX decision with reasoning — opening question, paper metaphor, screen inventory, copy decisions |
| `opendraft-component-inventory.md` | Every component in the codebase — dependencies, build priority, TypeScript interfaces |
| `opendraft-build-foundation.md` | Stack, sprint order, mobile-first rules, environment variables |

**Do not contradict these documents. If a decision is not in this file, check those files before inventing an answer.**

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js App Router | Same as prior project (Offbeat Command) — no relearning |
| Styling | Tailwind CSS | Utility-first, mobile-first, no inline styles ever |
| Components | shadcn/ui | Already studied. Components pre-selected. |
| Database | Supabase (Postgres) | Same as prior project. Row-level security for v1.5 auth. |
| AI — Main | claude-sonnet-4-6 | Conversation, synthesis, draft generation |
| AI — Fast | claude-haiku-4-5-20251001 | Input validation, slot detection, path routing |
| Deployment | Vercel | Domain already connected. Auto-deploy on push to main. |
| Language | TypeScript | Strict mode. No `any`. No exceptions. |

---

## Architecture

### Telemetry & Admin
- Events are written via POST /api/log-event (server route, service role).
- Admin dashboard lives at /admin — password protected, server components only except RecentSessions (client, for expand/collapse).
- Analytics queries live in lib/analytics.ts — server-only.
- Weekly report available at GET /api/admin/report.
- Server action for session events: app/admin/actions.ts.

---

## Design System

### Color Palette
```
Navy:         #1B2A4A  — primary text, headers, TopNav background
Forest Green: #2D5016  — input field border/label, Category tag (Product), accents
Cream:        #FAF8F3  — app background
White:        #FFFFFF  — paper surface, card surface
```

### Typography
- **Headings:** Serif font (civic gravitas — Playfair Display or equivalent)
- **Body:** Inter (clean, readable, neutral)
- **Paper content:** Serif — the document being built must feel like a real document
- **UI chrome:** Inter — toolbar, nav, badges, labels

### The Aesthetic North Star
OpenDraft looks like a civic institution, not a tech startup. The references are Wikipedia, Library of Congress, and early Obama campaign design. It does not use dark gradients, purple orbs, or the phrase "powered by AI" anywhere visible. When someone lands on OpenDraft in the first three seconds they should feel: **"My voice matters here."** Not: "Oh, another AI chatbot."

### What Never Appears in This UI
- Rounded pill buttons with gradient fills
- Animated background blobs
- "✨ AI-powered" anywhere
- Dark mode (not in v1)
- Generic sans-serif body text on the paper component

### GOV.UK Design System alignment
We use [GOV.UK Design System](https://design-system.service.gov.uk/) for spacing scale, focus/active states, and component patterns where applicable. We keep OpenDraft colours (navy, forest green, cream, white) and typography (serif for document, Inter for UI). Spacing follows an 8px base scale (Tailwind: 2, 4, 6, 8, 10, 12). All interactive elements have a visible focus style (e.g. 2–3px ring, offset) and an active/pressed state for tactility (e.g. `active:scale-[0.98]` or `active:opacity-80`). Touch targets and tap feedback follow GOV.UK guidance. We do not install `govuk-frontend`; we apply the scale and patterns via Tailwind and our components.

---

## The Paper Metaphor

The central visual and interaction metaphor is a piece of paper. Every screen in the product is built around this metaphor. The paper is a fixed-size container. It does not grow or shift the layout. Content scrolls inside it. The document builds live inside the paper as the conversation progresses.

**Paper component rules — never violate:**
- Fixed height container — does not expand
- `overflow-y: scroll` inside — content grows, container does not
- Auto-scroll to bottom on every new addition
- White background (#FFFFFF), subtle border suggesting a physical document edge
- Serif typography for all content inside the paper
- Smooth scroll to bottom when new content is added

---

## Screen Inventory (4 Screens)

All four screens share the same structural layout: TopNav → Paper → Toolbar → PaginationDots → InputField → BottomNav. The layout never changes. Only the content inside each zone changes between screens.

### Screen 1 — Home Feed
Paper is blank with ruled lines. Toolbar shows inactive slots (2-3-4-5). CTA button: **"CREATE A DRAFT"** (all caps, parallelogram shape — not a standard rounded button). Bottom nav: 6 | Home | 7. Pagination dot: left active.

### Screen 2 — Draft Initiation
Paper contains onboarding copy: *"To get started, describe the change you want to see in the [forest green] text box below ↓"* Input field placeholder: "Describe the change you want to see." Toolbar activates. Pagination dot: center active.

### Screen 3 — Active Conversation
Paper updates live as AI fills slots. Toolbar shows: LikelihoodBadge (25%) | ExpertButton (person icon, v1.5) | MemoryButton (Brain icon, lucide-react) | ProgressButton (chart). AI response block between paper and input: "Understood: [summary] / Question: '[question]'" Bottom nav changes: Pencil (previous drafts) | Home (reset) | Pages (public feed). Pagination dot: right active.

### Screen 4 — Public Feed
Not yet sketched. Card-based feed of all published drafts. Upvote/downvote. Accessed via Pages icon in bottom nav.

---

## Component Architecture

Build in this exact order. Do not skip. Do not build the next component until the current one renders correctly at 390px and 1280px.

### Week 1 — Shell and Paper (build these first)
1. `AppShell` — cream background, mobile constraint, slot structure
2. `TopNav` — OpenDraft wordmark center, ① info button top right
3. `BottomNav` — two variants: `default` (6/Home/7) and `active` (Pencil/Home/Pages). One component, two variants via prop.
4. `Paper` — fixed container, white background, document border
5. `PaperScrollContainer` — internal overflow scroll, auto-scroll to bottom
6. `PaperLines` — ruled lines for empty state (repeating linear-gradient)
7. `InputField` — Textarea from shadcn, forest green border/label, two states
8. `PaginationDots` — three dots, active dot filled

### Week 1 continued — First live interaction
9. `PaperOnboardingCopy` — static text on paper, Screen 2
10. `GoalTreeState` — TypeScript interface only, no AI yet
11. `AIResponseBlock` — "Understood: / Question:" two-part structure, mock data first
12. `ConversationEngine` — stub with hardcoded responses first, real API second
13. `LiveDraftContent` — renders from GoalTreeState, both paths

### Week 2 — Real AI and Tracking
14. `AnthropicClient` — wrapper in `/lib/anthropic-client.ts`, never called directly from components
15. `SystemPrompt` — in `/lib/system-prompt.ts`, loads from `opendraft-system-prompt-v1.md`
16. `SlotTracker` — custom hook `useSlotTracker`, derived from GoalTreeState
17. `ConversationEngine` — real, connected to Anthropic
18. `Toolbar` — layout wrapper for four slots
19. `LikelihoodBadge` — Badge from shadcn, hidden until slot 1 filled
20. `MemoryButton` — Brain icon (lucide-react), opens GoalTreeModal
21. `ProgressButton` — chart icon, opens ProgressChartModal
22. `GoalTreeModal` — shows current slot state in plain language
23. `ProgressChartModal` — visual slot completion breakdown
24. `LikelihoodDetailPanel` — explains score factors when badge tapped

### Week 3 — Output
25. `PolicyDraftTemplate` — Legislative Launchpad structure
26. `ProductDraftTemplate` — Silicon Valley Handoff structure
27. `DraftDocument` — assembles from confirmed slot content, formatter not author
28. `PublishButton` — fires only when all 7 slots confirmed
29. `SupabaseClient` — wrapper in `/lib/supabase-client.ts`

### Week 4 — Social Layer and Ship
30. `PublicFeedScreen` — all published drafts
31. `DraftCard` — Card from shadcn, title + CategoryTag + excerpt + VoteButtons
32. `CategoryTag` — Badge variant: `policy` (navy) or `product` (forest green)
33. `VoteButtons` — Button Group from shadcn, upvote/downvote
34. `PreviousDraftsScreen` — user's draft history
35. `DraftResume` — restores GoalTreeState from Supabase on re-entry
36. `InfoModal` — opens from ① button, explains the product in plain language

### v1.5 — Post-Launch
37. `ExpertButton` — person icon, surfaces related policies/products via LegiScan + CongressMCP
38. `ExpertPanel` — results from Expert query, updates live as slots fill
39. Authentication and user accounts
40. Author attribution on published drafts

---

## AI Architecture

### Model Split
Every user message triggers two types of Anthropic calls:

**claude-haiku-4-5-20251001** — cheap, fast, used for:
- Input validation (is this a real message or noise)
- Slot update detection (does this message fill a slot)
- Path routing (policy vs product, Level 2 only)

**claude-sonnet-4-6** — reasoning-capable, used for:
- Main conversation response (Understood + Question)
- Synthesis (all 7 slots filled → generate draft)
- Existence check reasoning

**Prompt caching:** The system prompt is ~4,000 tokens. Enable caching from day one. Every conversation re-uses the cached system prompt. Without caching this is 4,000 tokens × every message × every user. With caching it is a fraction of that. This is not optional.

**Cost per full session:** ~$0.10–0.20. At 1,000 sessions/month: $100–200.

### The Pipeline (every user message)
1. Input validation — Haiku
2. State check — which phase, which slots filled
3. Slot update detection — does this message fill or advance a slot — Haiku
4. Existence check — runs when Slot 6 fires (policy) or Slots 4-5 fire (product)
5. Coherence check — do all slots still fit together
6. Path routing — Haiku, Level 2 only
7. Question selection — which question type is needed now
8. Main LLM call — Sonnet
9. Output validation — exactly one question returned, no premature synthesis

### The Existence Check (critical — read carefully)
When the system detects a potential match with existing law or product, it does not silently decrease the score. It surfaces the finding explicitly and requires a user response before the conversation continues.

Five scenarios:

| Scenario | Response | Score Impact |
|---|---|---|
| Identical law in same jurisdiction | Surface it. User must articulate what's different or stop. | Major decrease |
| Similar law exists elsewhere | Surface as positive precedent. Auto-populate Slot 6. | Increase |
| Prior bill failed | Surface failure + reason. User must address why this attempt would succeed. | Moderate decrease until addressed |
| Feature exists in target company's product | Surface it. User must redirect or articulate improvement. | Major decrease |
| Feature exists at competitor only | Surface as competitive leverage. Auto-populate Slot 5. | Increase |

**Nothing is silent. Every existence check outcome produces an explicit conversation moment.**

---

## The Conversation Structure

Four phases. Move through them in order. Never skip.

**Phase 1 — Problem Definition:** Extract one clean, specific problem statement. Gate: user confirms the problem statement.

**Phase 2 — Path Routing:** Determine Policy or Product. Gate: user confirms the path.

**Phase 3 — Structured Interrogation:** Fill 7 slots for the chosen path. Gate: all 7 slots filled and confirmed.

**Phase 4 — Synthesis:** Generate the structured draft from slot content. AI is formatter, not author. Gate: user confirms "Does this capture what you meant?"

### Policy Path — 7 Slots (Legislative Launchpad)
1. Specific Harm — who, how, scale
2. The Gap and Consequences — why current law fails, stakes of inaction
3. Proposed Mechanism — verb + noun operative clause, key provisions
4. Enforcement — who enforces, what enforcement looks like
5. Jurisdiction — federal/state/local, why
6. Precedent and Fiscal Note — existing models, cost
7. Political Landscape — real opposition + named supporters

### Product Path — 7 Slots (Silicon Valley Handoff)
1. User Pain and Evidence — friction + data grounding it
2. User Story and Happy Path — "As a [user], I want [action], so that [benefit]" + ideal flow
3. Specific Feature — P0 in one sentence, P1 considerations
4. Target Company and Success Metric — who and what number goes up
5. Existing Landscape — competitors, prior requests, current workaround
6. Value Proposition and OKR Alignment — business case + company objectives
7. Risks and Non-Goals — real risks named, scope explicitly bounded

### AI Response Format (Phases 1–3, every message, no exceptions)
```
Understood: [One sentence reflecting exactly what the user said]
Question: "[One question. Never two.]"
```

---

## GoalTreeState — TypeScript Interface

```typescript
interface GoalTreeState {
  phase: 1 | 2 | 3 | 4;
  path: 'policy' | 'product' | 'unrouted';
  slots: {
    slot1: SlotStatus;
    slot2: SlotStatus;
    slot3: SlotStatus;
    slot4: SlotStatus;
    slot5: SlotStatus;
    slot6: SlotStatus;
    slot7: SlotStatus;
  };
  existenceCheck: {
    status: 'pending' | 'clear' | 'identical' | 'precedent' | 'failed_attempt' | 'competitor_only';
    detail: string | null;
    requiresUserResponse: boolean;
  };
  lastUnderstood: string;
  nextQuestion: string;
}

type SlotStatus = {
  status: 'empty' | 'partial' | 'filled';
  content: string | null;
}
```

---

## Supabase Schema (3 Tables)

```sql
-- conversations: session state and full history
conversations (
  id uuid primary key,
  session_id text not null,
  goal_tree_state jsonb not null,      -- full GoalTreeState object
  message_history jsonb not null,      -- array of all messages
  path text,                           -- 'policy' | 'product' | null
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- drafts: completed, published documents
drafts (
  id uuid primary key,
  session_id text not null,
  path text not null,                  -- 'policy' | 'product'
  title text not null,
  slot_content jsonb not null,         -- all 7 slots confirmed content
  formatted_document text not null,   -- final rendered draft
  likelihood_score integer,            -- 0-100
  existence_check_status text,
  published_at timestamptz default now()
)

-- votes: upvote and downvote records
votes (
  id uuid primary key,
  draft_id uuid references drafts(id),
  device_fingerprint text not null,
  value integer not null,              -- 1 or -1
  created_at timestamptz default now(),
  unique(draft_id, device_fingerprint)
)
```

**Note:** Schema is directional. Finalize column definitions after ConversationEngine is producing real data and you can see exactly what needs to be persisted.

---

## File Structure

```
/app
  /page.tsx                    — Screen 1 (Home Feed)
  /draft/page.tsx              — Screen 2-3 (Initiation + Active)
  /feed/page.tsx               — Screen 4 (Public Feed)
  /api/conversation/route.ts   — Anthropic API endpoint
  /api/publish/route.ts        — Supabase publish endpoint

/components
  /shell
    AppShell.tsx
    TopNav.tsx
    BottomNav.tsx
    PaginationDots.tsx
  /paper
    Paper.tsx
    PaperScrollContainer.tsx
    PaperLines.tsx
    PaperOnboardingCopy.tsx
    LiveDraftContent.tsx
  /conversation
    AIResponseBlock.tsx
    InputField.tsx
  /toolbar
    Toolbar.tsx
    LikelihoodBadge.tsx
    ExpertButton.tsx
    MemoryButton.tsx
    ProgressButton.tsx
  /modals
    InfoModal.tsx
    GoalTreeModal.tsx
    ProgressChartModal.tsx
    LikelihoodDetailPanel.tsx
    ExpertPanel.tsx
  /output
    DraftDocument.tsx
    PolicyDraftTemplate.tsx
    ProductDraftTemplate.tsx
    PublishButton.tsx
  /feed
    PublicFeedScreen.tsx
    DraftCard.tsx
    CategoryTag.tsx
    VoteButtons.tsx
  /drafts
    PreviousDraftsScreen.tsx
    DraftResume.tsx

/lib
  anthropic-client.ts          — All Anthropic API calls go through here
  system-prompt.ts             — System prompt as structured string
  supabase-client.ts           — All Supabase calls go through here
  conversation-engine.ts       — The orchestration pipeline
  slot-tracker.ts              — useSlotTracker hook

/types
  index.ts                     — GoalTreeState, SlotStatus, all shared types
```

---

## shadcn Components in Use

These are pre-selected and **already installed** in this project. Do not reinstall. Do not build from scratch.

| shadcn Component | Used For |
|---|---|
| ScrollArea | PaperScrollContainer |
| Textarea | InputField |
| Card | DraftCard in public feed |
| Badge | LikelihoodBadge, CategoryTag |
| Button | CREATE A DRAFT, PublishButton, send |
| Skeleton | Paper loading state while AI responds |
| Sonner | Toast on slot confirmed, draft published, auto-saved |
| Tooltip | Toolbar icon labels on long press |
| Sheet | GoalTreeModal, ProgressChartModal (bottom sheet on mobile) |

**Note:** `TooltipProvider` must wrap the app in `app/layout.tsx`. Import from `@/components/ui/tooltip`.

---

## Environment Variables

```bash
# .env.local — never commit this file

ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://opendraft.dev
ADMIN_PASSWORD=
```

- **SUPABASE_SERVICE_ROLE_KEY** — server-only. Used by lib/supabase-server.ts and app/api/log-event/route.ts. Never expose to client.
- **ADMIN_PASSWORD** — server-only. Used by app/admin/login/page.tsx. Never expose to client. Set in Vercel env vars for production.

---

## Last Mile Routing — How Drafts Get to Decision Makers

This is the feature that separates OpenDraft from every other civic tool. When a draft is published it does not just sit on a feed. It gets routed — manually — to the person who can act on it.

**The process:**

1. User completes all 7 slots and publishes their draft
2. OpenDraft admin (Andrew) reviews the draft and identifies the correct contact — the relevant legislative office, city council member, state representative, or product team at the target company
3. The draft is sent via email with context: "A citizen drafted this through OpenDraft. [X] people have upvoted it."
4. The user receives a notification showing the submission sequence:

```
Draft published ✓
Contact identified: [Name, Title, Office/Company] ✓
Draft sent via email: [date] ✓
50 upvotes reached — resent: [date] ✓
100 upvotes reached — resent: [date] ✓
```

**Vote threshold re-sends:** Every 50 upvotes triggers a re-send to the same contact with the updated vote count. Growing community weight behind a structured argument is meaningfully different from a static petition signature count.

**Why manual, not automated:** Automated routing introduces failure points — bad contact data, spam filters, government email systems that silently discard external messages. Manual routing means a human reviewed the draft and personally identified the right contact. That signal is more credible to the recipient and more trustworthy to the user.

**Andrew's sales background is directly relevant here.** Finding the right contact at a state legislature or a product team at Spotify is the same skill as finding the economic buyer at a Fortune 500. This is not a gap — it is an asset.

**Institutional accounts (v1.5 goal):** Policymakers and product teams will eventually have accounts where they check incoming drafts directly. Free, structured, community-sourced feedback is genuinely valuable to a legislative aide or a PM. This is the two-sided platform vision. It is not in v1 scope but every routing action in v1 is building toward it.

---

## Sprint Gates — Non-Negotiable

Do not advance to the next sprint until the current gate is passed.

| Gate | Condition |
|---|---|
| Gate 1 | Complete GROW conversation reaches synthesis on mobile at 390px |
| Gate 2 | 40 of 50 test inputs produce good questions, 90%+ routing accuracy |
| Gate 3 | Draft renders correctly for both paths on both screen sizes |
| Gate 4 | Publish → feed → upvote loop working, deployed to opendraft.dev |

---

## Rules Cursor Must Never Break

1. **Mobile first. Always.** Default styles are 390px. Desktop is layered on top with `md:` prefix.
2. **No fixed pixel widths.** Tailwind spacing, percentages, or viewport units only.
3. **No inline styles.** Everything through Tailwind classes.
4. **No API calls from UI components.** All Anthropic and Supabase calls go through `/lib`. Components call lib functions. Never directly.
5. **One component per file.** No combining unrelated components.
6. **The Paper container never grows.** Fixed height. Internal scroll only. Non-negotiable.
7. **The AI response always has exactly two parts.** Understood + Question. Never one. Never three. The component must enforce this structurally.
8. **No component calls the Anthropic API directly.** It goes through `conversation-engine.ts` which calls `anthropic-client.ts`.
9. **Do not build Screen 4 until Screen 3 is complete.** Do not mix sprints.
10. **TypeScript strict mode.** No `any`. If the type is unknown, define it. Do not suppress errors.
11. **Test mobile before desktop.** Chrome DevTools 390px before you check 1280px.
12. **The draft is assembled from confirmed slot content only.** The AI does not add sentences the user did not provide. Formatter, not author.

---

## What Is NOT Being Built in v1

Be ruthless about scope. These ship after v1.

- ❌ The Expert feature (LegiScan + CongressMCP) — icon present, functionality is v1.5
- ❌ Authentication and user accounts — anonymous sessions in v1
- ❌ Author attribution on published drafts — v1.5
- ❌ Viability score algorithm — placeholder percentage in v1, real algorithm is v2
- ❌ Prediction market integration — referenced in philosophy, not in v1 scope
- ❌ Automated routing — manual routing by Andrew is v1. Automated contact lookup is v2.
- ❌ Institutional accounts for policymakers/product teams — v1.5 goal
- ❌ Comments on published drafts
- ❌ Notifications (beyond submission tracking sequence)
- ❌ Mobile app (this is a mobile-first web app)

**v1 is:** Conversation engine → 7 slots filled → Draft output → Publish → Manual routing by admin → Public feed → Upvote → Vote threshold re-send. Nothing else.

---

## v1.5 Status
Playbook 6 complete. Events pipeline live. Admin dashboard live.
Feedback loop: Ship → Supabase events → /admin weekly review → Download report → Drop into Cursor → Improve system prompt → Deploy.

---

## v2.0 Status
Playbook 7 complete. Product is demo-ready.
Streaming responses, animated paper, progress bar, completion moment, feed redesign, micro-interactions, mobile responsive.

---

## v2.1 Status
Playbook 8 complete. Core mechanic restored.
Slot filling wired end-to-end. Draft detail page live.
Feed seeded. Screen 1 proof of life.
Conversation UI redesigned. InfoModal copy sharpened.

---

## Parking Lot
- **Routing heuristic coverage:** Add 'legislative', 'law', 'regulation', 'ordinance' to policy keywords and 'startup', 'platform', 'tool', 'build' to product keywords in lib/conversation-engine.ts.
- **AI-owned routing (Playbook 7):** Make conversation engine return path as an explicit field in the AI response JSON — replace inferPathFromInput keyword heuristic entirely.
- **Draft restoration:** Resume prior session (requires Supabase state persistence by sessionId).
- **PDF download:** Wire disabled button in CompletionPanel.

---

## Open Questions (Unresolved — Do Not Guess)

These are actively unresolved design decisions. Do not invent answers. Flag them and ask.

- What happens visually when all 7 slots are filled? Same screen transform or new review screen?
- Screen 4 card design — information density vs. readability tradeoff
- Scroll animation on paper — smooth vs. instant, test for mobile performance
- Draft auto-save behavior — on every message, on slot completion, or on exit?
- Empty state for previous drafts screen on first use
- Bottom nav slot labels 6 and 7 on Screen 1 — not yet finalized

---

## The Emotional North Star

The world has enough vague complaints. OpenDraft exists to turn them into something more.

Every decision in this codebase — every component, every prompt, every interaction — serves one purpose: helping a regular person make their idea legible to the institutions that could act on it.

When the build gets complicated, come back to that sentence.

---

*Project: OpenDraft*
*Domain: opendraft.dev*
*Owner: Andrew Brownlee / Offbeat Options LLC*
*Last updated: March 9, 2026*
