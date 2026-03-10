import type { OverviewStats as OverviewStatsType } from "@/types/analytics";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export function OverviewStats({ stats }: { stats: OverviewStatsType }) {
  const completionPct = Math.round(stats.completion_rate * 100);
  const publishPct = Math.round(stats.publish_rate * 100);

  const cards = [
    { label: "Sessions (7d)", value: String(stats.sessions_last_7_days) },
    { label: "Total Sessions", value: String(stats.total_sessions) },
    { label: "Completion Rate", value: `${completionPct}%` },
    { label: "Publish Rate", value: `${publishPct}%` },
    { label: "Avg Duration", value: formatDuration(stats.avg_session_duration_seconds) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-sm border border-[#E5E7EB] bg-white p-5"
        >
          <div className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            {card.label}
          </div>
          <div className="mt-2 font-serif text-2xl text-[#1B2A4A]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
