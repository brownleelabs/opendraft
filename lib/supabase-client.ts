import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { GoalTreeState } from "@/types";
import type { ConversationMessage } from "@/types";

export type Draft = {
  id: string;
  path: string;
  title: string;
  formatted_document: string;
  likelihood_score: number;
  published_at: string;
  vote_count?: number;
};

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  _client = createClient(url, key);
  return _client;
}

function assertValidSessionId(sessionId: string): void {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new Error("session_id is required");
  }
}

/**
 * Save or update a conversation session (upsert by session_id).
 */
export async function saveConversation(
  sessionId: string,
  goalTreeState: GoalTreeState,
  messageHistory: ConversationMessage[],
  path: string | null
): Promise<void> {
  assertValidSessionId(sessionId);
  try {
    const supabase = getClient();
    const row = {
      session_id: sessionId,
      goal_tree_state: goalTreeState as unknown as Record<string, unknown>,
      message_history: messageHistory as unknown as unknown[],
      path,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("conversations")
      .upsert(row, { onConflict: "session_id" });
    if (error) throw new Error(`saveConversation upsert failed: ${error.message}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "saveConversation failed";
    throw new Error(message);
  }
}

/**
 * Publish a completed draft. Inserts into drafts, returns the new draft id.
 */
export async function publishDraft(
  sessionId: string,
  path: string,
  title: string,
  slotContent: Record<string, string>,
  formattedDocument: string,
  likelihoodScore: number
): Promise<string> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("drafts")
      .insert({
        session_id: sessionId,
        path,
        title,
        slot_content: slotContent as unknown as Record<string, unknown>,
        formatted_document: formattedDocument,
        likelihood_score: likelihoodScore,
        existence_check_status: null,
      })
      .select("id")
      .single();

    if (error) throw new Error(`publishDraft failed: ${error.message}`);
    if (!data?.id) throw new Error("publishDraft: no id returned");
    return String(data.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "publishDraft failed";
    throw new Error(message);
  }
}

/**
 * Fetch a single published draft by id. Returns null if not found.
 * Throws on Supabase error (e.g. network). Use vote_count from returned draft for VoteButtons.
 */
export async function fetchDraftById(id: string): Promise<Draft | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id, path, title, formatted_document, likelihood_score, published_at")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`fetchDraftById failed: ${error.message}`);
  }
  if (!data) return null;

  const r = data as {
    id: string;
    path: string;
    title: string | null;
    formatted_document: string | null;
    likelihood_score: number;
    published_at: string;
  };

  let vote_count = 0;
  const { data: voteRows } = await supabase
    .from("votes")
    .select("value")
    .eq("draft_id", id);
  vote_count = (voteRows ?? []).reduce((sum, row) => sum + ((row as { value: number }).value ?? 0), 0);

  return {
    id: r.id,
    path: r.path,
    title: r.title ?? "",
    formatted_document: r.formatted_document ?? "",
    likelihood_score: r.likelihood_score,
    published_at: r.published_at,
    vote_count,
  };
}

/**
 * Count of rows in drafts (published drafts). Uses anon client.
 * Same semantics as fetchDrafts — drafts table holds published drafts only.
 * Returns 0 on any error; must never throw so Screen 1 never breaks.
 */
export async function fetchPublishedDraftCount(): Promise<number> {
  try {
    const supabase = getClient();
    const { count, error } = await supabase
      .from("drafts")
      .select("*", { count: "exact", head: true });
    if (error) return 0;
    return typeof count === "number" ? count : 0;
  } catch {
    return 0;
  }
}

/**
 * Fetch all published drafts for the feed with vote counts, ordered by published_at descending.
 */
export async function fetchDrafts(): Promise<Draft[]> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from("drafts")
      .select("id, path, title, formatted_document, likelihood_score, published_at")
      .order("published_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(`fetchDrafts failed: ${error.message}`);
    const rows = (data ?? []) as Array<{
      id: string;
      path: string;
      title: string | null;
      formatted_document: string | null;
      likelihood_score: number;
      published_at: string;
    }>;
    const ids = rows.map((r) => r.id);
    const voteCountByDraft: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: voteRows } = await supabase
        .from("votes")
        .select("draft_id, value")
        .in("draft_id", ids);
      for (const v of voteRows ?? []) {
        const id = (v as { draft_id: string; value: number }).draft_id;
        const val = (v as { draft_id: string; value: number }).value;
        voteCountByDraft[id] = (voteCountByDraft[id] ?? 0) + val;
      }
    }
    return rows.map((r) => ({
      id: r.id,
      path: r.path,
      title: r.title ?? "",
      formatted_document: r.formatted_document ?? "",
      likelihood_score: r.likelihood_score,
      published_at: r.published_at,
      vote_count: voteCountByDraft[r.id] ?? 0,
    }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetchDrafts failed";
    throw new Error(message);
  }
}

/**
 * Log a telemetry event (fire-and-forget). Events table is service-role only;
 * call from API routes or use a logging API that uses service role.
 */
export async function logEvent(
  sessionId: string,
  eventType: string,
  options?: {
    path?: string;
    slotNumber?: number;
    persona?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  assertValidSessionId(sessionId);
  fetch("/api/log-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, eventType, options }),
  }).catch((err) => console.error("Event log failed:", err));
}
