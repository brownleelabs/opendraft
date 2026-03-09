"use client";

import { PolicyDraftTemplate } from "@/components/output/PolicyDraftTemplate";
import { ProductDraftTemplate } from "@/components/output/ProductDraftTemplate";
import type { GoalTreeState } from "@/types";

export interface DraftDocumentProps {
  state: GoalTreeState;
  allFilled: boolean;
}

/**
 * Orchestration component: renders the correct draft template when all 7 slots
 * are confirmed. Renders nothing until then. Formatter, not author — content
 * comes from state only.
 */
export function DraftDocument({ state, allFilled }: DraftDocumentProps) {
  if (!allFilled) return null;

  const s = state.slots;
  const slot1 = s.slot1.content ?? "";
  const slot2 = s.slot2.content ?? "";
  const slot3 = s.slot3.content ?? "";
  const slot4 = s.slot4.content ?? "";
  const slot5 = s.slot5.content ?? "";
  const slot6 = s.slot6.content ?? "";
  const slot7 = s.slot7.content ?? "";

  if (state.path === "policy") {
    return (
      <PolicyDraftTemplate
        slot1={slot1}
        slot2={slot2}
        slot3={slot3}
        slot4={slot4}
        slot5={slot5}
        slot6={slot6}
        slot7={slot7}
      />
    );
  }

  if (state.path === "product") {
    return (
      <ProductDraftTemplate
        slot1={slot1}
        slot2={slot2}
        slot3={slot3}
        slot4={slot4}
        slot5={slot5}
        slot6={slot6}
        slot7={slot7}
      />
    );
  }

  return null;
}
