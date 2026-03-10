import { cookies } from "next/headers";
import {
  getOverviewStats,
  getDropOffFunnel,
  getSlotDifficulty,
  getPathDistribution,
  getFeedHealth,
  getRecentSessions,
} from "@/lib/analytics";
import type { DropOffFunnelStageName } from "@/types/analytics";

const SLOT_NAMES: Record<number, string> = {
  1: "Specific Harm / User Pain",
  2: "The Gap / User Story",
  3: "Mechanism / Specific Feature",
  4: "Enforcement / Target Company",
  5: "Jurisdiction / Existing Landscape",
  6: "Precedent / Value Prop",
  7: "Political Landscape / Risks",
};

const STAGE_LABELS: Record<DropOffFunnelStageName, string> = {
  started: "started",
  routed: "routed",
  slot_1: "slot_1",
  slot_3: "slot_3",
  slot_5: "slot_5",
  slot_7: "slot_7",
  completed: "completed",
  published: "published",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

function difficultyLabel(slotNumber: number, dropRate: number | null): string {
  if (slotNumber === 1 || dropRate === null) return "—";
  const pct = dropRate * 100;
  if (pct < 10) return "Easy";
  if (pct <= 30) return "Moderate";
  return "Hard";
}

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_authenticated")?.value;
  if (auth !== "true") {
    return new Response(null, { status: 401 });
  }

  const [
    overviewStats,
    funnelStages,
    slotDifficulty,
    pathDistribution,
    feedHealth,
    _recentSessions,
  ] = await Promise.all([
    getOverviewStats(),
    getDropOffFunnel(),
    getSlotDifficulty(),
    getPathDistribution(),
    getFeedHealth(),
    getRecentSessions(20),
  ]);

  const completionPct = Math.round(overviewStats.completion_rate * 100);
  const publishPct = Math.round(overviewStats.publish_rate * 100);

  const dropOffLines: string[] = [];
  for (let i = 0; i < funnelStages.length; i++) {
    const stage = funnelStages[i];
    const prevCount = i > 0 ? funnelStages[i - 1].count : null;
    const dropPct =
      prevCount !== null && prevCount > 0
        ? Math.round(((prevCount - stage.count) / prevCount) * 100)
        : null;
    const dropStr =
      dropPct !== null ? ` (${dropPct}% drop from previous)` : "";
    dropOffLines.push(`  ${STAGE_LABELS[stage.stage]}: ${stage.count}${dropStr}`);
  }

  const slotLines: string[] = [];
  for (const row of slotDifficulty) {
    const dropPctStr =
      row.drop_rate !== null ? `${Math.round(row.drop_rate * 100)}%` : "—";
    const diff = difficultyLabel(row.slot_number, row.drop_rate);
    slotLines.push(
      `  Slot ${row.slot_number} (${SLOT_NAMES[row.slot_number] ?? `Slot ${row.slot_number}`}): ${row.fill_count} fills, ${dropPctStr} drop — ${diff}`
    );
  }

  const slotsWithDrop = slotDifficulty.filter(
    (s) => s.slot_number !== 1 && s.drop_rate !== null
  );
  const hardest =
    slotsWithDrop.length > 0
      ? slotsWithDrop.reduce((a, b) =>
          (a.drop_rate ?? 0) > (b.drop_rate ?? 0) ? a : b
        )
      : null;
  const hardestLine =
    hardest != null && hardest.drop_rate != null
      ? `Hardest slot: Slot ${hardest.slot_number} (${SLOT_NAMES[hardest.slot_number] ?? `Slot ${hardest.slot_number}`}) with ${Math.round(hardest.drop_rate * 100)}% drop rate`
      : "Hardest slot: —";

  const avgUpvotesStr =
    feedHealth.avg_upvotes !== null
      ? feedHealth.avg_upvotes.toFixed(1)
      : "—";

  const focusBullets: string[] = [];
  if (hardest != null && hardest.drop_rate != null && hardest.drop_rate > 0.3) {
    const name = SLOT_NAMES[hardest.slot_number] ?? `Slot ${hardest.slot_number}`;
    focusBullets.push(
      `- Slot ${hardest.slot_number} has ${Math.round(hardest.drop_rate * 100)}% drop rate — review question framing for ${name}`
    );
  }
  if (pathDistribution.unrouted_pct > 20) {
    focusBullets.push(
      `- High unrouted rate (${pathDistribution.unrouted_pct.toFixed(0)}%) — review path routing logic`
    );
  }
  if (overviewStats.completion_rate < 0.3) {
    focusBullets.push(
      `- Low completion rate (${completionPct}%) — consider reducing friction in early slots`
    );
  }
  if (overviewStats.publish_rate < 0.2) {
    focusBullets.push(
      `- Low publish rate (${publishPct}%) — review completion experience and publish CTA`
    );
  }
  focusBullets.push(
    `- Drop this report into Cursor with: 'Based on this data, propose targeted changes to opendraft-system-prompt-v1.md'`
  );

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const iso = now.toISOString();

  const report = `OPENDRAFT WEEKLY REPORT
Generated: ${iso}
Period: Last 7 days
─────────────────────────────────────────

EXECUTIVE SUMMARY
Sessions (7d): ${overviewStats.sessions_last_7_days}
Completion Rate: ${completionPct}%
Publish Rate: ${publishPct}%
Avg Session Duration: ${formatDuration(overviewStats.avg_session_duration_seconds)}

DROP-OFF ANALYSIS
${dropOffLines.join("\n")}

SLOT DIFFICULTY
${slotLines.join("\n")}
${hardestLine}

PATH DISTRIBUTION
Policy: ${pathDistribution.policy_count} (${pathDistribution.policy_pct.toFixed(1)}%)
Product: ${pathDistribution.product_count} (${pathDistribution.product_pct.toFixed(1)}%)
Unrouted/Abandoned: ${pathDistribution.unrouted_count} (${pathDistribution.unrouted_pct.toFixed(1)}%)

FEED HEALTH
Total Published: ${feedHealth.total_published}
Policy/Product Split: ${feedHealth.policy_published} / ${feedHealth.product_published}
Avg Upvotes: ${avgUpvotesStr}
Drafts with Votes: ${feedHealth.drafts_with_votes}

RECOMMENDED FOCUS AREAS FOR SYSTEM PROMPT REVIEW
${focusBullets.join("\n")}

─────────────────────────────────────────
END OF REPORT
`;

  return new Response(report, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="opendraft-report-${dateStr}.txt"`,
    },
  });
}
