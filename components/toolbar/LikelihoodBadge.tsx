"use client";

import { Badge } from "@/components/ui/badge";

export interface LikelihoodBadgeProps {
  score: number; // 0-100
  visible: boolean; // false until slot 1 filled
  onTap?: () => void; // opens LikelihoodDetailPanel
}

export function LikelihoodBadge({ score, visible, onTap }: LikelihoodBadgeProps) {
  if (!visible) {
    return null;
  }

  const content = (
    <Badge className="bg-[#1B2A4A] text-white">{`${score}% likely`}</Badge>
  );

  if (onTap) {
    return (
      <button
        type="button"
        onClick={onTap}
        className="cursor-pointer border-0 bg-transparent p-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md transition-transform duration-100 hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
        aria-label={`Likelihood score ${score}%. Tap for details.`}
      >
        {content}
      </button>
    );
  }

  return content;
}
