"use client";

import { Button } from "@/components/ui/button";

export interface PublishButtonProps {
  allFilled: boolean;
  onPublish: () => void;
  isPublishing: boolean;
}

/**
 * Appears below the paper when all 7 slots are confirmed. Tapping triggers the publish flow.
 * Hidden when allFilled is false.
 */
export function PublishButton({
  allFilled,
  onPublish,
  isPublishing,
}: PublishButtonProps) {
  if (!allFilled) return null;

  return (
    <Button
      type="button"
      onClick={onPublish}
      disabled={isPublishing}
      className="min-h-[44px] w-full rounded-md bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90 transition-transform duration-100 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
    >
      {isPublishing ? "Publishing..." : "PUBLISH DRAFT"}
    </Button>
  );
}
