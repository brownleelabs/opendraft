import type { FeedHealth as FeedHealthType } from "@/types/analytics";

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) === 1 ? "" : "s"} ago`;
}

export function FeedHealth({ health }: { health: FeedHealthType }) {
  const avgUpvotes =
    health.avg_upvotes !== null ? health.avg_upvotes.toFixed(1) : "—";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            Total Published
          </div>
          <div className="mt-2 font-serif text-2xl text-[#1B2A4A]">
            {health.total_published}
          </div>
        </div>
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            Policy / Product Split
          </div>
          <div className="mt-2 font-serif text-2xl text-[#1B2A4A]">
            {health.policy_published} Policy · {health.product_published} Product
          </div>
        </div>
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            Drafts With Votes
          </div>
          <div className="mt-2 font-serif text-2xl text-[#1B2A4A]">
            {health.drafts_with_votes}
          </div>
        </div>
        <div className="rounded-sm border border-[#E5E7EB] bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            Avg Upvotes
          </div>
          <div className="mt-2 font-serif text-2xl text-[#1B2A4A]">
            {avgUpvotes}
          </div>
        </div>
      </div>
      <p className="italic text-[#6B7280]">
        {health.most_recent_published_at
          ? `Most recent draft published ${formatRelativeTime(health.most_recent_published_at)}`
          : "No drafts published yet."}
      </p>
    </div>
  );
}
