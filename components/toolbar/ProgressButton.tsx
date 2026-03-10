"use client";

import { BarChart2 } from "lucide-react";

export interface ProgressButtonProps {
  onTap: () => void;
  percentComplete: number; // 0-100
}

export function ProgressButton({ onTap, percentComplete }: ProgressButtonProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-md border-0 bg-transparent p-0 text-[#1B2A4A] transition-transform duration-100 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
      aria-label={`View draft progress, ${percentComplete}% complete`}
    >
      <BarChart2 className="h-5 w-5 shrink-0" />
      <div className="h-0.5 w-5 overflow-hidden rounded-sm bg-[#FAF8F3]">
        <div
          className="h-full bg-[#1B2A4A] transition-[width] duration-150"
          style={{ width: `${percentComplete}%` }}
          aria-hidden
        />
      </div>
    </button>
  );
}
