# Playbook 7 — Demo Ready
**Version:** v2.0  
**Standard:** Something Alex Karp would sit through for 10 minutes without checking his phone.  
**Honest starting point:** The core mechanic works. Everything visible is unfinished.

---

## Honest Assessment

Here is what is broken, in order of damage to a demo:

**1. Screen 1 communicates nothing.**  
An H1 that says "OpenDraft" and a button. A stranger has no idea what this is, why they should care, or what will happen when they tap. This is the single most important page in the product and it is empty.

**2. The "24% likely" badge is a liability.**  
It appears on the draft page with no explanation. A user or investor will ask "24% likely to what?" and there is no answer. Either make it real and explained, or remove it before any demo.

**3. The paper metaphor is not visible.**  
The product's core idea — that you're drafting a real document — is described in an onboarding paragraph. It is not shown. There is no visual language that communicates "you are writing something that will be sent to a real person."

**4. The AI response is a blank wait.**  
3–5 seconds of nothing, then text appears. This is the most important interaction in the product and it has no feedback, no life, no sense that something intelligent is happening.

**5. The draft page has no sense of progress.**  
The user answers questions but has no idea how far they are, what they've built so far, or when they'll be done. There is no forward momentum.

**6. The completion moment doesn't exist.**  
When a draft is finished, what happens? Is there ceremony? Does the user feel like they accomplished something? Right now: nothing visible distinguishes a finished draft from an in-progress one.

**7. The feed is unknown.**  
It was scaffolded and never designed. It may be a list of unstyled cards. It needs to feel like a real public record, not an admin table.

**8. Zero motion.**  
A product about writing and civic action has no animation whatsoever. Not asking for Disney. Asking for the basic feedback that makes a product feel built by professionals.

**9. Mobile is untested.**  
The primary demo vehicle for showing this to anyone is a phone. If it breaks on mobile, the demo is over.

---

## Prompt 53 — Screen 1: The Front Door

**What this fixes:** The most important page in the product. A stranger lands here. They need to understand what OpenDraft is, feel the weight of what it does, and want to tap the button — in under 10 seconds.

**Design direction:** Think of how Palantir presents tools built for consequential work. Not startup-cute. Not corporate-bland. Serious, purposeful, slightly austere. The product is about civic power. The design should feel like it knows that.

```
Read app/page.tsx, app/globals.css, and the full CLAUDE.md 
design system section before touching any files.

Redesign app/page.tsx completely. This is the front door of the 
product. It needs to communicate purpose, establish trust, and 
create forward pull — in under 10 seconds.

LAYOUT — full viewport height, centered, three zones:

ZONE 1 — TOP (fixed, 60px)
A clean top bar. Left: "OPENDRAFT" in Inter, font-weight 600, 
letter-spacing 0.15em, text-sm, navy (#1B2A4A). This is a 
wordmark, not a navigation link. Right: ① button (existing 
InfoModal trigger), and a small "FEED →" link in the same 
text style pointing to /feed.

ZONE 2 — HERO (flex-1, centered vertically)
This is the main statement. Two pieces:

  STATEMENT (above the paper):
  A single line: "Turn your idea into a proposal."
  Font: Playfair Display, 40px on desktop / 28px mobile, 
  navy (#1B2A4A), centered. Below it, one line of subtext:
  "For a lawmaker. For a company. In minutes."
  Font: Inter, 15px, color #6B7280, centered.
  Spacing: 48px gap between statement and paper.
  
  PAPER (the visual hero):
  This is NOT a button. This is a representation of a real 
  document that will be created. Make it feel physical.
  
  Render a paper card:
  - Width: min(600px, 90vw). Height: 280px desktop / 200px mobile.
  - Background: #FAF8F3 (cream). 
  - Border: 1px solid #E8E3D8.
  - Box shadow: 0 4px 24px rgba(27,42,74,0.08), 
                0 1px 4px rgba(27,42,74,0.04)
  - Border-radius: 2px (barely rounded — this is paper, not a card)
  - Inside: 12 horizontal ruled lines, evenly spaced, 
    color #E8E3D8, 1px height. Full width minus 40px padding.
  - On lines 1, 3, 5 (top area): render ghost text — 
    placeholder content that looks like a draft being written.
    Playfair Display, text-sm, color #C8C0B0 (very faint):
    Line 1: "POLICY PROPOSAL — CITY OF CHICAGO"
    Line 3: "Section 1. The following change is proposed..."
    Line 5: "Whereas the current system fails to address..."
  - Bottom-right corner: a small "DRAFT" stamp — 
    text-xs uppercase tracking-widest, color #C8C0B0,
    font-weight 600. Rotated -15deg. position: absolute,
    bottom: 20px, right: 24px.

ZONE 3 — BOTTOM (80px, centered)
The CTA. One element only.

"CREATE A DRAFT" button — keep the existing skew animation 
but upgrade the styling:
- Background: #1B2A4A (navy). No gradient.
- Text: white, Inter, font-weight 600, letter-spacing 0.1em,
  text-sm uppercase.
- Padding: 16px 48px.
- Border: none. Border-radius: 0 (zero — serious tool).
- On hover: background transitions to #2D5016 over 200ms.
  Skew increases slightly from -6deg to -8deg.
- Below the button, 12px gap: text-xs #9CA3AF centered:
  "No account required. Your draft is yours."

REMOVE from current page.tsx:
- The existing PaperScrollContainer 
- Any placeholder text not part of this new design

InfoModal: keep existing trigger and component. 
Update the ① button:
- Size: 28px circle
- Border: 1.5px solid #1B2A4A  
- Change "①" to "?" (more universally understood)
- On hover: fill navy, text white, transition 150ms

Run npx tsc --noEmit. View on desktop AND mobile (375px).
Confirm paper card renders with ghost text.
Confirm CTA is visually dominant and copy is legible.

Commit: p7-53: screen 1 redesign
```

---

## Prompt 54 — Remove "24% Likely" or Make It Real

**What this fixes:** The "24% likely" badge is either a live feature or dead weight. Dead weight in a demo is worse than a missing feature.

```
Read app/draft/page.tsx in full. Find every reference to 
"24%", "likely", and whatever state or component produces 
this badge.

INVESTIGATE FIRST — report before changing anything:
1. Where does "24%" come from? Hardcoded or computed?
2. What does it represent? Documented anywhere?
3. Is it wired to anything real or a placeholder?

THEN EXECUTE ONE OF THESE PATHS:

PATH A — Remove it (if hardcoded placeholder):
- Delete the badge component and all references
- Remove any related state
- Do not replace with anything
- Clean, no explanation needed

PATH B — Make it real (if wired to AI state):
- Rename to "PASSAGE LIKELIHOOD" not "24% likely"  
- Add tooltip on hover/tap: "Estimated likelihood based on 
  current political context and similar proposals."
- Wire to slots_filled: 0 slots → "—" display only,
  updating percentage as slots fill from AI response
- If making it real requires >30 minutes of AI work, 
  use PATH A instead

After the fix:
Run npx tsc --noEmit.
Confirm badge is either gone or properly labeled.

Commit: p7-54: resolve passage likelihood badge
```

---

## Prompt 55 — The Draft Experience: Streaming, Paper, Progress

**What this fixes:** Three things at once because they are architecturally linked — streaming responses, visible paper that updates in real time, and a progress indicator.

```
Read app/draft/page.tsx, app/api/conversation/route.ts, 
components/paper/LiveDraftContent.tsx, and app/globals.css 
in full before touching any files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART A — STREAMING RESPONSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Change app/api/conversation/route.ts to stream:

1. Use Anthropic SDK streaming:
   const stream = await anthropic.messages.stream({ ...params })
   
2. Return a ReadableStream. Enqueue each text delta as it arrives.
   
3. When complete, append sentinel on its own line:
   \n__DONE__{"understood":"...","question":"...","updatedState":{...},"rawResponse":"..."}\n
   
4. Return: new Response(readable, { 
     headers: { 'Content-Type': 'text/plain; charset=utf-8' }
   })

In app/draft/page.tsx, update handleSubmit:

1. Add: const [streamingText, setStreamingText] = useState('')

2. Read stream with res.body.getReader(). Accumulate chunks.
   Call setStreamingText(accumulated) on each chunk.

3. When line starting with __DONE__ found:
   - Parse JSON after __DONE__
   - Validate with isValidConversationResponse
   - Call setState, setMessages, setHistory as before
   - Call setStreamingText('')

4. While streaming, render accumulated text as last message 
   with blinking cursor: <span className="animate-pulse">▋</span>
   Input stays disabled until __DONE__ parsed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART B — PAPER VISUAL UPGRADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Update the paper container to match Screen 1's paper card:
- Background: #FAF8F3
- Border: 1px solid #E8E3D8
- Box shadow: 0 4px 24px rgba(27,42,74,0.08)
- Border-radius: 2px

Add to globals.css (check for duplicates first):
@keyframes ink-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-ink-in { animation: ink-in 0.35s ease-out forwards; }

In LiveDraftContent.tsx:
- Each slot section: apply animate-ink-in with staggered delay 
  (slot_number * 60ms) via inline style={{ animationDelay }}
- Stable key={slot_number} so animation fires once on mount only

When a slot fills, pulse paper background (#FAF8F3 → #F5EDD8 → #FAF8F3) 
over 700ms using transition-colors duration-300.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART C — PROGRESS BAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create components/draft/ProgressBar.tsx.
Props: slotsFilledCount: number (0–7), 
       path: 'policy' | 'product' | 'unrouted' | null

A strip pinned below TopNav, above paper. 
Full width, 48px tall. White bg. Bottom border 1px #E8E3D8.

Left: 7 segment marks.
- Each: 24px wide, 3px tall, border-radius 2px, 4px gap
- Filled: #2D5016
- Current (next to fill): #2D5016 at 30% opacity, animate-pulse
- Empty: #E5E7EB

Center: status text (text-xs uppercase tracking-widest #6B7280):
- 1–6 filled: "Slot {N} of 7 · [PATH BADGE]"
- 7 filled: "Complete · Ready to publish"

Path badge: navy bg for POLICY, forest green for PRODUCT.
px-2 py-0.5 text-xs font-semibold white text.

Right: "{Math.round((N/7)*100)}%" in text-xs #9CA3AF monospace.

Do not render when slotsFilledCount === 0.
Place in app/draft/page.tsx between TopNav and paper.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run npx tsc --noEmit. 
Test: submit three messages, confirm streaming tokens appear, 
progress bar advances, slot sections animate in.

Commit: p7-55: streaming, paper upgrade, progress bar
```

---

## Prompt 56 — The Completion Moment

**What this fixes:** There is no moment when the user feels like they've accomplished something. A finished draft needs ceremony.

```
Read app/draft/page.tsx and publish-related components 
before touching any files.

STEP 1 — Completion Detection
const isDraftComplete = state.slots && 
  Object.values(state.slots).every(s => s.status === 'filled')

STEP 2 — CompletionPanel component
Create components/draft/CompletionPanel.tsx.
Renders when isDraftComplete is true, replacing InputField.

Layout: full-width panel, white bg, 
border-top 2px solid #1B2A4A, padding 24px.

Content:
  "✦ DRAFT COMPLETE" — text-xs uppercase tracking-widest 
  font-semibold #2D5016. The ✦ signals completion.
  
  "Your draft is ready." — Playfair Display 18px navy.
  "Publishing makes it visible in the public feed and 
  generates a shareable link." — Inter text-sm #6B7280.

  PRIMARY BUTTON: "PUBLISH DRAFT →"
  - bg-[#1B2A4A], white, Inter font-semibold text-sm 
    uppercase tracking-wider.
  - Padding 14px 32px. Border-radius: 0.
  - Hover: bg-[#2D5016] transition 200ms.
  - Wires to existing publish action.
    
  SECONDARY: "Download as PDF" — text-sm #6B7280, underline.
  Disabled with tooltip "Coming soon." Do not wire yet.

STEP 3 — Post-Publish Overlay
After successful publish, before router.push('/feed'):
1. Show full-screen overlay 1500ms:
   - Background #1B2A4A, opacity transition in 300ms
   - Centered white text: "Your draft is published." 
     Playfair Display 24px
   - Below: "Redirecting to the public feed..." 
     Inter text-sm opacity-60
2. After 1500ms: router.push('/feed')

const [isPublishing, setIsPublishing] = useState(false)
Overlay renders when isPublishing is true.

STEP 4 — ProgressBar completion state
When isDraftComplete: all 7 segments solid forest green.
Status: "Complete · Ready to publish"
Pulse animation on segment 7.

Run npx tsc --noEmit. Test full publish flow.

Commit: p7-56: completion moment
```

---

## Prompt 57 — Feed Page: Public Record

**What this fixes:** The feed is the proof that OpenDraft works. It should feel like a public record of civic ideas, not an admin table.

```
Read app/feed/page.tsx and all components in 
components/feed/ before touching any files.

STEP 1 — Page Header
Full-width, padding 64px top / 48px bottom.
White bg. Bottom border 1px #E8E3D8.
max-w-2xl mx-auto, left-aligned:

  Eyebrow: "PUBLIC RECORD" — text-xs uppercase tracking-widest 
  #6B7280, margin-bottom 12px.
  
  Title: "The OpenDraft Feed" — Playfair Display 48px desktop /
  32px mobile, navy, line-height 1.1.
  
  Subtitle: "Structured proposals from the public — for 
  lawmakers and companies." — Inter 16px #6B7280, mt-3.
  
  Stat pills (24px below subtitle):
  - "{N} proposals published"
  - "{N} this week"
  Each: border 1px #E8E3D8, rounded-full, px-4 py-1.5, 
  text-sm #1B2A4A. Derive from existing drafts fetch.

STEP 2 — Filter Bar
Sticky (top:0, z-10, bg-white, border-b 1px #E8E3D8, py-3):
Three pills: "ALL", "POLICY", "PRODUCT"
- Active: bg-[#1B2A4A] white text, rounded-sm, px-4 py-1.5, 
  text-xs font-semibold
- Inactive: transparent navy text, hover:bg-[#F3F4F6] 150ms

Make the list portion a 'use client' FeedList component.
Filter client-side — no re-fetch.

STEP 3 — Draft Cards
- White bg. Border 1px #E8E3D8. Border-radius: 2px. 
  Padding 28px 32px.
- Hover: border-color → #1B2A4A over 150ms, 
  box-shadow: 0 4px 16px rgba(27,42,74,0.06).
  Do NOT translate — paper doesn't float.

Card content:
  ROW 1: path badge + timestamp
    POLICY: bg-[#1B2A4A]. PRODUCT: bg-[#2D5016].
    White text, text-xs uppercase font-semibold px-2.5 py-1 rounded-sm.
    Right: relative time, text-xs #9CA3AF.
    
  ROW 2 (8px gap): title
    Playfair Display 22px desktop / 18px mobile, navy.
    Max 2 lines, overflow ellipsis.
    No title: "Untitled Draft" italic #9CA3AF.
    
  ROW 3 (8px gap): excerpt
    First 160 chars of formatted_document ?? ''
    Inter text-sm #4B5563, line-height 1.6.
    
  ROW 4 (16px gap, border-top 1px #F3F4F6, pt-3):
    Left: vote buttons (audit below)
    Right: "READ DRAFT →" text-xs uppercase tracking-wider 
    #1B2A4A font-semibold. No detail page yet — 
    scroll to top of card or no-op for now.

Vote button audit:
- "↑ {N}": border 1px #E8E3D8, rounded-sm, px-3 py-1.5, text-sm
  Voted state: bg-[#2D5016] text-white border-[#2D5016]
  active:scale-95 for press feedback.
- Downvote: same pattern, navy.

STEP 4 — Empty State
Center, padding-top 80px:
  Ghost paper card (400px wide, 200px tall, same styles as Screen 1)
  with ghost text: "Your proposal could be here."
  
  Below: "No drafts published yet." — Playfair italic 20px #9CA3AF
  Below: "Be the first. →" — text-sm #1B2A4A underline, links /draft

Run npx tsc --noEmit. Test filter pills with real data.
Confirm empty state with no data.

Commit: p7-57: feed page redesign
```

---

## Prompt 58 — Motion, Cohesion, and Visual Audit

**What this fixes:** Every interaction that currently has no feedback. And every visual inconsistency accumulated across 7 playbooks.

```
Read app/globals.css, every page file, and every component 
in components/ before touching any files.

STEP 1 — Keyframes (globals.css)
Add all keyframes in one place. Check for duplicates first.

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
(ink-in should already exist from Prompt 55 — do not duplicate)

.animate-fade-in { animation: fade-in 0.25s ease-out forwards; }
.animate-slide-up { animation: slide-up 0.4s ease-out forwards; }

STEP 2 — Screen 1 entrance
Paper card: animate-slide-up, delay 0ms
Statement text: animate-ink-in, delay 100ms
CTA button: animate-ink-in, delay 250ms
Set initial opacity-0 on each, let animation drive to 1.

STEP 3 — InputField
- focus-within: border-color #2D5016, 
  box-shadow: 0 0 0 2px rgba(45,80,22,0.2), transition 200ms
- Submit button hover: scale(1.05) transition-transform 150ms
- Submit while isSubmitting: opacity-60, cursor not-allowed

STEP 4 — Message entrance
Each finalized message: animate-ink-in on mount.
Apply to outermost message wrapper with existing key={index}.
Do NOT apply to streaming text — only finalized messages.

STEP 5 — Global page entrance
In app/layout.tsx, add animate-fade-in to the main element.
0.2s. This is a global treatment — subtle, not distracting.

STEP 6 — InfoModal polish
- Backdrop: bg-black/30, animate-fade-in
- Sheet: slide up 300ms ease-out
- "Get Started" button: match "CREATE A DRAFT" style — 
  navy bg, white text, border-radius 0, uppercase Inter.
  Hover: forest green transition 200ms.

STEP 7 — Visual consistency audit
Read every page and component. Fix:
- Any text-gray-500 that should be text-[#6B7280]
- Any font-sans on display text that should be Playfair Display
- Any hardcoded px values conflicting with spacing system
- Any rounded-lg that should be rounded-sm (paper = barely rounded)
- All console.log statements — remove every single one
- Any TODO or FIXME that indicates broken behavior

Run npx tsc --noEmit.
Full walkthrough: Screen 1 → CREATE → 3 exchanges → /feed.
Confirm every motion fires correctly, nothing excessive.

Commit: p7-58: motion and visual cohesion
```

---

## Prompt 59 — Mobile Audit

**What this fixes:** A demo happens on a phone. Non-negotiable.

```
Read every page file and the main layout.

Test every page at 390px (iPhone), 768px (iPad), 
1280px (desktop) using browser DevTools.

SCREEN 1:
[ ] Paper card: 90vw on mobile, max 600px desktop
[ ] Ghost text legible at 390px
[ ] CTA button: w-full on mobile, fixed-width desktop
[ ] Statement text: 28px mobile / 40px desktop
[ ] ? button: min 44x44px touch target

DRAFT PAGE:
[ ] Paper fills screen — no horizontal overflow
[ ] InputField: position fixed bottom-0 on mobile, 
    padding-bottom env(safe-area-inset-bottom)
    (inline below paper on desktop)
[ ] ProgressBar: on mobile, show segments + path badge only,
    hide percentage text
[ ] CompletionPanel: scrollable on overflow
[ ] TopNav: content has correct padding-top, no overlap

FEED PAGE:
[ ] Header text: 32px on mobile
[ ] Filter pills: overflow-x auto on mobile, no scrollbar visible
[ ] Cards: full width, padding 20px mobile
[ ] Vote buttons: min 44px touch targets

UNIVERSAL:
[ ] No horizontal scroll at 390px on any page
[ ] No text overflowing its container
[ ] All tap targets minimum 44x44px
[ ] No font sizes below 13px

Fix every issue found.

Run npx tsc --noEmit.
Final walkthrough at 390px on every page.

Commit: p7-59: mobile responsive audit
```

---

## Prompt 60 — Demo Script, Final Checks, Ship

```
Read CLAUDE.md in full before touching any files.

STEP 1 — Pre-deploy checklist
[ ] npx tsc --noEmit exits 0
[ ] No console.log in production code
[ ] No TODO/FIXME indicating broken behavior
[ ] No hardcoded localhost URLs
[ ] No API keys in client code
[ ] "24% likely" badge resolved (Prompt 54)
[ ] Streaming works on localhost
[ ] Progress bar advances correctly
[ ] Completion panel appears when all slots filled
[ ] Publish overlay fires and redirects to feed
[ ] Feed filter pills work
[ ] No horizontal scroll at 390px on any page

STEP 2 — CLAUDE.md updates

Add "v2.0 Status":
  Playbook 7 complete. Product is demo-ready.
  Streaming responses, animated paper, progress bar, 
  completion moment, feed redesign, micro-interactions, 
  mobile responsive.

Add to Parking Lot:
  - Draft restoration: resume prior session 
    (requires Supabase state persistence by sessionId)
  - PDF download: wire disabled button in CompletionPanel
  - Draft detail page: /feed/[id] with full document
  - AI-owned routing: replace keyword heuristic with 
    explicit routing_decision field in AI response JSON

Add "Demo Path" section:
  CANONICAL DEMO FLOW (on phone):
  1. Open opendraft.dev
  2. Tap "CREATE A DRAFT"
  3. Type: "I want Chicago to require landlords to disclose 
     pending demolition permits before signing leases"
  4. Follow the AI through 7 questions
  5. Watch the paper fill in real time
  6. Tap "PUBLISH DRAFT"
  7. Show the feed — draft is live
  
  TALKING POINTS:
  - "The AI never writes for you — it asks questions 
    until you've written it yourself"
  - "Every published draft is a structured proposal 
    ready to send to a real person"
  - "The feed is a public record of civic ideas"
  - "We track every session — which slots cause drop-off, 
    which path users choose, how long it takes"

STEP 3 — Deploy
git add -A
git commit -m "p7-60: demo ready — v2.0"
git push origin master

STEP 4 — Production smoke test
After Vercel build green:
[ ] opendraft.dev — Screen 1 renders with ghost paper
[ ] CREATE A DRAFT → /draft
[ ] Streaming works on production
[ ] Progress bar appears after first exchange
[ ] /feed loads with real data and filter pills
[ ] /admin loads (with password)
[ ] Report downloads with real data
[ ] All pages correct on a real phone

When all items pass, Playbook 7 is complete.
Product is demo-ready.
```

---

## Playbook 7 Summary

| Prompt | What It Fixes | Commit |
|--------|---------------|--------|
| 53 | Screen 1 — value prop, ghost paper, the front door | `p7-53` |
| 54 | "24% likely" — remove or make real | `p7-54` |
| 55 | Streaming + paper upgrade + progress bar | `p7-55` |
| 56 | Completion moment — panel, overlay, ceremony | `p7-56` |
| 57 | Feed — public record design, filters, cards | `p7-57` |
| 58 | Motion + visual consistency audit | `p7-58` |
| 59 | Mobile audit — every page at 390px | `p7-59` |
| 60 | Final checks + demo script + deploy | `p7-60` |

---

## What "Demo Ready" Means

Karp won't care about keyframe names. He'll care about three things:

**Does it communicate its purpose in 5 seconds?**  
After Prompt 53: yes. "Turn your idea into a proposal." A ghost document. A button. Done.

**Does it work without explanation?**  
After Prompts 55–56: yes. The progress bar tells you where you are. Streaming tells you the AI is working. The completion panel tells you you're done. Nobody has to explain any of this.

**Is there proof it works?**  
After Prompt 57: yes. The feed is a public record. Published drafts are there. Real votes. That's proof.

Everything else in this playbook is in service of those three answers.
