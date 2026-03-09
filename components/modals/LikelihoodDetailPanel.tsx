"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface LikelihoodDetailPanelProps {
  open: boolean;
  onClose: () => void;
  score: number;
  path: "policy" | "product" | "unrouted";
}

const FACTORS = [
  "Specificity of the problem statement",
  "Existence of precedent or prior attempts",
  "Named opposition and coalition",
  "Clarity of the mechanism or feature request",
] as const;

export function LikelihoodDetailPanel({
  open,
  onClose,
  score,
}: LikelihoodDetailPanelProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="text-[#1B2A4A]">Likelihood Score</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <p
            className="text-center font-serif text-3xl font-medium text-[#1B2A4A]"
            aria-live="polite"
          >
            {score}%
          </p>
          <p className="text-sm text-[#1B2A4A]/90">
            This estimates the probability that your draft will be acted on,
            based on specificity, precedent, and political or market conditions.
          </p>
          <div className="border-t border-[#E5E5E5]" />
          <div>
            <p className="mb-2 text-sm font-medium text-[#1B2A4A]">
              What affects this score:
            </p>
            <ul className="flex flex-col gap-1.5">
              {FACTORS.map((factor, i) => (
                <li
                  key={i}
                  className="text-sm text-[#1B2A4A]/80"
                >
                  {factor}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-500">
            Score updates as you answer more questions.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
