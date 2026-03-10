import type { PathDistribution as PathDistributionType } from "@/types/analytics";

export function PathDistribution({
  distribution,
}: {
  distribution: PathDistributionType;
}) {
  const { policy_count, product_count, unrouted_count, policy_pct, product_pct, unrouted_pct } =
    distribution;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="font-serif text-3xl text-[#1B2A4A]">{policy_count}</div>
          <div className="mt-1 text-sm text-[#6B7280]">{policy_pct.toFixed(1)}%</div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            POLICY
          </div>
        </div>
        <div>
          <div className="font-serif text-3xl text-[#1B2A4A]">{product_count}</div>
          <div className="mt-1 text-sm text-[#6B7280]">{product_pct.toFixed(1)}%</div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-widest text-[#6B7280]">
            PRODUCT
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-[#6B7280]">
          Unrouted / Abandoned Before Routing
        </div>
        <div className="font-mono text-[#1B2A4A] tabular-nums">
          {unrouted_count} ({unrouted_pct.toFixed(1)}%)
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex h-2 w-full overflow-hidden rounded">
          <div
            className="bg-[#2D5016]"
            style={{ width: `${policy_pct}%` }}
          />
          <div
            className="bg-[#1B2A4A]"
            style={{ width: `${product_pct}%` }}
          />
          <div
            className="bg-[#E5E7EB]"
            style={{ width: `${unrouted_pct}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#2D5016]" />
            Policy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#1B2A4A]" />
            Product
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#E5E7EB]" />
            Unrouted
          </span>
        </div>
      </div>
    </div>
  );
}
