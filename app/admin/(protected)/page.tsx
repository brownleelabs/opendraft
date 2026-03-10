import {
  getOverviewStats,
  getDropOffFunnel,
  getSlotDifficulty,
  getPathDistribution,
  getFeedHealth,
  getRecentSessions,
} from "@/lib/analytics";
import { OverviewStats } from "@/components/admin/OverviewStats";
import { DropOffFunnel } from "@/components/admin/DropOffFunnel";

const sectionHeaderClass =
  "mb-4 border-b border-[#E5E7EB] pb-2 text-xs font-medium uppercase tracking-widest text-[#1B2A4A]";

export default async function AdminDashboardPage() {
  const [overviewStats, funnelStages, slotDifficulty, pathDistribution, feedHealth, recentSessions] =
    await Promise.all([
      getOverviewStats(),
      getDropOffFunnel(),
      getSlotDifficulty(),
      getPathDistribution(),
      getFeedHealth(),
      getRecentSessions(20),
    ]);

  return (
    <>
      <p className="mb-6 text-[#6B7280]">Data as of {new Date().toISOString()}</p>

      <h2 className={sectionHeaderClass}>OVERVIEW</h2>
      <OverviewStats stats={overviewStats} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>DROP-OFF FUNNEL</h2>
      <DropOffFunnel stages={funnelStages} />
    </>
  );
}
