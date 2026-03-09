import { getServiceRoleClient } from "@/lib/supabase-server";

type LogEventBody = {
  sessionId: string;
  eventType: string;
  path?: string;
  slotNumber?: number;
  persona?: string;
  metadata?: Record<string, unknown>;
};

const MAX_EVENT_TYPE_LENGTH = 64;
const MAX_SESSION_ID_LENGTH = 128;

function validateBody(body: unknown): LogEventBody {
  if (typeof body !== "object" || body === null) {
    throw new Error("Invalid body");
  }
  const b = body as Record<string, unknown>;
  const sessionId = b.sessionId;
  if (typeof sessionId !== "string" || sessionId.trim() === "" || sessionId.length > MAX_SESSION_ID_LENGTH) {
    throw new Error("Invalid body");
  }
  const eventType = b.eventType;
  if (typeof eventType !== "string" || eventType.trim() === "" || eventType.length > MAX_EVENT_TYPE_LENGTH) {
    throw new Error("Invalid body");
  }
  const opts = b.options;
  const options = typeof opts === "object" && opts !== null ? (opts as Record<string, unknown>) : {};
  const path = b.path ?? options.path;
  const slotNumber = b.slotNumber ?? options.slotNumber;
  const persona = b.persona ?? options.persona;
  const metadata = b.metadata ?? options.metadata;
  return {
    sessionId: sessionId.trim(),
    eventType: eventType.trim(),
    path: path === undefined || path === null ? undefined : typeof path === "string" ? path : undefined,
    slotNumber: typeof slotNumber === "number" ? slotNumber : undefined,
    persona: persona === undefined || persona === null ? undefined : typeof persona === "string" ? persona : undefined,
    metadata: metadata !== undefined && metadata !== null && typeof metadata === "object" ? (metadata as Record<string, unknown>) : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, eventType, path, slotNumber, persona, metadata } = validateBody(body);

    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("events").insert({
      session_id: sessionId,
      event_type: eventType,
      path: path ?? null,
      slot_number: slotNumber ?? null,
      persona: persona ?? null,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error("[POST /api/log-event]", error);
      return Response.json({ error: "Event log failed" }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid body") {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
    console.error("[POST /api/log-event]", err);
    return Response.json({ error: "Event log failed" }, { status: 500 });
  }
}
