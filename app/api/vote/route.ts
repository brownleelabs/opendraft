/**
 * Stub: real vote logic in v1.5. Accepts POST { draftId, value: 1 | -1 }.
 * When implementing: add DB unique constraint on (draft_id, device_fingerprint),
 * return 409 or "already voted" when insert violates uniqueness. Do not rely only on UI.
 */
export async function POST(request: Request) {
  try {
    await request.json(); // consume body
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Vote failed" }, { status: 500 });
  }
}
