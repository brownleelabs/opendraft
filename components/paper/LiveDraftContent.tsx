"use client";

import type { GoalTreeState } from "@/types";

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

export interface LiveDraftContentProps {
  state: GoalTreeState;
  path: "policy" | "product" | "unrouted";
}

function getSlotLabel(path: LiveDraftContentProps["path"], index: number): string {
  if (path === "policy") return POLICY_SLOT_NAMES[index];
  if (path === "product") return PRODUCT_SLOT_NAMES[index];
  return "";
}

/**
 * Live preview of confirmed slot content inside the paper during conversation.
 * Renders only filled or partial slots as labeled sections. Empty slots and
 * unrouted path render nothing.
 */
export function LiveDraftContent({ state, path }: LiveDraftContentProps) {
  if (path === "unrouted") return null;

  const sections: { label: string; content: string }[] = [];

  SLOT_KEYS.forEach((key, index) => {
    const slot = state.slots[key];
    if (
      (slot.status === "filled" || slot.status === "partial") &&
      slot.content !== null &&
      slot.content.trim() !== ""
    ) {
      sections.push({
        label: getSlotLabel(path, index),
        content: slot.content,
      });
    }
  });

  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 font-serif">
      {sections.map(({ label, content }, i) => (
        <div key={i}>
          <div
            className="text-xs font-medium uppercase tracking-wide text-[#2D5016]"
            aria-label={label}
          >
            {label}
          </div>
          <p className="mt-1 text-[#1B2A4A]">{content}</p>
          {i < sections.length - 1 && (
            <div
              className="mt-4 border-b border-[#E5E5E5]"
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}
