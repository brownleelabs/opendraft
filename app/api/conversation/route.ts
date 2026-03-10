import { conversationStream } from "@/lib/anthropic-client";
import { inferPathFromInput, parseResponse } from "@/lib/conversation-engine";
import { getSystemPrompt } from "@/lib/system-prompt";
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

const SLOT_KEYS = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7"] as const;

function isValidSlotStatus(s: unknown): s is { status: string; content: unknown } {
  return (
    typeof s === "object" &&
    s !== null &&
    "status" in s &&
    typeof (s as { status: unknown }).status === "string" &&
    "content" in s
  );
}

function isValidGoalTreeState(state: unknown): state is GoalTreeState {
  if (typeof state !== "object" || state === null) return false;
  const o = state as Record<string, unknown>;
  if (!o.slots || typeof o.slots !== "object") return false;
  const slots = o.slots as Record<string, unknown>;
  for (const key of SLOT_KEYS) {
    if (!isValidSlotStatus(slots[key])) return false;
  }
  return true;
}

function validateRequestBody(body: unknown): { input: string; state: GoalTreeState; history: ConversationMessage[] } {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid request body");
  }
  const b = body as Record<string, unknown>;
  const input = b.input;
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("Invalid request body");
  }
  const state = b.state;
  if (!isValidGoalTreeState(state)) {
    throw new Error("Invalid request body");
  }
  const history = (Array.isArray(b.history) ? b.history : []) as ConversationMessage[];
  return { input: input.trim(), state, history };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, state, history } = validateRequestBody(body);
    const systemPrompt = getSystemPrompt();
    const messages: ConversationMessage[] = [...history, { role: "user", content: input }];
    const stream = conversationStream(messages, systemPrompt);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });
        try {
          const rawResponse = await stream.finalText();
          const { understood, question } = parseResponse(rawResponse);
          const updatedState = inferPathFromInput(state, input);
          const payload = JSON.stringify({
            understood,
            question,
            updatedState,
            rawResponse,
          });
          controller.enqueue(encoder.encode("\n__DONE__" + payload + "\n"));
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid request body") {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    const message =
      err instanceof Error ? err.message : "Conversation failed";
    console.error("[POST /api/conversation]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
