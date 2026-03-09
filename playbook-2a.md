# OpenDraft — Playbook 2A
## Prompts 14–17: Real AI Connection
> Same rules as Playbook 1. One component. One job. Verify before moving on. Do not let Cursor run ahead.

---

## What This Playbook Builds

By the end of this playbook the product will have a real AI conversation. A user types an idea, the system asks real Socratic questions, and the paper updates with live AI responses. This is the core product becoming real.

Four steps:
1. `AnthropicClient` — the API wrapper
2. `SystemPrompt` — loads the system prompt from the md file
3. `SlotTracker` — custom hook that reads GoalTreeState
4. `ConversationEngine` — replace the stub with real logic

---

## Before You Start

Confirm all three of these before Prompt 14:

- [ ] `.env.local` exists at project root with `ANTHROPIC_API_KEY=` set
- [ ] `opendraft-system-prompt-v1.md` is in the project root
- [ ] `npx tsc --noEmit` runs clean from the last session

---

## Prompt 14 — AnthropicClient

> Read CLAUDE.md. Build the Anthropic API wrapper in `/lib/anthropic-client.ts`.
>
> This file is the only place in the entire codebase that calls the Anthropic API. No component, no page, and no other lib file calls Anthropic directly. Everything goes through here.
>
> Export two functions:
>
> **`conversationCall`** — uses `claude-sonnet-4-6`, handles the main conversation turn. Accepts a messages array and system prompt string. Returns the response text. Enables prompt caching on the system parameter using `cache_control: { type: 'ephemeral' }`.
>
> **`classifyCall`** — uses `claude-haiku-4-5-20251001`, handles fast classification tasks (slot detection, path routing). Accepts a content string and instruction string. Returns the response text trimmed.
>
> ```typescript
> import Anthropic from '@anthropic-ai/sdk'
>
> const anthropic = new Anthropic({
>   apiKey: process.env.ANTHROPIC_API_KEY
> })
>
> export async function conversationCall(
>   messages: { role: 'user' | 'assistant'; content: string }[],
>   systemPrompt: string
> ): Promise<string>
>
> export async function classifyCall(
>   content: string,
>   instruction: string
> ): Promise<string>
> ```
>
> Done when: both functions are exported, TypeScript is clean, no API calls are made on import.
>
> **Notes:**
> - Install the SDK first: `npm install @anthropic-ai/sdk`
> - `max_tokens: 1000` on both calls
> - Wrap both in try/catch — throw a typed error with a clear message on failure
> - Do not call either function from this file — exports only
> - Do not modify any other file

**Verify:** `npm install @anthropic-ai/sdk` completes. `npx tsc --noEmit` runs clean. No other files changed.

---

## Prompt 15 — SystemPrompt

> Read CLAUDE.md. Build the system prompt loader in `/lib/system-prompt.ts`.
>
> This file reads `opendraft-system-prompt-v1.md` from the project root and exports the prompt text as a string for use in API calls.
>
> In Next.js App Router, file system reads happen in server components or API routes using `fs` from Node. This is a server-side utility only.
>
> Export one function:
>
> ```typescript
> export function getSystemPrompt(): string
> ```
>
> It reads the file synchronously using `fs.readFileSync` and `path.join(process.cwd(), 'opendraft-system-prompt-v1.md')`. Returns the full file contents as a string.
>
> Also export a cached version using a module-level variable so the file is only read once per server process:
>
> ```typescript
> let cachedPrompt: string | null = null
>
> export function getSystemPrompt(): string {
>   if (!cachedPrompt) {
>     cachedPrompt = fs.readFileSync(
>       path.join(process.cwd(), 'opendraft-system-prompt-v1.md'),
>       'utf-8'
>     )
>   }
>   return cachedPrompt
> }
> ```
>
> Done when: function is exported, reads the file correctly, caches on first call, TypeScript clean.
>
> **Notes:**
> - Import `fs` from `'fs'` and `path` from `'path'` — both are Node built-ins, no install needed
> - This file is server-side only — never import it in a client component
> - Do not modify any other file

**Verify:** `npx tsc --noEmit` runs clean. No other files changed.

---

## Prompt 16 — SlotTracker

> Read CLAUDE.md. Build the slot tracker hook in `/lib/slot-tracker.ts`.
>
> This is a custom React hook that derives slot completion information from `GoalTreeState`. It is used by `LikelihoodBadge`, `ProgressButton`, and eventually `ConversationEngine` to understand where the user is in the 7-slot process.
>
> Export one hook:
>
> ```typescript
> export function useSlotTracker(state: GoalTreeState) {
>   // returns derived slot information
> }
> ```
>
> The hook should return:
>
> ```typescript
> {
>   filledCount: number,          // 0-7, how many slots are filled
>   totalSlots: number,           // always 7
>   percentComplete: number,      // 0-100, rounded
>   currentSlot: number,          // 1-7, the next empty slot
>   allFilled: boolean,           // true when filledCount === 7
>   slotStatuses: SlotStatus[]    // array of all 7 slot statuses in order
> }
> ```
>
> Use `useMemo` to avoid recalculating on every render.
>
> Done when: hook exports correctly, types are clean, `npx tsc --noEmit` passes.
>
> **Notes:**
> - Import `GoalTreeState` and `SlotStatus` from `@/types`
> - Import `useMemo` from `react`
> - This is a client-side hook — it uses React. Do not mark it server-only.
> - `currentSlot` should return the index (1-7) of the first slot with status `'empty'` or `'partial'`. If all slots are filled, return 7.
> - Do not modify any other file.

**Verify:** `npx tsc --noEmit` runs clean. No other files changed.

---

## Prompt 17 — ConversationEngine (Real)

> Read CLAUDE.md. Replace the stub in `/lib/conversation-engine.ts` with the real implementation.
>
> This is the orchestration layer. Every user message passes through this function before anything updates on screen. It calls `AnthropicClient` and uses the system prompt.
>
> Replace the current stub with this implementation:
>
> ```typescript
> import { conversationCall } from '@/lib/anthropic-client'
> import { getSystemPrompt } from '@/lib/system-prompt'
> import { GoalTreeState } from '@/types'
>
> type ConversationMessage = {
>   role: 'user' | 'assistant'
>   content: string
> }
>
> export async function processMessage(
>   input: string,
>   state: GoalTreeState,
>   history: ConversationMessage[]
> ): Promise<{
>   understood: string
>   question: string
>   updatedState: GoalTreeState
>   rawResponse: string
> }>
> ```
>
> The function should:
> 1. Get the system prompt via `getSystemPrompt()`
> 2. Build the messages array from history plus the new user input
> 3. Call `conversationCall(messages, systemPrompt)`
> 4. Parse the response — extract the `Understood:` line and the `Question:` line
> 5. Return `{ understood, question, updatedState: state, rawResponse }`
>
> For parsing the response, the AI always returns in this format:
> ```
> Understood: [one sentence]
> Question: "[one question]"
> ```
> Parse by splitting on newlines and extracting the text after `Understood:` and `Question:`.
>
> For now `updatedState` returns the same state passed in — slot detection logic comes in v2 of this function.
>
> Done when: real API call fires on user submit, AI response parses into understood + question, AIResponseBlock renders the real response.
>
> **Notes:**
> - This file is server-side only — it calls the Anthropic API. The function is called from an API route, not directly from a component.
> - Update `app/api/conversation/route.ts` to accept `{ input, state, history }` in the request body, call `processMessage`, and return the result as JSON.
> - Update `app/draft/page.tsx` to call `/api/conversation` via `fetch` instead of calling `processMessage` directly — components cannot call server-side lib functions directly in Next.js App Router.
> - The `history` array should be stored in state in `app/draft/page.tsx` and passed in the fetch body on each submit.
> - Do not modify any other file.

**Verify:** Type an idea into the InputField and submit. A real AI response appears in the paper with a genuine `Understood:` reflection and a real `Question:`. Check the Network tab in DevTools — you should see a POST to `/api/conversation` returning 200.

---

## After Prompt 17 — Full Verify

Stop. Do not continue to Playbook 2B until every item checks out.

- [ ] Real AI response appears after submit at `/draft`
- [ ] Response has two parts — Understood and Question — both rendering in AIResponseBlock
- [ ] Second submit sends the conversation history correctly — AI response references previous message
- [ ] Network tab shows POST `/api/conversation` → 200
- [ ] No console errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Paper auto-scrolls to latest response

When all boxes are checked you have a working Socratic conversation engine. That is the core product. Everything from here is refinement and output.

---

## How to Start Each Cursor Session

> "Read CLAUDE.md. We are on [current component]. The last thing completed was [previous component]. Today we are building [today's component]. Do not build anything else."

---

## What Comes Next — Playbook 2B

After this playbook is complete and verified, Playbook 2B covers:

- Prompt 18: `Toolbar` — layout wrapper for four icon slots
- Prompt 19: `LikelihoodBadge` — score display, hidden until slot 1 filled
- Prompt 20: `MemoryButton` — opens GoalTreeModal
- Prompt 21: `ProgressButton` — opens ProgressChartModal
- Prompt 22: `GoalTreeModal` — current slot state in plain language
- Prompt 23: `ProgressChartModal` — visual slot completion
- Prompt 24: `LikelihoodDetailPanel` — score explanation

---

*OpenDraft — opendraft.dev*
*Playbook 2A — Real AI Connection*
*Last updated: March 8, 2026*
