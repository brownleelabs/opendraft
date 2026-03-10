import { conversationCall } from "@/lib/anthropic-client";
import { getSystemPrompt } from "@/lib/system-prompt";
import type { GoalTreeState } from "@/types";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

function parseResponse(rawResponse: string): { understood: string; question: string } {
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
  return { understood, question };
}

/**
 * When in phase 1 with path unrouted, infer path from user input so the returned
 * updatedState has path set and can be persisted correctly by the client.
 */
function inferPathFromInput(
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
  const { understood, question } = parseResponse(rawResponse);
  const baseState = state;
  const updatedState = inferPathFromInput(baseState, input);
  return {
    understood,
    question,
    updatedState,
    rawResponse,
  };
}
