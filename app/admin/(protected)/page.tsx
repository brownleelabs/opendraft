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
import { SlotDifficulty } from "@/components/admin/SlotDifficulty";
import { PathDistribution } from "@/components/admin/PathDistribution";
import { FeedHealth } from "@/components/admin/FeedHealth";
import { RecentSessions } from "@/components/admin/RecentSessions";
import { fetchSessionEvents } from "@/app/admin/actions";

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
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[#6B7280]">Data as of {new Date().toISOString()}</p>
        <a
          href="/api/admin/report"
          className="bg-[#1B2A4A] px-3 py-1.5 text-sm text-white hover:opacity-90"
        >
          Download Weekly Report ↓
        </a>
      </div>

      <h2 className={sectionHeaderClass}>OVERVIEW</h2>
      <OverviewStats stats={overviewStats} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>DROP-OFF FUNNEL</h2>
      <DropOffFunnel stages={funnelStages} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>SLOT DIFFICULTY</h2>
      <SlotDifficulty slots={slotDifficulty} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>PATH DISTRIBUTION</h2>
      <PathDistribution distribution={pathDistribution} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>FEED HEALTH</h2>
      <FeedHealth health={feedHealth} />

      <h2 className={`mt-10 ${sectionHeaderClass}`}>RECENT SESSIONS (LAST 20)</h2>
      <RecentSessions sessions={recentSessions} getEvents={fetchSessionEvents} />
    </>
  );
}
