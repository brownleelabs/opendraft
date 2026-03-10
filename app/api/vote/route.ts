import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  return createClient(url, key);
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * POST { draftId: string, value: 1 | -1, deviceFingerprint?: string }.
 * Inserts into votes. Returns 409 if already voted (unique on draft_id + device_fingerprint).
 * Returns { ok: true, newTotal: number } on success.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draftId =
      typeof body?.draftId === "string" ? body.draftId.trim() : "";
    const value = body?.value === 1 ? 1 : body?.value === -1 ? -1 : null;
    const deviceFingerprint =
      typeof body?.deviceFingerprint === "string" &&
      body.deviceFingerprint.trim().length > 0
        ? body.deviceFingerprint.trim()
        : null;

    if (!draftId || !UUID_REGEX.test(draftId) || value === null) {
      return Response.json(
        { error: "Invalid body: draftId (uuid) and value (1 or -1) required" },
        { status: 400 }
      );
    }

    const fingerprint = deviceFingerprint ?? crypto.randomUUID();

    const supabase = getSupabase();
    const { error } = await supabase.from("votes").insert({
      draft_id: draftId,
      device_fingerprint: fingerprint,
      value,
    });

    if (error) {
      if (error.code === "23505") {
        return Response.json(
          { error: "Already voted on this draft" },
          { status: 409 }
        );
      }
      throw error;
    }

    const { data: voteRows } = await supabase
      .from("votes")
      .select("value")
      .eq("draft_id", draftId);
    const newTotal =
      (voteRows ?? []).reduce((sum, r) => sum + (r.value ?? 0), 0);

    return Response.json({
      ok: true,
      newTotal,
      deviceFingerprint: deviceFingerprint ? undefined : fingerprint,
    });
  } catch (err) {
    console.error("Vote failed:", err);
    return Response.json({ error: "Vote failed" }, { status: 500 });
  }
}
