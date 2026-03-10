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
      className="relative flex h-8 w-8 items-center justify-center -m-1.5 rounded-md border-0 bg-transparent p-0 text-[#1B2A4A] transition-transform duration-100 hover:opacity-90 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
