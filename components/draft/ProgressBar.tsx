"use client";

export interface ProgressBarProps {
  slotsFilledCount: number;
  path: "policy" | "product" | "unrouted" | null;
}

export function ProgressBar({ slotsFilledCount, path }: ProgressBarProps) {
  if (slotsFilledCount === 0) return null;

  const n = slotsFilledCount;
  const pathLabel = path === "policy" ? "POLICY" : path === "product" ? "PRODUCT" : null;
  const percent = Math.round((n / 7) * 100);

  return (
    <div
      className="flex h-12 w-full flex-row items-center justify-between gap-4 border-b border-[#E8E3D8] bg-white px-4"
      role="status"
      aria-label={`Draft progress: ${n} of 7 slots filled`}
    >
      <div className="flex flex-row items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const filled = i < n;
          const current = n < 7 ? i === n : i === 7;
          return (
            <div
              key={i}
              className={`h-[3px] w-6 rounded-[2px] ${current ? "animate-pulse" : ""}`}
              style={{
                backgroundColor: filled
                  ? "#2D5016"
                  : current
                    ? "rgba(45, 80, 22, 0.3)"
                    : "#E5E7EB",
              }}
              aria-hidden
            />
          );
        })}
      </div>
      <div className="flex flex-1 flex-row items-center justify-center gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#6B7280]">
          {n < 7 ? `Slot ${n} of 7${pathLabel ? " ·" : ""}` : "Complete · Ready to publish"}
        </span>
        {pathLabel && n < 7 && (
          <span
            className="rounded-sm px-2 py-0.5 font-sans text-xs font-semibold text-white"
            style={{
              backgroundColor: path === "policy" ? "#1B2A4A" : "#2D5016",
            }}
          >
            {pathLabel}
          </span>
        )}
      </div>
      <span className="font-mono text-xs text-[#9CA3AF]">{percent}%</span>
    </div>
  );
}
