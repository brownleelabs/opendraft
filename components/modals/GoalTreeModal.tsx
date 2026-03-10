"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { GoalTreeState } from "@/types";

export interface GoalTreeModalProps {
  open: boolean;
  onClose: () => void;
  state: GoalTreeState;
  path: "policy" | "product" | "unrouted";
}

const POLICY_SLOT_NAMES = [
  "Specific Harm",
  "The Gap and Consequences",
  "Proposed Mechanism",
  "Enforcement",
  "Jurisdiction",
  "Precedent and Fiscal Note",
  "Political Landscape",
] as const;

const PRODUCT_SLOT_NAMES = [
  "User Pain and Evidence",
  "User Story and Happy Path",
  "Specific Feature",
  "Target Company and Success Metric",
  "Existing Landscape",
  "Value Proposition and OKR Alignment",
  "Risks and Non-Goals",
] as const;

const SLOT_KEYS = [
  "slot1",
  "slot2",
  "slot3",
  "slot4",
  "slot5",
  "slot6",
  "slot7",
] as const;

function getSlotLabel(path: GoalTreeModalProps["path"], index: number): string {
  if (path === "policy") return POLICY_SLOT_NAMES[index];
  if (path === "product") return PRODUCT_SLOT_NAMES[index];
  return `Slot ${index + 1}`;
}

function truncatePreview(content: string | null, maxLength: number): string {
  if (!content || content.length <= maxLength) return content ?? "";
  return `${content.slice(0, maxLength)}...`;
}

function SlotStatusDot({
  status,
}: {
  status: "empty" | "partial" | "filled";
}) {
  if (status === "filled") {
    return (
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-[#1B2A4A]"
        aria-hidden
      />
    );
  }
  if (status === "partial") {
    return (
      <span
        className="relative h-2 w-2 shrink-0 rounded-full border-2 border-[#1B2A4A]"
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full bg-[#1B2A4A] [clip-path:inset(0_50%_0_0)]" />
      </span>
    );
  }
  return (
    <span
      className="h-2 w-2 shrink-0 rounded-full border-2 border-[#1B2A4A] bg-transparent"
      aria-hidden
    />
  );
}

export function GoalTreeModal({
  open,
  onClose,
  state,
  path,
}: GoalTreeModalProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-[#1B2A4A]">
            Your Draft So Far
          </SheetTitle>
        </SheetHeader>
        <p className="px-4 text-sm text-[#1B2A4A]/80">
          These 7 sections are what we&apos;re filling in as you answer. Each
          one becomes part of your final draft.
        </p>
        <div className="flex flex-col gap-3 px-4 pb-6">
          {SLOT_KEYS.map((key, index) => {
            const slot = state.slots[key];
            const label = getSlotLabel(path, index);
            const preview =
              slot.content !== null
                ? truncatePreview(slot.content, 60)
                : null;

            return (
              <div
                key={key}
                className="flex flex-col gap-1 border-b border-[#E5E5E5] pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <SlotStatusDot status={slot.status} />
                  <span className="text-sm font-medium text-[#1B2A4A]">
                    {label}
                  </span>
                </div>
                {preview && (
                  <p className="pl-4 text-sm text-[#1B2A4A]/80">{preview}</p>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
