import { conversationCall } from "@/lib/anthropic-client";
import { getSystemPrompt } from "@/lib/system-prompt";
import type { GoalTreeState, SlotStatus } from "@/types";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ParsedResponse = {
  understood: string;
  question: string;
  slots: Record<string, { status: string; content: string | null }> | null;
  path: string | null;
};

const SLOT_KEYS = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7"] as const;
const VALID_STATUSES = ["empty", "partial", "filled"] as const;

function parseJsonBlock(rawResponse: string): { slots: ParsedResponse["slots"]; path: ParsedResponse["path"] } {
  const match = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (!match) return { slots: null, path: null };
  let jsonStr = match[1].trim();
  try {
    const data = JSON.parse(jsonStr) as Record<string, unknown>;
    const slots = data.slots;
    const path = data.path;
    if (typeof slots !== "object" || slots === null) {
      return { slots: null, path: typeof path === "string" ? path : null };
    }
    const out: Record<string, { status: string; content: string | null }> = {};
    for (const key of SLOT_KEYS) {
      const s = (slots as Record<string, unknown>)[key];
      if (s && typeof s === "object" && "status" in s && typeof (s as { status: unknown }).status === "string") {
        const status = (s as { status: string }).status;
        const content = (s as { content?: unknown }).content;
        out[key] = {
          status: VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number]) ? status : "empty",
          content: content != null && typeof content === "string" ? content : null,
        };
      }
    }
    return {
      slots: Object.keys(out).length > 0 ? out : null,
      path: typeof path === "string" && (path === "policy" || path === "product" || path === "unrouted") ? path : null,
    };
  } catch {
    return { slots: null, path: null };
  }
}

export function parseResponse(rawResponse: string): ParsedResponse {
  let understood = "";
  let question = "";
  const lines = rawResponse.split(/\r?\n/);
  for (const line of lines) {
    const normalized = line.replace(/^\s*\*+/, "");
    const understoodMatch = normalized.match(/^Understood:\**\s*(.*)/i);
    if (understoodMatch) {
      understood = understoodMatch[1].trim();
      continue;
    }
    const questionMatch = normalized.match(/^Question:\**\s*"(.*)"\s*$/);
    if (questionMatch) {
      question = questionMatch[1].trim();
      continue;
    }
    const questionMatchUnquoted = normalized.match(/^Question:\**\s*(.+)/i);
    if (questionMatchUnquoted) {
      question = questionMatchUnquoted[1].trim().replace(/^"|"$/g, "");
    }
  }
  const { slots, path } = parseJsonBlock(rawResponse);
  return { understood, question, slots, path };
}

const EMPTY_SLOTS: GoalTreeState["slots"] = Object.fromEntries(
  SLOT_KEYS.map((k) => [k, { status: "empty" as const, content: null }])
) as GoalTreeState["slots"];

/**
 * Merge parsed AI response (slots, path) into state. AI-reported slots override;
 * when parsed.path is policy/product, use it and advance phase from 1 to 2 if needed.
 */
export function mergeParsedResponseIntoState(
  state: GoalTreeState,
  parsed: ParsedResponse
): GoalTreeState {
  let next = state;
  if (parsed.slots && typeof parsed.slots === "object") {
    const baseSlots = next.slots ?? EMPTY_SLOTS;
    const merged = { ...baseSlots };
    for (const key of SLOT_KEYS) {
      const p = parsed.slots[key];
      if (p) {
        const status = VALID_STATUSES.includes(p.status as (typeof VALID_STATUSES)[number])
          ? (p.status as SlotStatus["status"])
          : ("empty" as const);
        merged[key] = { status, content: p.content ?? null };
      }
    }
    next = { ...next, slots: merged };
  }
  if (parsed.path === "policy" || parsed.path === "product") {
    next = { ...next, path: parsed.path };
    if (next.phase === 1) next = { ...next, phase: 2 };
  }
  return next;
}

/**
 * When in phase 1 with path unrouted, infer path from user input so the returned
 * updatedState has path set and can be persisted correctly by the client.
 */
export function inferPathFromInput(
  state: GoalTreeState,
  input: string
): GoalTreeState {
  if (state.phase !== 1 || state.path !== "unrouted") return state;
  const lower = input.trim().toLowerCase();
  const policyTerms = /policy|legislative|bill|law|government|regulation|statute|congress|senate|representative/i;
  const productTerms = /product|feature|app|software|company|startup|saas|platform/i;
  if (policyTerms.test(lower) && !productTerms.test(lower)) {
    return { ...state, path: "policy", phase: 2 };
  }
  if (productTerms.test(lower)) {
    return { ...state, path: "product", phase: 2 };
  }
  return state;
}

export async function processMessage(
  input: string,
  state: GoalTreeState,
  history: ConversationMessage[]
): Promise<{
  understood: string;
  question: string;
  updatedState: GoalTreeState;
  rawResponse: string;
}> {
  const systemPrompt = getSystemPrompt();
  const messages: ConversationMessage[] = [
    ...history,
    { role: "user", content: input },
  ];
  const rawResponse = await conversationCall(messages, systemPrompt);
  const parsed = parseResponse(rawResponse);
  const baseState = inferPathFromInput(state, input);
  const updatedState = mergeParsedResponseIntoState(baseState, parsed);
  return {
    understood: parsed.understood,
    question: parsed.question,
    updatedState,
    rawResponse,
  };
}
