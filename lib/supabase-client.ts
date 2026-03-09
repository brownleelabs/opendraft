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
 * Fetch all published drafts for the feed, ordered by published_at descending.
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
    return rows.map((r) => ({
      id: r.id,
      path: r.path,
      title: r.title ?? "",
      formatted_document: r.formatted_document ?? "",
      likelihood_score: r.likelihood_score,
      published_at: r.published_at,
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
