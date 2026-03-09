import type { ReactNode } from "react";

interface PaperProps {
  children: ReactNode;
}

/**
 * Central visual metaphor: a fixed-height document surface. White, subtle border
 * and shadow, slight rounded corners. Does not grow or shrink. Content scrolls
 * inside it (scroll behavior in PaperScrollContainer). Mobile: 16px horizontal
 * margin. Desktop: centered, max-width constrained.
 */
export function Paper({ children }: PaperProps) {
  return (
    <div
      className="mx-4 h-[calc(100dvh-3.5rem)] max-w-3xl shrink-0 overflow-clip rounded-lg border border-[#E5E5E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:mx-auto"
      role="article"
      aria-label="Draft document"
    >
      {children}
    </div>
  );
}
