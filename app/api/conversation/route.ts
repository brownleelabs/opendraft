import { processMessage } from "@/lib/conversation-engine";
import type { GoalTreeState } from "@/types";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  input: string;
  state: GoalTreeState;
  history: ConversationMessage[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const { input, state, history } = body;
    const result = await processMessage(input, state, history ?? []);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Conversation failed";
    console.error("[POST /api/conversation]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
