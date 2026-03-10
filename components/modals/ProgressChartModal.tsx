"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface ProgressChartModalProps {
  open: boolean;
  onClose: () => void;
  filledCount: number; // 0-7
  percentComplete: number; // 0-100
  path: "policy" | "product" | "unrouted";
}

function getEncouragement(percentComplete: number): string {
  if (percentComplete === 0) {
    return "Your draft has 7 sections. As you answer the questions above, we fill each section. When all 7 are complete, you can publish your draft.";
  }
  if (percentComplete <= 42) {
    return "Good start. Keep answering the questions.";
  }
  if (percentComplete <= 85) {
    return "More than halfway there.";
  }
  if (percentComplete < 100) {
    return "Almost complete.";
  }
  return "All sections filled. Ready to publish.";
}

export function ProgressChartModal({
  open,
  onClose,
  filledCount,
  percentComplete,
}: ProgressChartModalProps) {
  const encouragement = getEncouragement(percentComplete);

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="text-[#1B2A4A]">Draft Progress</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-4 px-4 pb-6">
          <p
            className="font-serif text-3xl font-medium text-[#1B2A4A]"
            aria-live="polite"
          >
            {percentComplete}%
          </p>
          <p className="text-sm text-[#1B2A4A]/80">
            {filledCount} of 7 sections complete
          </p>
          <div className="h-2 w-full overflow-hidden rounded-sm bg-[#FAF8F3]">
            <div
              className="h-full bg-[#1B2A4A] transition-[width] duration-200"
              style={{ width: `${percentComplete}%` }}
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-center text-sm text-[#1B2A4A]/80">
            {encouragement}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
