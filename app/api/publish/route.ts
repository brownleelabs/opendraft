import { publishDraft } from "@/lib/supabase-client";
import type { GoalTreeState } from "@/types";

type PublishBody = {
  state: GoalTreeState;
  sessionId: string;
  path: string;
  formattedDocument: string;
};

function slotContentFromState(state: GoalTreeState): Record<string, string> {
  const s = state.slots;
  return {
    slot1: s.slot1.content ?? "",
    slot2: s.slot2.content ?? "",
    slot3: s.slot3.content ?? "",
    slot4: s.slot4.content ?? "",
    slot5: s.slot5.content ?? "",
    slot6: s.slot6.content ?? "",
    slot7: s.slot7.content ?? "",
  };
}

function titleFromSlot1(state: GoalTreeState): string {
  const raw = state.slots.slot1.content ?? "";
  const trimmed = raw.trim();
  if (trimmed.length <= 60) return trimmed;
  return trimmed.slice(0, 60).trim() + "…";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishBody;
    const { state, sessionId, path, formattedDocument } = body;

    if (!state?.slots || !sessionId || !path || typeof formattedDocument !== "string") {
      return Response.json(
        { error: "Missing state, sessionId, path, or formattedDocument" },
        { status: 400 }
      );
    }

    if (path !== "policy" && path !== "product") {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }

    if (state.path !== path) {
      return Response.json({ error: "Path does not match state" }, { status: 400 });
    }

    const slotContent = slotContentFromState(state);
    const title = titleFromSlot1(state);

    if (title.trim() === "" || formattedDocument.trim() === "") {
      return Response.json(
        { error: "Title and formatted document are required" },
        { status: 400 }
      );
    }

    const allSlotsFilled = (
      ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7"] as const
    ).every((key) => (state.slots[key].content ?? "").trim() !== "");
    if (!allSlotsFilled) {
      return Response.json(
        { error: "All slots must be filled before publishing" },
        { status: 400 }
      );
    }

    const likelihoodScore = 0; // placeholder until v2

    const draftId = await publishDraft(
      sessionId,
      path,
      title,
      slotContent,
      formattedDocument,
      likelihoodScore
    );

    return Response.json({ success: true, draftId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Publish failed";
    console.error("[POST /api/publish]", err);
    return Response.json({ error: message }, { status: 500 });
  }
}
