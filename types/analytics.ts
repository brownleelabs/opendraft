/**
 * Types for admin analytics query results.
 * Used by lib/analytics.ts and admin dashboard components.
 */

export interface OverviewStats {
  total_sessions: number;
  completed_sessions: number;
  published_sessions: number;
  completion_rate: number;
  publish_rate: number;
  avg_session_duration_seconds: number | null;
  sessions_last_7_days: number;
}

export type DropOffFunnelStageName =
  | "started"
  | "routed"
  | "slot_1"
  | "slot_3"
  | "slot_5"
  | "slot_7"
  | "completed"
  | "published";

export interface DropOffFunnelStage {
  stage: DropOffFunnelStageName;
  count: number;
}

export interface SlotDifficulty {
  slot_number: number;
  fill_count: number;
  drop_rate: number | null;
}

export interface PathDistribution {
  policy_count: number;
  product_count: number;
  unrouted_count: number;
  policy_pct: number;
  product_pct: number;
  unrouted_pct: number;
}

export interface FeedHealth {
  total_published: number;
  policy_published: number;
  product_published: number;
  avg_upvotes: number | null;
  drafts_with_votes: number;
  most_recent_published_at: string | null;
}

export interface RecentSession {
  session_id: string;
  created_at: string;
  path: string | null;
  slots_filled: number;
  completed: boolean;
  published: boolean;
  total_turns: number;
  session_duration_seconds: number | null;
  abandoned_at_slot: number | null;
}

export interface SessionEvent {
  id: string;
  event_type: string;
  created_at: string;
  path: string | null;
  slot_number: number | null;
  metadata: Record<string, unknown> | null;
}
