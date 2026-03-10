"use client";

import { useState, useCallback, Fragment } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { RecentSession as RecentSessionType, SessionEvent as SessionEventType } from "@/types/analytics";

function formatSessionTime(isoString: string): string {
  const d = new Date(isoString);
  const mon = d.toLocaleString("en-US", { month: "short" });
  const day = d.getDate();
  const hour = d.getHours();
  const min = d.getMinutes();
  const ampm = hour >= 12 ? "pm" : "am";
  const hour12 = hour % 12 || 12;
  return `${mon} ${day}, ${hour12}:${min.toString().padStart(2, "0")}${ampm}`;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function formatEventOffset(createdAt: string, baseCreatedAt: string): string {
  const a = new Date(createdAt).getTime();
  const b = new Date(baseCreatedAt).getTime();
  const diffSec = Math.floor((a - b) / 1000);
  if (diffSec <= 0) return "0s";
  if (diffSec < 60) return `+${diffSec}s`;
  const m = Math.floor(diffSec / 60);
  const s = diffSec % 60;
  return `+${m}m ${s}s`;
}

function formatEventDetails(event: SessionEventType): string {
  const parts: string[] = [];
  if (event.slot_number != null) parts.push(`Slot ${event.slot_number}`);
  if (event.metadata != null) {
    const raw = JSON.stringify(event.metadata);
    parts.push(raw.length > 80 ? raw.slice(0, 80) + "…" : raw);
  }
  return parts.join(" · ") || "—";
}

function PathBadge({ path }: { path: string | null }) {
  const p = path ?? "unrouted";
  if (p === "policy")
    return (
      <span className="rounded bg-[#1B2A4A] px-2 py-0.5 text-xs text-white">
        policy
      </span>
    );
  if (p === "product")
    return (
      <span className="rounded bg-[#2D5016] px-2 py-0.5 text-xs text-white">
        product
      </span>
    );
  return (
    <span className="rounded bg-[#E5E7EB] px-2 py-0.5 text-xs text-[#6B7280]">
      unrouted
    </span>
  );
}

function StatusBadge({ session }: { session: RecentSessionType }) {
  if (session.published)
    return (
      <span className="rounded bg-[#D1FAE5] px-2 py-0.5 text-xs font-medium text-[#065F46]">
        Published
      </span>
    );
  if (session.completed)
    return (
      <span className="rounded bg-[#DBEAFE] px-2 py-0.5 text-xs font-medium text-[#1E40AF]">
        Completed
      </span>
    );
  if (session.abandoned_at_slot != null)
    return (
      <span className="rounded bg-[#FEE2E2] px-2 py-0.5 text-xs font-medium text-[#991B1B]">
        Abandoned
      </span>
    );
  return (
    <span className="rounded bg-[#E5E7EB] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
      In Progress
    </span>
  );
}

type GetEventsFn = (sessionId: string) => Promise<SessionEventType[]>;

export function RecentSessions({
  sessions,
  getEvents,
}: {
  sessions: RecentSessionType[];
  getEvents: GetEventsFn;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [events, setEvents] = useState<SessionEventType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRowClick = useCallback(
    async (sessionId: string) => {
      if (expandedId === sessionId) {
        setExpandedId(null);
        setEvents(null);
        setError(null);
        return;
      }
      setExpandedId(sessionId);
      setEvents(null);
      setError(null);
      setLoading(true);
      try {
        const result = await getEvents(sessionId);
        setEvents(result);
      } catch {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    },
    [expandedId, getEvents]
  );

  const baseCreatedAt = events != null && events.length > 0 ? events[0].created_at : null;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Time
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Path
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Slots
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Turns
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Duration
            </th>
            <th className="border-b border-[#E5E7EB] pb-2 text-left text-xs font-medium uppercase tracking-widest text-[#6B7280]">
              Status
            </th>
            <th className="w-10 border-b border-[#E5E7EB] pb-2" />
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <Fragment key={session.session_id}>
              <tr
                key={session.session_id}
                className="cursor-pointer even:bg-[#FAF8F3] odd:bg-white hover:opacity-90"
                onClick={() => handleRowClick(session.session_id)}
              >
                <td className="border-b border-[#E5E7EB] px-3 py-3 text-[#1B2A4A]">
                  {formatSessionTime(session.created_at)}
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3">
                  <PathBadge path={session.path} />
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3 font-mono text-[#1B2A4A] tabular-nums">
                  {session.slots_filled} / 7
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3 font-mono text-[#1B2A4A] tabular-nums">
                  {session.total_turns > 0 ? session.total_turns : "—"}
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3 text-[#1B2A4A]">
                  {formatDuration(session.session_duration_seconds)}
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3">
                  <StatusBadge session={session} />
                </td>
                <td className="border-b border-[#E5E7EB] px-3 py-3">
                  {expandedId === session.session_id ? (
                    <ChevronUp className="h-4 w-4 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                  )}
                </td>
              </tr>
              {expandedId === session.session_id && (
                <tr className="even:bg-[#FAF8F3] odd:bg-white">
                  <td colSpan={7} className="border-b border-[#E5E7EB] px-3 py-3">
                    {loading && (
                      <p className="py-2 text-sm italic text-[#6B7280]">
                        Loading events...
                      </p>
                    )}
                    {error && !loading && (
                      <p className="py-2 text-sm text-red-600">{error}</p>
                    )}
                    {events != null && !loading && (
                      <div className="ml-4 mt-2 space-y-1">
                        {events.map((evt) => (
                          <div
                            key={evt.id}
                            className="flex gap-4 text-sm"
                          >
                            <span className="w-16 shrink-0 font-mono text-[#6B7280] tabular-nums">
                              {baseCreatedAt
                                ? formatEventOffset(evt.created_at, baseCreatedAt)
                                : "+0s"}
                            </span>
                            <span className="font-mono text-xs text-[#6B7280]">
                              {evt.event_type}
                            </span>
                            <span className="min-w-0 truncate text-[#1B2A4A]">
                              {formatEventDetails(evt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
