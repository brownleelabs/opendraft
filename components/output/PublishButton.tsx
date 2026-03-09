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
      className="w-full rounded-md bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90"
    >
      {isPublishing ? "Publishing..." : "PUBLISH DRAFT"}
    </Button>
  );
}
