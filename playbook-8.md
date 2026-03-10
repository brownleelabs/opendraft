# Playbook 8 — Karp/Musk Standard
**Version:** v2.1  
**Standard:** Would Alex Karp sit through a 10-minute demo? Would Elon Musk use it himself?  
**Verdict on current state:** No to both. Here is why and how to fix it.

---

## The Honest Problem List

In priority order. Every item here would end a demo.

**P0 — The core mechanic is broken in production.**  
The conversation engine never marks slots as filled. The progress bar stays at zero. The paper never fills. The CompletionPanel never appears. The product's entire value proposition — "watch your draft being written" — is invisible on every real session. This is not a polish problem. This is the product not working.

**P0 — The draft page has an explanatory paragraph that shouldn't exist.**  
"OpenDraft helps you turn an idea into a structured proposal..." If a product needs a paragraph to explain itself, it isn't clear enough. The AI's first question IS the explanation. Remove the paragraph entirely.

**P1 — "READ DRAFT →" on every feed card goes nowhere.**  
Dead links in a demo are worse than missing features. Every feed card promises a full draft and delivers nothing. Either wire a detail page or remove the link.

**P1 — Screen 1 has no proof of life.**  
Ghost paper is decorative. There is no count of drafts submitted, no signal that real people have used this, no evidence the product works. Karp needs to see a number before he'll engage.

**P1 — The feed has one draft.**  
A public record with one entry looks abandoned, not alive. The feed needs seeded content — real, well-crafted example drafts across both paths — so that on any demo the feed looks active.

**P2 — The InfoModal copy is generic.**  
It was written during scaffolding and never sharpened. It should be a precise, 3-sentence argument for why this product exists.

**P2 — Screen 1 copy is defensive.**  
"No account required. Your draft is yours." answers a concern the user hasn't had. Replace it with something that creates pull.

**P2 — The conversation UI looks like a chat app.**  
Messages render in a pattern that resembles iMessage. This is a civic drafting tool. The conversation should feel like a structured interview, not a text thread.

---

## Prompt 61 — Fix the Slot Filling Bug (P0)

**This is the only prompt that matters. Everything else is cosmetic until this works.**

```
Read the following files completely before touching anything:
- lib/conversation-engine.ts (full file)
- app/api/conversation/route.ts (full file)  
- types/ directory (all type definitions)
- opendraft-system-prompt-v1.md (understand what the AI is 
  being asked to return)

THE BUG:
The conversation engine calls the AI and receives a response.
It infers path from keywords (inferPathFromInput) but never 
updates slot statuses in the returned updatedState. Every session 
returns the same state it received, with all slots still 'empty'.
The progress bar, ink-in animations, and CompletionPanel never 
fire because no slot ever reaches status: 'filled'.

THE FIX:
The AI response must drive slot filling. Here is the approach:

STEP 1 — Read the system prompt (opendraft-system-prompt-v1.md).
Understand what structured data the AI is currently asked to 
return. Look for any slot-related fields in the response schema.

STEP 2 — Update the AI response schema.
The AI response JSON must include a slots object that reflects 
which slots have been filled by the conversation so far.

Add to the system prompt's response schema:
"slots": {
  "slot1": { "status": "filled" | "partial" | "empty", "content": "string or null" },
  "slot2": { ... },
  ... through slot7
}

The AI should mark a slot as "filled" when it has received a 
clear, specific answer for that slot's question. It should mark 
it "partial" when the user has given a vague or incomplete answer. 
It should mark it "empty" when the slot has not been addressed.

The AI already knows the slot definitions from the system prompt — 
it just needs to be asked to report their status explicitly in 
its structured response.

STEP 3 — Update processMessage in lib/conversation-engine.ts.
After receiving the AI response, parse the slots field and 
merge it into updatedState. Do not replace the existing 
inferPathFromInput logic — keep it as a fallback for path 
inference. But the slot statuses must come from the AI response.

STEP 4 — Update the streaming route.
app/api/conversation/route.ts currently builds the __DONE__ 
payload by running parseResponse + inferPathFromInput on the 
full response text. Update it to also parse the slots field 
from the AI's structured JSON response and include it in 
updatedState before sending __DONE__.

STEP 5 — Validate.
Update isValidGoalTreeState in app/api/conversation/route.ts 
and app/draft/page.tsx to accept (but not require) the slots 
field so existing sessions don't break.

STEP 6 — Test.
Run the dev server. Start a new conversation. Answer the first 
question clearly and specifically. After the AI responds, check:
- Does state.slots.slot1.status === 'filled'?
- Does the progress bar advance to 1/7?
- Does the slot section animate into the paper?

Answer two more questions clearly. Confirm slots 2 and 3 fill.

If slots fill: the core mechanic is working.
If slots don't fill: the AI is not returning the slots field — 
debug the system prompt instruction and the JSON parsing.

Run npx tsc --noEmit. Fix all errors.

Commit: p8-61: fix slot filling — core mechanic restored
```

---

## Prompt 62 — Strip the Draft Page Copy

**Musk's first note. Remove anything that explains what the product does. The product explains itself.**

```
Read app/draft/page.tsx in full.

Find and remove the onboarding paragraph that reads approximately:
"OpenDraft helps you turn an idea into a structured proposal — 
for a lawmaker or a company. You describe what you want to change; 
we ask questions until it's ready to send. When you're done, 
your draft is published and can be sent to the right person."

Also find and remove the instruction line:
"To get started, describe the change you want to see in the 
green text box below ↓"

Replace both with nothing. The input field and the AI's first 
response are the onboarding. 

INSTEAD — when messages.length === 0 (blank starting state), 
show a single centered prompt above the input:
A single line: "What do you want to change?"
Font: Playfair Display (font-serif), 24px, navy (#1B2A4A), 
centered. This is the only text on the page before the user 
types. It is a question, not an explanation.

Position it in the center of the paper area, vertically 
centered. When the first message is sent, it disappears 
(it's only visible when messages.length === 0).

Also remove from PaperOnboardingCopy component (if it exists 
as a separate component) — delete the component entirely if 
its only purpose was this copy.

Run npx tsc --noEmit.
Confirm on localhost: draft page starts blank except for 
"What do you want to change?" centered on the paper.

Commit: p8-62: strip draft page onboarding copy
```

---

## Prompt 63 — Draft Detail Page

**"READ DRAFT →" goes nowhere. Fix it or remove it. Fix it.**

```
Read app/feed/page.tsx, components/feed/DraftCard.tsx, 
and lib/supabase-client.ts before touching anything.

Create app/feed/[id]/page.tsx — a server component that 
renders the full published draft.

ROUTE: /feed/[id] where id is the draft's UUID from Supabase.

DATA FETCH:
Create a fetchDraftById(id: string) function in 
lib/supabase-client.ts that selects a single draft by id 
from the drafts table. Return null if not found.

PAGE LAYOUT:
Full-width, max-w-2xl mx-auto, padding 48px top.

HEADER:
- Path badge (POLICY / PRODUCT — same style as feed cards)
- Published date: "Published {relative time}" — text-sm #6B7280
- Title: Playfair Display, 36px desktop / 28px mobile, navy
- A horizontal rule: 1px #E8E3D8, margin 24px 0

BODY:
The formatted_document field rendered as structured text.
Use a <article> tag. Preserve line breaks (whitespace-pre-wrap 
or equivalent). Font: Playfair Display for any headers found 
in the document, Inter for body text. Line-height: 1.8. 
Color: #1B2A4A for text, max-w-prose.

FOOTER (border-top 1px #E8E3D8, padding-top 24px, margin-top 48px):
Left: Vote buttons (same component as feed cards).
Right: "← Back to Feed" — text-sm #1B2A4A, links to /feed.

NOT FOUND STATE:
If fetchDraftById returns null, render a simple centered message:
"Draft not found." — Playfair italic 20px #9CA3AF.
"← Back to Feed" link below.

WIRE INTO DraftCard:
In components/feed/DraftCard.tsx, make "READ DRAFT →" 
a Link to /feed/{id}. The id prop should already be 
passed to DraftCard — confirm it is, or add it.

Run npx tsc --noEmit.
Test: open /feed, click "READ DRAFT →" on any card, 
confirm the detail page loads with the full draft content.

Commit: p8-63: draft detail page
```

---

## Prompt 64 — Screen 1: Proof of Life

**Karp needs to see evidence this works before he engages. Give him a number.**

```
Read app/page.tsx and lib/supabase-client.ts before 
touching anything.

Screen 1 needs one piece of social proof: a live count 
of published drafts. Not a fake number. A real query.

STEP 1 — Server component conversion (if needed).
app/page.tsx is currently a client component ('use client') 
because of InfoModal state. Keep the InfoModal trigger but 
move the draft count fetch server-side.

Approach: Make app/page.tsx a server component. 
Extract the InfoModal trigger and state into a small 
client component: components/home/InfoButton.tsx 
('use client', owns the useState and renders the ? button 
and InfoModal). Import InfoButton into the server page.tsx.

STEP 2 — Draft count query.
In lib/supabase-client.ts, add:
fetchPublishedDraftCount(): Promise<number>
Uses the anon client. SELECT count from drafts 
where published = true (or equivalent). Returns 0 on error.

Call it in app/page.tsx (server component) and pass the 
count as a prop to the hero section.

STEP 3 — Display the count.
Replace the subtext line "No account required. Your draft is yours."
with a live stat line:

If count === 0: render nothing (no empty state copy).
If count === 1: "{count} proposal published."
If count > 1: "{count} proposals in the public record."

Style: text-sm, #6B7280, centered, below the CTA button.
Same position as the old subtext line.

This single number does three things:
1. Proves the product works
2. Creates social proof
3. Creates mild FOMO ("others have done this — why haven't you?")

STEP 4 — Remove the defensive copy.
"No account required. Your draft is yours." — remove it entirely.
It answers a concern the user hasn't had. If the count is 
showing real drafts, trust is established by evidence, not copy.

Run npx tsc --noEmit.
Confirm on localhost: the count renders correctly 
(may be a small number — that's fine, it's real).

Commit: p8-64: screen 1 proof of life
```

---

## Prompt 65 — Seed the Feed

**A public record with one entry looks abandoned. Seed it with real, well-crafted example drafts so the feed looks alive on any demo.**

```
This prompt does not involve code changes. 
It involves using the product itself.

TASK: Submit 5 high-quality example drafts through 
opendraft.dev — real sessions, real AI conversations, 
real published output. These become the seeded content 
that makes the feed look alive.

USE THESE IDEAS (mix of policy and product paths):

1. POLICY — Chicago eviction notice reform
   "I want Chicago to require landlords to give 90 days 
   notice before demolition or major renovation that 
   displaces tenants, instead of the current 30 days."

2. POLICY — Public school air quality disclosure  
   "I want Illinois public schools to be required to 
   publish air quality test results annually and notify 
   parents when levels exceed EPA thresholds."

3. PRODUCT — Apple accessibility feature
   "I want Apple to add a feature to iOS that lets users 
   set a maximum volume limit that can't be overridden 
   without a passcode — for parents managing children's 
   devices."

4. PRODUCT — Uber driver safety feature
   "I want Uber to add an in-app feature that lets drivers 
   record a safety note visible only to Uber support when 
   they feel unsafe ending a trip early."

5. POLICY — Chicago small business permit reform
   "I want Chicago to create a single online portal for 
   all small business permits instead of requiring in-person 
   visits to multiple city departments."

For each draft:
- Go through the full AI conversation
- Answer every question specifically and clearly
- Publish the completed draft

After all 5 are published, open /feed and confirm:
- 5+ draft cards visible
- Mix of POLICY and PRODUCT badges
- Filter pills work (POLICY shows 3, PRODUCT shows 2)
- Each "READ DRAFT →" link loads the detail page with 
  real content

This is the demo content. These are what Karp sees 
when you show him the feed.

When complete, paste the draft count from /feed here 
and confirm all 5 published successfully.

No commit needed — this is content, not code.
```

---

## Prompt 66 — InfoModal and Conversation UI Polish

**The last two cosmetic issues. Sharp copy in the modal. A conversation that looks like a structured interview, not a chat.**

```
Read components/modals/InfoModal.tsx and the conversation 
message rendering in app/draft/page.tsx before touching anything.

PART A — InfoModal copy rewrite

The current InfoModal copy was written during scaffolding. 
Replace it with this exact copy:

Title: "What is OpenDraft?"

Paragraph 1:
"Most good ideas never reach the right person. Not because 
they're bad ideas — because they're never written down 
clearly enough to act on."

Paragraph 2:
"OpenDraft asks you questions until your idea becomes a 
structured proposal. Policy path sends it toward a lawmaker. 
Product path sends it toward a company. Either way, you wrote it."

Paragraph 3:
"Every published draft is in the public record. 
Anyone can read it. Anyone can vote on it."

Keep the "Get Started" button. No other changes to the 
modal structure.

PART B — Conversation message styling

The conversation messages currently render in a pattern 
that resembles a chat interface. This is a drafting tool, 
not a messaging app. Change the visual language.

USER MESSAGES:
- Remove chat bubble styling entirely
- Render as: right-aligned text, no background, no border
- Font: Inter text-sm #1B2A4A, font-medium
- A thin right border: border-r-2 border-[#1B2A4A], pr-3
- This reads as: the user's words, attributed

AI MESSAGES:
- Remove chat bubble styling entirely  
- Render as: left-aligned, no background, no border
- Font: Inter text-sm #4B5563, line-height 1.7
- A thin left border: border-l-2 border-[#E8E3D8], pl-3
- This reads as: a question being posed, neutral

The overall effect: the conversation looks like a structured 
interview transcript, not a text thread. The paper metaphor 
is reinforced — this is a document being constructed through 
dialogue.

SPACING:
- Gap between messages: 20px (not the tight chat spacing)
- No avatars, no timestamps, no read receipts

Run npx tsc --noEmit.
Confirm InfoModal copy is updated.
Confirm conversation messages no longer look like chat bubbles.

Commit: p8-66: infomodal copy and conversation UI
```

---

## Prompt 67 — Final Audit and Deploy

```
Read CLAUDE.md in full before touching anything.

STEP 1 — Verify slot filling works end-to-end
This is the most important check in this playbook.
On localhost, start a fresh session. Answer 3 questions 
with specific, clear responses. Confirm:
[ ] Progress bar advances (slots 1, 2, 3 fill)
[ ] Slot sections animate into the paper (ink-in fires)
[ ] state.slots shows status: 'filled' for filled slots
If any of these fail, DO NOT PROCEED. Fix slot filling 
before anything else.

STEP 2 — Full walkthrough on localhost
[ ] Screen 1 loads — ghost paper, "Turn your idea into a proposal."
[ ] Draft count shows below CTA (real number)
[ ] ? button opens InfoModal with new copy
[ ] CREATE A DRAFT → /draft
[ ] Draft page starts with only "What do you want to change?"
[ ] Type an idea — AI streams a response
[ ] Progress bar advances as slots fill
[ ] Paper sections animate in as slots fill
[ ] After slot 7 — CompletionPanel appears
[ ] Publish → navy overlay → /feed
[ ] Feed shows seeded drafts + filter pills work
[ ] "READ DRAFT →" loads detail page with full content
[ ] /admin loads and weekly report downloads
[ ] No horizontal scroll at 390px on any page

STEP 3 — CLAUDE.md update
Add "v2.1 Status" section:
  Playbook 8 complete. Core mechanic restored.
  Slot filling wired end-to-end. Draft detail page live.
  Feed seeded. Screen 1 proof of life. 
  Conversation UI redesigned. InfoModal copy sharpened.

Remove from Parking Lot (now fixed):
  - Slot filling P0
  - Draft detail page /feed/[id]

STEP 4 — Deploy
git add -A
git commit -m "p8-67: karp/musk standard — v2.1"
git push origin master

STEP 5 — Production smoke test (on a real phone)
[ ] opendraft.dev — ghost paper, real draft count
[ ] Tap CREATE A DRAFT — "What do you want to change?"
[ ] Submit an idea — AI streams tokens
[ ] Answer 3 questions — progress bar advances
[ ] Feed loads with 5+ draft cards
[ ] READ DRAFT → loads full content
[ ] No broken layouts at 390px

When all items pass: the product is ready to demo 
to anyone.
```

---

## Playbook 8 Summary

| Prompt | What It Fixes | Priority |
|--------|---------------|----------|
| 61 | Slot filling — the core mechanic | P0 |
| 62 | Remove explanatory copy from draft page | P0 |
| 63 | Draft detail page — dead links fixed | P1 |
| 64 | Screen 1 proof of life — live draft count | P1 |
| 65 | Seed the feed — 5 real example drafts | P1 |
| 66 | InfoModal copy + conversation UI | P2 |
| 67 | Final audit and deploy | — |

---

## What Changes After This Playbook

**Before Playbook 8:** A polished prototype with a broken core mechanic.  
**After Playbook 8:** A product that works, looks like it works, and has evidence that it works.

The test: open opendraft.dev in front of Karp. He reads "Turn your idea into a proposal." He sees 6 proposals in the public record. He taps CREATE A DRAFT. He types an idea. He watches the AI ask him questions. He watches the paper fill in. He sees a completion panel. He publishes. He sees his draft in the feed. He taps READ DRAFT and reads it.

That is the demo. That is what this playbook delivers.
