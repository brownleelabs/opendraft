"use client";

import { Brain } from "lucide-react";

export interface MemoryButtonProps {
  onTap: () => void;
  activeSlots: number; // 0-7, how many slots are filled
}

export function MemoryButton({ onTap, activeSlots }: MemoryButtonProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex h-5 w-5 items-center justify-center border-0 bg-transparent p-0 text-[#1B2A4A]"
      aria-label="View goal tree"
    >
      {activeSlots > 0 && (
        <span
          className="absolute -top-0.5 right-0 h-1.5 w-1.5 rounded-full bg-[#1B2A4A]"
          aria-hidden
        />
      )}
      <Brain className="h-5 w-5" />
    </button>
  );
}
