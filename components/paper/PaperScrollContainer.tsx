"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface PaperScrollContainerProps {
  children: ReactNode;
}

/**
 * Wraps content inside Paper. overflow-y: scroll — content grows inside,
 * outer Paper container does not. Auto-scrolls to bottom when content changes.
 * Fills 100% height and width of Paper.
 */
export function PaperScrollContainer({ children }: PaperScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [children]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-scroll"
      role="region"
      aria-label="Scrollable draft content"
    >
      {children}
    </div>
  );
}
