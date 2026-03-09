/**
 * Stub: real vote logic in v1.5. Accepts POST { draftId, value: 1 | -1 }.
 */
export async function POST(request: Request) {
  try {
    await request.json(); // consume body
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Vote failed" }, { status: 500 });
  }
}
