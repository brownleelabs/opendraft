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
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-label={`Likelihood score ${score}%`}
      >
        {content}
      </button>
    );
  }

  return content;
}
