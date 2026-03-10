/**
 * Server-only. Do not import from client code.
 *
 * Typed analytics query layer for the admin dashboard.
 * All queries use getServiceRoleClient() from lib/supabase-server.ts.
 * Throws on Supabase error.
 */

import { getServiceRoleClient } from "@/lib/supabase-server";
import type {
  OverviewStats,
  DropOffFunnelStage,
  DropOffFunnelStageName,
  SlotDifficulty,
  PathDistribution,
  FeedHealth,
  RecentSession,
  SessionEvent,
} from "@/types/analytics";

function throwOnError<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function getCount(result: { count: number | null; error: { message: string } | null }): number {
  if (result.error) throw new Error(result.error.message);
  return result.count ?? 0;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const supabase = getServiceRoleClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [all, completed, published, withDuration, last7] = await Promise.all([
    supabase.from("conversations").select("id", { count: "exact", head: true }),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("completed", true),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("conversations").select("session_duration_seconds").not("session_duration_seconds", "is", null),
    supabase.from("conversations").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
  ]);

  const totalSessions = getCount(all as { count: number | null; error: { message: string } | null });
  const completedSessions = getCount(completed as { count: number | null; error: { message: string } | null });
  const publishedSessions = getCount(published as { count: number | null; error: { message: string } | null });
  const durationRows = throwOnError(withDuration) as { session_duration_seconds: number }[];
  const sessionsLast7Days = getCount(last7 as { count: number | null; error: { message: string } | null });

  const sumDuration = durationRows.reduce((acc, r) => acc + (r.session_duration_seconds ?? 0), 0);
  const avgSessionDurationSeconds =
    durationRows.length > 0 ? sumDuration / durationRows.length : null;

  return {
    total_sessions: totalSessions,
    completed_sessions: completedSessions,
    published_sessions: publishedSessions,
    completion_rate: totalSessions === 0 ? 0 : completedSessions / totalSessions,
    publish_rate: completedSessions === 0 ? 0 : publishedSessions / completedSessions,
    avg_session_duration_seconds: avgSessionDurationSeconds,
    sessions_last_7_days: sessionsLast7Days,
  };
}

async function getConversationCount(
  supabase: ReturnType<typeof getServiceRoleClient>,
  filter?: { column: string; op: string; value: unknown }
): Promise<number> {
  let q = supabase.from("conversations").select("id", { count: "exact", head: true });
  if (filter) {
    if (filter.op === "eq") q = q.eq(filter.column, filter.value);
    else if (filter.op === "gte") q = q.gte(filter.column, filter.value);
    else if (filter.op === "not.is") q = q.not(filter.column, "is", filter.value);
  }
  const result = await q;
  return getCount(result as { count: number | null; error: { message: string } | null });
}

export async function getDropOffFunnel(): Promise<DropOffFunnelStage[]> {
  const supabase = getServiceRoleClient();

  const [started, routed, slot1, slot3, slot5, slot7, completed, published] = await Promise.all([
    getConversationCount(supabase),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .not("path", "is", null)
      .neq("path", "unrouted")
      .then((r) => getCount(r as { count: number | null; error: { message: string } | null })),
    getConversationCount(supabase, { column: "slots_filled", op: "gte", value: 1 }),
    getConversationCount(supabase, { column: "slots_filled", op: "gte", value: 3 }),
    getConversationCount(supabase, { column: "slots_filled", op: "gte", value: 5 }),
    getConversationCount(supabase, { column: "slots_filled", op: "eq", value: 7 }),
    getConversationCount(supabase, { column: "completed", op: "eq", value: true }),
    getConversationCount(supabase, { column: "published", op: "eq", value: true }),
  ]);

  const stages: DropOffFunnelStage[] = [
    { stage: "started" as DropOffFunnelStageName, count: started },
    { stage: "routed", count: routed },
    { stage: "slot_1", count: slot1 },
    { stage: "slot_3", count: slot3 },
    { stage: "slot_5", count: slot5 },
    { stage: "slot_7", count: slot7 },
    { stage: "completed", count: completed },
    { stage: "published", count: published },
  ];
  return stages;
}

export async function getSlotDifficulty(): Promise<SlotDifficulty[]> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("events")
    .select("slot_number")
    .eq("event_type", "slot_filled");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as { slot_number: number | null }[];
  const fillCountBySlot: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  for (const r of rows) {
    const n = r.slot_number;
    if (n != null && n >= 1 && n <= 7) fillCountBySlot[n] = (fillCountBySlot[n] ?? 0) + 1;
  }

  const result: SlotDifficulty[] = [];
  for (let slot = 1; slot <= 7; slot++) {
    const fill_count = fillCountBySlot[slot] ?? 0;
    const prev = slot === 1 ? fill_count : (fillCountBySlot[slot - 1] ?? 0);
    const drop_rate =
      slot === 1 ? 0 : prev === 0 ? null : (prev - fill_count) / prev;
    result.push({ slot_number: slot, fill_count, drop_rate });
  }
  return result;
}

export async function getPathDistribution(): Promise<PathDistribution> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.from("conversations").select("path");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as { path: string | null }[];
  let policy_count = 0;
  let product_count = 0;
  let unrouted_count = 0;
  for (const r of rows) {
    const p = r.path;
    if (p === "policy") policy_count++;
    else if (p === "product") product_count++;
    else unrouted_count++;
  }
  const total = rows.length;
  return {
    policy_count,
    product_count,
    unrouted_count,
    policy_pct: total === 0 ? 0 : (policy_count / total) * 100,
    product_pct: total === 0 ? 0 : (product_count / total) * 100,
    unrouted_pct: total === 0 ? 0 : (unrouted_count / total) * 100,
  };
}

export async function getFeedHealth(): Promise<FeedHealth> {
  const supabase = getServiceRoleClient();

  const { data: draftsData, error: draftsError } = await supabase
    .from("drafts")
    .select("id, path, published_at");
  if (draftsError) throw new Error(draftsError.message);
  const drafts = (draftsData ?? []) as { id: string; path: string; published_at: string }[];

  const { data: votesData, error: votesError } = await supabase.from("votes").select("draft_id");
  if (votesError) throw new Error(votesError.message);
  const votes = (votesData ?? []) as { draft_id: string }[];

  const voteCountByDraft: Record<string, number> = {};
  for (const v of votes) {
    voteCountByDraft[v.draft_id] = (voteCountByDraft[v.draft_id] ?? 0) + 1;
  }

  const policy_published = drafts.filter((d) => d.path === "policy").length;
  const product_published = drafts.filter((d) => d.path === "product").length;
  const draftsWithVotes = drafts.filter((d) => (voteCountByDraft[d.id] ?? 0) > 0).length;
  const voteCounts = drafts.map((d) => voteCountByDraft[d.id] ?? 0);
  const avg_upvotes =
    drafts.length === 0
      ? null
      : voteCounts.reduce((a, b) => a + b, 0) / drafts.length;
  const most_recent_published_at =
    drafts.length === 0
      ? null
      : drafts.reduce(
          (max, d) => (d.published_at > (max ?? "") ? d.published_at : max),
          null as string | null
        );

  return {
    total_published: drafts.length,
    policy_published,
    product_published,
    avg_upvotes,
    drafts_with_votes: draftsWithVotes,
    most_recent_published_at,
  };
}

export async function getRecentSessions(limit = 20): Promise<RecentSession[]> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      "session_id, created_at, path, slots_filled, completed, published, total_turns, session_duration_seconds, abandoned_at_slot"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as {
    session_id: string;
    created_at: string;
    path: string | null;
    slots_filled: number;
    completed: boolean;
    published: boolean;
    total_turns: number;
    session_duration_seconds: number | null;
    abandoned_at_slot: number | null;
  }[];
  return rows.map((r) => ({
    session_id: r.session_id,
    created_at: r.created_at,
    path: r.path,
    slots_filled: r.slots_filled ?? 0,
    completed: r.completed ?? false,
    published: r.published ?? false,
    total_turns: r.total_turns ?? 0,
    session_duration_seconds: r.session_duration_seconds ?? null,
    abandoned_at_slot: r.abandoned_at_slot ?? null,
  }));
}

export async function getSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, event_type, created_at, path, slot_number, metadata")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as {
    id: string;
    event_type: string;
    created_at: string;
    path: string | null;
    slot_number: number | null;
    metadata: Record<string, unknown> | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    event_type: r.event_type,
    created_at: r.created_at,
    path: r.path,
    slot_number: r.slot_number,
    metadata: r.metadata,
  }));
}
