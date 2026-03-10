import type { DropOffFunnelStage as DropOffFunnelStageType, DropOffFunnelStageName } from "@/types/analytics";

function stageLabel(stage: DropOffFunnelStageName): string {
  const labels: Record<DropOffFunnelStageName, string> = {
    started: "Session Started",
    routed: "Path Routed",
    slot_1: "Slot 1 Filled",
    slot_3: "Slot 3 Filled",
    slot_5: "Slot 5 Filled",
    slot_7: "Slot 7 Filled",
    completed: "Session Completed",
    published: "Draft Published",
  };
  return labels[stage];
}

export function DropOffFunnel({ stages }: { stages: DropOffFunnelStageType[] }) {
  const maxCount = stages[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      {stages.map((row, i) => {
        const prevCount = i > 0 ? stages[i - 1].count : null;
        const dropPct =
          prevCount !== null && prevCount > 0
            ? Math.round(((prevCount - row.count) / prevCount) * 100)
            : null;
        const barWidthPct = maxCount > 0 ? (row.count / maxCount) * 100 : 0;

        return (
          <div key={row.stage} className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[#1B2A4A]">{stageLabel(row.stage)}</span>
              <span className="font-mono text-right text-[#1B2A4A] tabular-nums">
                {row.count}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded bg-[#E5E7EB]">
              <div
                className="h-full rounded bg-[#2D5016]/20"
                style={{ width: `${barWidthPct}%` }}
              />
            </div>
            {row.stage !== "started" && dropPct !== null && (
              <p className="text-xs text-[#6B7280]">
                ↓ {dropPct}% from previous
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
