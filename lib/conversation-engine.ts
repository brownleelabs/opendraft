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
  return {
    understood,
    question,
    updatedState: state,
    rawResponse,
  };
}
