import type { ReactNode } from "react";

interface PaperProps {
  children: ReactNode;
  /** default = full height (draft page); compact = reduced height so CTA is above the fold (home) */
  variant?: "default" | "compact";
  /** when true, runs a brief background pulse (e.g. when a slot fills) */
  pulse?: boolean;
}

/**
 * Central visual metaphor: a fixed-height document surface. White, subtle border
 * and shadow, slight rounded corners. Does not grow or shrink. Content scrolls
 * inside it (scroll behavior in PaperScrollContainer). Mobile: 16px horizontal
 * margin. Desktop: centered, max-width constrained.
 */
export function Paper({ children, variant = "default", pulse = false }: PaperProps) {
  const heightClass =
    variant === "compact"
      ? "min-h-[40vh] h-[45vh]"
      : "h-[calc(100dvh-3.5rem)]";

  return (
    <div
      className={`mx-4 max-w-3xl shrink-0 overflow-clip rounded-[2px] border border-[#E8E3D8] bg-[#FAF8F3] shadow-[0_4px_24px_rgba(27,42,74,0.08)] md:mx-auto ${heightClass} ${pulse ? "paper-pulse" : ""}`}
      role="article"
      aria-label="Draft document"
    >
      {children}
    </div>
  );
}
