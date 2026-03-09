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
      className="flex w-5 flex-col items-center gap-0.5 border-0 bg-transparent p-0 text-[#1B2A4A]"
      aria-label="View draft progress"
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
