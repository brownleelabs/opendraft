"use client";

import { useMemo } from "react";
import type { GoalTreeState, SlotStatus } from "@/types";

const SLOT_KEYS = [
  "slot1",
  "slot2",
  "slot3",
  "slot4",
  "slot5",
  "slot6",
  "slot7",
] as const;

const TOTAL_SLOTS = 7;

export function useSlotTracker(state: GoalTreeState) {
  return useMemo(() => {
    const slotStatuses: SlotStatus[] = SLOT_KEYS.map((key) => state.slots[key]);
    const filledCount = slotStatuses.filter(
      (s) => s.status === "filled"
    ).length;
    const percentComplete = Math.round((filledCount / TOTAL_SLOTS) * 100);

    let currentSlot = TOTAL_SLOTS;
    for (let i = 0; i < slotStatuses.length; i++) {
      if (
        slotStatuses[i].status === "empty" ||
        slotStatuses[i].status === "partial"
      ) {
        currentSlot = i + 1;
        break;
      }
    }

    return {
      filledCount,
      totalSlots: TOTAL_SLOTS,
      percentComplete,
      currentSlot,
      allFilled: filledCount === TOTAL_SLOTS,
      slotStatuses,
    };
  }, [state]);
}
