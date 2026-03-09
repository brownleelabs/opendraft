# OpenDraft — Playbook 2B
## Prompts 18–24: The Toolbar
> One component. One job. Verify before moving on.

---

## What This Playbook Builds

The toolbar sits between the paper and the input field on Screen 3. Four icons. Each one surfaces a different view of the conversation state. By the end of this playbook the user can see their likelihood score, their slot progress, and their full goal tree — all without leaving the conversation.

Seven steps:
1. `Toolbar` — layout wrapper for four icon slots
2. `LikelihoodBadge` — score display, hidden until slot 1 filled
3. `MemoryButton` — yin-yang icon, opens GoalTreeModal
4. `ProgressButton` — chart icon, opens ProgressChartModal
5. `GoalTreeModal` — current slot state in plain language
6. `ProgressChartModal` — visual slot completion breakdown
7. `LikelihoodDetailPanel` — score explanation when badge is tapped

---

## Before You Start

- [ ] Playbook 2A fully verified — real AI conversation working
- [ ] `npx tsc --noEmit` runs clean
- [ ] `localhost:3001/draft` renders and accepts input

---

## Prompt 18 — Toolbar

> Read CLAUDE.md. Build `Toolbar` in `/components/toolbar/Toolbar.tsx`.
>
> Toolbar is a layout wrapper only. It sits between the Paper and the InputField on Screen 3. It renders four slots in a horizontal row — one for each toolbar control. It does not contain any logic.
>
> ```typescript
> interface ToolbarProps {
>   left?: React.ReactNode
>   centerLeft?: React.ReactNode
>   centerRight?: React.ReactNode
>   right?: React.ReactNode
> }
> ```
>
> Layout: full width, horizontal flex row, `justify-between`, `items-center`, `px-4 py-2`. White background. Subtle top and bottom border (`border-y border-[#E5E5E5]`).
>
> Done when: Toolbar renders four evenly spaced slots at 390px. Each slot accepts any ReactNode.
>
> **Notes:**
> - After building, add `<Toolbar />` to `app/draft/page.tsx` between the Paper and InputField with placeholder text in each slot: `<Toolbar left="L" centerLeft="CL" centerRight="CR" right="R" />`
> - Do not modify any other file.

**Verify:** Four placeholder slots visible between paper and input at 390px. No console errors.

---

## Prompt 19 — LikelihoodBadge

> Read CLAUDE.md. Build `LikelihoodBadge` in `/components/toolbar/LikelihoodBadge.tsx`.
>
> LikelihoodBadge shows the current likelihood score as a percentage. It is hidden until slot 1 is filled. When visible it shows a navy Badge (shadcn) with the score: `"24% likely"`.
>
> ```typescript
> interface LikelihoodBadgeProps {
>   score: number        // 0-100
>   visible: boolean     // false until slot 1 filled
>   onTap?: () => void   // opens LikelihoodDetailPanel
> }
> ```
>
> When `visible` is false: render nothing (`return null`).
> When `visible` is true: render a shadcn `Badge` in navy (`bg-[#1B2A4A] text-white`) showing `"{score}% likely"`. Tapping it calls `onTap`.
>
> Done when: badge renders with a score, disappears when visible=false.
>
> **Notes:**
> - Use the `Badge` component from `@/components/ui/badge`
> - After building, add `<LikelihoodBadge score={24} visible={true} />` to the `left` slot of `<Toolbar />` in `app/draft/page.tsx`
> - Do not modify any other file.

**Verify:** Badge shows "24% likely" in navy at 390px. Changing `visible` to false makes it disappear.

---

## Prompt 20 — MemoryButton

> Read CLAUDE.md. Build `MemoryButton` in `/components/toolbar/MemoryButton.tsx`.
>
> MemoryButton is a toolbar icon button that opens the GoalTreeModal. It uses the Brain icon from lucide-react (the yin-yang icon is not available in lucide — use Brain as the closest equivalent).
>
> ```typescript
> interface MemoryButtonProps {
>   onTap: () => void
>   activeSlots: number  // 0-7, how many slots are filled
> }
> ```
>
> Render a small icon button. Navy icon (`text-[#1B2A4A]`), `h-5 w-5`. When `activeSlots > 0` show a small navy dot indicator above the icon signaling there is content to view. No dot when `activeSlots === 0`.
>
> Done when: button renders, dot appears when activeSlots > 0, disappears at 0.
>
> **Notes:**
> - After building, add `<MemoryButton onTap={() => {}} activeSlots={3} />` to the `centerLeft` slot of `<Toolbar />`
> - Do not modify any other file.

**Verify:** Brain icon visible. Dot visible with activeSlots=3. No dot with activeSlots=0.

---

## Prompt 21 — ProgressButton

> Read CLAUDE.md. Build `ProgressButton` in `/components/toolbar/ProgressButton.tsx`.
>
> ProgressButton is a toolbar icon button that opens the ProgressChartModal. It uses the `BarChart2` icon from lucide-react.
>
> ```typescript
> interface ProgressButtonProps {
>   onTap: () => void
>   percentComplete: number  // 0-100
> }
> ```
>
> Render a small icon button with the BarChart2 icon, navy (`text-[#1B2A4A]`), `h-5 w-5`. Below the icon show a tiny progress bar — full width of the button, `h-0.5`, cream background with a navy fill scaled to `percentComplete`. When `percentComplete === 0` the bar is empty. When 100 it is full navy.
>
> Done when: icon renders, progress bar fills proportionally at 390px.
>
> **Notes:**
> - Progress bar width: `style={{ width: \`${percentComplete}%\` }}` on the inner fill div — this is the one acceptable use of inline style since Tailwind cannot compute dynamic percentages at runtime
> - After building, add `<ProgressButton onTap={() => {}} percentComplete={43} />` to the `centerRight` slot of `<Toolbar />`
> - Do not modify any other file.

**Verify:** Icon visible. Progress bar shows ~43% fill. Changing value updates bar.

---

## Prompt 22 — GoalTreeModal

> Read CLAUDE.md. Build `GoalTreeModal` in `/components/modals/GoalTreeModal.tsx`.
>
> GoalTreeModal opens as a bottom sheet (shadcn `Sheet` with `side="bottom"`) and shows the current state of all 7 slots in plain language. The user can see what has been captured so far.
>
> ```typescript
> interface GoalTreeModalProps {
>   open: boolean
>   onClose: () => void
>   state: GoalTreeState
>   path: 'policy' | 'product' | 'unrouted'
> }
> ```
>
> Content: A title "Your Draft So Far". Then 7 rows, one per slot. Each row shows:
> - Slot name (e.g. "Specific Harm" for policy slot 1, "User Pain" for product slot 1)
> - Status indicator: filled (navy dot), partial (half-filled dot), empty (outlined dot)
> - Content preview if filled: first 60 characters of slot content, truncated with `...`
>
> When `path === 'unrouted'` show generic labels: "Slot 1", "Slot 2", etc.
>
> Done when: modal opens from MemoryButton, shows all 7 slots with correct status indicators.
>
> **Notes:**
> - Use `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
> - Add `open` state to `app/draft/page.tsx` for this modal: `const [goalTreeOpen, setGoalTreeOpen] = useState(false)`
> - Wire `MemoryButton` `onTap` to `setGoalTreeOpen(true)`
> - Pass current `state` and `path` to the modal
> - Do not modify any other file than `GoalTreeModal.tsx` and `app/draft/page.tsx`

**Verify:** Tap MemoryButton → bottom sheet opens showing 7 slot rows. Tap outside → closes.

---

## Prompt 23 — ProgressChartModal

> Read CLAUDE.md. Build `ProgressChartModal` in `/components/modals/ProgressChartModal.tsx`.
>
> ProgressChartModal opens as a bottom sheet and shows a visual breakdown of slot completion. Simpler than GoalTreeModal — this is a progress view, not a content view.
>
> ```typescript
> interface ProgressChartModalProps {
>   open: boolean
>   onClose: () => void
>   filledCount: number    // 0-7
>   percentComplete: number // 0-100
>   path: 'policy' | 'product' | 'unrouted'
> }
> ```
>
> Content:
> - Title: "Draft Progress"
> - Large percentage number centered: `"{percentComplete}%"` in navy, Playfair Display, large text
> - Subtitle: `"{filledCount} of 7 sections complete"`
> - A horizontal progress bar: full width, `h-2`, cream background, navy fill at `percentComplete`
> - One line of encouragement based on progress:
>   - 0%: "Start by describing the change you want to see."
>   - 1–42%: "Good start. Keep answering the questions."
>   - 43–85%: "More than halfway there."
>   - 86–99%: "Almost complete."
>   - 100%: "All sections filled. Ready to publish."
>
> Done when: modal opens, shows correct percentage and progress bar, encouragement line matches progress.
>
> **Notes:**
> - Use `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
> - Add `open` state to `app/draft/page.tsx`: `const [progressOpen, setProgressOpen] = useState(false)`
> - Wire `ProgressButton` `onTap` to `setProgressOpen(true)`
> - Use `useSlotTracker` from `@/lib/slot-tracker` in `app/draft/page.tsx` to derive `filledCount` and `percentComplete` to pass as props
> - Do not modify any other file than `ProgressChartModal.tsx` and `app/draft/page.tsx`

**Verify:** Tap ProgressButton → bottom sheet opens with percentage and progress bar. Correct encouragement line for 0%.

---

## Prompt 24 — LikelihoodDetailPanel

> Read CLAUDE.md. Build `LikelihoodDetailPanel` in `/components/modals/LikelihoodDetailPanel.tsx`.
>
> LikelihoodDetailPanel opens as a bottom sheet when the user taps the LikelihoodBadge. It explains what the score means and what factors affect it.
>
> ```typescript
> interface LikelihoodDetailPanelProps {
>   open: boolean
>   onClose: () => void
>   score: number
>   path: 'policy' | 'product' | 'unrouted'
> }
> ```
>
> Content:
> - Title: "Likelihood Score"
> - The score large and centered: `"{score}%"` in navy Playfair Display
> - One sentence explanation: "This estimates the probability that your draft will be acted on, based on specificity, precedent, and political or market conditions."
> - A divider
> - "What affects this score:" followed by 4 factors as plain rows:
>   - "Specificity of the problem statement"
>   - "Existence of precedent or prior attempts"
>   - "Named opposition and coalition"
>   - "Clarity of the mechanism or feature request"
> - A note at the bottom in small gray text: "Score updates as you answer more questions."
>
> Done when: panel opens from LikelihoodBadge tap, shows score and factors clearly.
>
> **Notes:**
> - Use `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` from `@/components/ui/sheet`
> - Add `open` state to `app/draft/page.tsx`: `const [likelihoodOpen, setLikelihoodOpen] = useState(false)`
> - Wire `LikelihoodBadge` `onTap` to `setLikelihoodOpen(true)`
> - For now pass `score={24}` and `visible={true}` as hardcoded props — real score logic comes later
> - Do not modify any other file than `LikelihoodDetailPanel.tsx` and `app/draft/page.tsx`

**Verify:** Tap the "24% likely" badge → bottom sheet opens showing score and 4 factors.

---

## After Prompt 24 — Full Toolbar Verify

Stop. Check every item before moving on.

- [ ] Toolbar renders between Paper and InputField at 390px
- [ ] LikelihoodBadge shows "24% likely", disappears when visible=false
- [ ] MemoryButton Brain icon visible, dot appears with active slots
- [ ] ProgressButton BarChart2 icon visible, progress bar fills correctly
- [ ] GoalTreeModal opens from MemoryButton, shows 7 slot rows
- [ ] ProgressChartModal opens from ProgressButton, shows percentage and bar
- [ ] LikelihoodDetailPanel opens from LikelihoodBadge tap, shows 4 factors
- [ ] All three modals close correctly
- [ ] No console errors
- [ ] `npx tsc --noEmit` clean

---

## How to Start Each Cursor Session

> "Read CLAUDE.md. We are on [current component]. The last thing completed was [previous component]. Today we are building [today's component]. Do not build anything else."

---

## What Comes Next — Playbook 3

After Playbook 2B is complete and verified, Playbook 3 covers the output layer:

- `PolicyDraftTemplate` — Legislative Launchpad structure
- `ProductDraftTemplate` — Silicon Valley Handoff structure
- `DraftDocument` — assembles from confirmed slot content
- `PublishButton` — fires only when all 7 slots confirmed
- `SupabaseClient` — database wrapper
- Public feed and voting

---

*OpenDraft — opendraft.dev*
*Playbook 2B — The Toolbar*
*Last updated: March 8, 2026*
