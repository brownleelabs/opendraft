export type SlotStatus = {
  status: "empty" | "partial" | "filled";
  content: string | null;
};

export interface GoalTreeState {
  phase: 1 | 2 | 3 | 4;
  path: "policy" | "product" | "unrouted";
  slots: {
    slot1: SlotStatus;
    slot2: SlotStatus;
    slot3: SlotStatus;
    slot4: SlotStatus;
    slot5: SlotStatus;
    slot6: SlotStatus;
    slot7: SlotStatus;
  };
  existenceCheck: {
    status:
      | "pending"
      | "clear"
      | "identical"
      | "precedent"
      | "failed_attempt"
      | "competitor_only";
    detail: string | null;
    requiresUserResponse: boolean;
  };
  lastUnderstood: string;
  nextQuestion: string;
}

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type DraftPath = "policy" | "product" | "unrouted";

export type ConversationPhase = 1 | 2 | 3 | 4;
