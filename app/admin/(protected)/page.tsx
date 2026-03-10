import {
  getOverviewStats,
  getDropOffFunnel,
  getSlotDifficulty,
  getPathDistribution,
  getFeedHealth,
  getRecentSessions,
} from "@/lib/analytics";

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

  const data = {
    overviewStats,
    funnelStages,
    slotDifficulty,
    pathDistribution,
    feedHealth,
    recentSessions,
  };

  return (
    <>
      <p className="mb-4 text-[#6B7280]">Data as of {new Date().toISOString()}</p>
      <pre className="overflow-auto rounded border border-[#E5E7EB] bg-[#FAF8F3] p-4 text-sm text-[#1B2A4A]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  );
}
