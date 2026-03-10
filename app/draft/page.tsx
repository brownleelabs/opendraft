"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AIResponseBlock } from "@/components/conversation/AIResponseBlock";
import { InputField } from "@/components/conversation/InputField";
import { Paper } from "@/components/paper/Paper";
import { LiveDraftContent } from "@/components/paper/LiveDraftContent";
import { PaperLines } from "@/components/paper/PaperLines";
import { PaperOnboardingCopy } from "@/components/paper/PaperOnboardingCopy";
import { PaperScrollContainer } from "@/components/paper/PaperScrollContainer";
import { BottomNav } from "@/components/shell/BottomNav";
import { PaginationDots } from "@/components/shell/PaginationDots";
import { TopNav } from "@/components/shell/TopNav";
import { LikelihoodBadge } from "@/components/toolbar/LikelihoodBadge";
import { MemoryButton } from "@/components/toolbar/MemoryButton";
import { ProgressButton } from "@/components/toolbar/ProgressButton";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { User } from "lucide-react";
import { GoalTreeModal } from "@/components/modals/GoalTreeModal";
import { LikelihoodDetailPanel } from "@/components/modals/LikelihoodDetailPanel";
import { ProgressChartModal } from "@/components/modals/ProgressChartModal";
import { InfoModal } from "@/components/modals/InfoModal";
import { DraftDocument } from "@/components/output/DraftDocument";
import { PublishButton } from "@/components/output/PublishButton";
import { useSlotTracker } from "@/lib/slot-tracker";
import { logEvent, saveConversation } from "@/lib/supabase-client";
import type { ConversationMessage as ApiConversationMessage, GoalTreeState } from "@/types";

function getFormattedDocumentText(state: GoalTreeState): string {
  if (state.path !== "policy" && state.path !== "product") return "";
  const s = state.slots;
  const slot1 = s.slot1.content ?? "";
  const slot2 = s.slot2.content ?? "";
  const slot3 = s.slot3.content ?? "";
  const slot4 = s.slot4.content ?? "";
  const slot5 = s.slot5.content ?? "";
  const slot6 = s.slot6.content ?? "";
  const slot7 = s.slot7.content ?? "";
  if (state.path === "policy") {
    return [
      "DRAFT POLICY PROPOSAL",
      "",
      "I. Title & Summary",
      slot1,
      "",
      "II. The Problem (Findings)",
      slot1,
      slot2,
      "",
      "III. The Solution (Statutory Changes)",
      slot3,
      slot4,
      "",
      "IV. Impact & Feasibility",
      slot5,
      slot6,
      "",
      "V. Political Landscape",
      slot7,
      "",
      "Submitted by: Anonymous — OpenDraft",
    ].join("\n");
  }
  return [
    "DRAFT PRODUCT PROPOSAL",
    "",
    "I. Executive Summary",
    slot1,
    "",
    "II. The Problem Statement",
    slot1,
    "",
    "III. User Story & Happy Path",
    slot2,
    "",
    "IV. Functional Requirements",
    slot3,
    "",
    "V. Business Case",
    slot4,
    slot6,
    "",
    "VI. Landscape & Risk",
    slot5,
    slot7,
    "",
    "Submitted by: Anonymous — OpenDraft",
  ].join("\n");
}

const emptySlot = { status: "empty" as const, content: null };

const initialGoalTreeState: GoalTreeState = {
  phase: 1,
  path: "unrouted",
  slots: {
    slot1: { ...emptySlot },
    slot2: { ...emptySlot },
    slot3: { ...emptySlot },
    slot4: { ...emptySlot },
    slot5: { ...emptySlot },
    slot6: { ...emptySlot },
    slot7: { ...emptySlot },
  },
  existenceCheck: {
    status: "pending",
    detail: null,
    requiresUserResponse: false,
  },
  lastUnderstood: "",
  nextQuestion: "",
};

type MessageItem = { understood: string; question: string; userInput: string };

type ConversationMessage = { role: "user" | "assistant"; content: string };

const SLOT_KEYS = ["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "slot7"] as const;

function isValidSlotStatus(s: unknown): s is { status: string; content: unknown } {
  return (
    typeof s === "object" &&
    s !== null &&
    "status" in s &&
    typeof (s as { status: unknown }).status === "string" &&
    "content" in s
  );
}

function isValidGoalTreeState(state: unknown): state is GoalTreeState {
  if (typeof state !== "object" || state === null) return false;
  const o = state as Record<string, unknown>;
  if (!o.slots || typeof o.slots !== "object") return false;
  const slots = o.slots as Record<string, unknown>;
  for (const key of SLOT_KEYS) {
    if (!isValidSlotStatus(slots[key])) return false;
  }
  return true;
}

function isValidConversationResponse(data: unknown): data is {
  understood: string;
  question: string;
  updatedState: GoalTreeState;
  rawResponse: string;
} {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.understood === "string" &&
    typeof d.question === "string" &&
    typeof d.rawResponse === "string" &&
    isValidGoalTreeState(d.updatedState)
  );
}

export default function DraftPage() {
  const router = useRouter();
  // Session is per-tab, new on refresh. No server-side session cleanup in v1.
  const [sessionId] = useState(() => crypto.randomUUID());
  const [state, setState] = useState<GoalTreeState>(initialGoalTreeState);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [goalTreeOpen, setGoalTreeOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [likelihoodOpen, setLikelihoodOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likelihoodScore] = useState(24);
  const { filledCount, percentComplete, allFilled } = useSlotTracker(state);

  const handlePublish = useCallback(async () => {
    if (state.path !== "policy" && state.path !== "product") return;
    setIsPublishing(true);
    try {
      const formattedDocument = getFormattedDocumentText(state);
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          sessionId,
          path: state.path,
          formattedDocument,
        }),
      });
      const data = await res.json().catch(() => ({} as Record<string, unknown>));
      if (!res.ok) {
        const message =
          typeof data?.error === "string" ? data.error : "Publish failed";
        throw new Error(message);
      }
      if (typeof (data as { draftId?: unknown }).draftId !== "string") {
        console.error("Invalid publish response", data);
        throw new Error("Invalid publish response");
      }
      // Only after confirmed success — do not log or redirect before write succeeds
      logEvent(sessionId, "draft_published", { path: state.path });
      router.push("/feed");
    } catch {
      toast.error("Publish failed. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  }, [state, sessionId, router]);

  const handleSubmit = useCallback(
    async (input: string) => {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/conversation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, state, history }),
        });
        const data = await res.json().catch(() => ({} as { error?: string }));
        if (!res.ok) {
          const message =
            typeof data?.error === "string" ? data.error : res.statusText || "Conversation request failed";
          throw new Error(message);
        }
        if (!isValidConversationResponse(data)) {
          console.error("Invalid conversation response shape", data);
          toast.error("Something went wrong. Please try again.");
          return;
        }
        const { understood, question, updatedState, rawResponse } = data;
        setMessages((prev) => [...prev, { understood, question, userInput: input }]);
        setState(updatedState);
        const updatedHistory: ConversationMessage[] = [
          ...history,
          { role: "user", content: input },
          { role: "assistant", content: rawResponse },
        ];
        setHistory(updatedHistory);

        // Auto-save in background — do not await, do not block UI
        const now = Date.now();
        const historyForSave: ApiConversationMessage[] = [
          ...history.map((m) => ({ ...m, timestamp: now })),
          { role: "user", content: input, timestamp: now },
          { role: "assistant", content: rawResponse, timestamp: now },
        ];
        const pathToSave = updatedState.path === "unrouted" ? null : updatedState.path;
        console.log("[saveConversation] path being passed:", pathToSave);
        saveConversation(
          sessionId,
          updatedState,
          historyForSave,
          pathToSave
        ).catch((err) => console.error("Auto-save failed:", err));

        // Log session_started on first message only
        if (messages.length === 0) {
          logEvent(sessionId, "session_started", {
            path: updatedState.path === "unrouted" ? undefined : updatedState.path,
          });
        }

        // Log slot_filled for any slot that moved to filled in this exchange
        const previousFilled = Object.values(state.slots).filter((s) => s.status === "filled").length;
        const updatedFilled = Object.values(updatedState.slots).filter((s) => s.status === "filled").length;
        if (updatedFilled > previousFilled) {
          logEvent(sessionId, "slot_filled", {
            path: updatedState.path === "unrouted" ? undefined : updatedState.path,
            slotNumber: updatedFilled,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Conversation request failed";
        toast.error(
          message.includes("rate") || message.includes("auth")
            ? "Service is temporarily limited. Please try again in a moment."
            : "We couldn't process that. Please try again in a moment."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [state, history, sessionId, messages.length]
  );

  const hasMessages = messages.length > 0;
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMessages || !carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: carouselRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [messages.length, hasMessages]);

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      {/* pt-20: clear fixed header + buffer below TopNav */}
      <div className="pt-20 pb-14">
        <Paper variant="compact">
          <PaperScrollContainer>
            <div className="relative min-h-full">
              {/* Lines as background so paper always looks lined */}
              <div className="absolute inset-0 z-0 min-h-full" aria-hidden>
                <PaperLines />
              </div>
              <div className="relative z-10">
                {!hasMessages && <PaperOnboardingCopy />}
                {hasMessages && (
                  <>
                    <LiveDraftContent state={state} path={state.path} />
                    <DraftDocument state={state} allFilled={allFilled} />
                  </>
                )}
              </div>
            </div>
          </PaperScrollContainer>
        </Paper>
        {/* Toolbar and pagination attached directly below paper */}
        <Toolbar
          left={
            <LikelihoodBadge
              score={Math.round(likelihoodScore)}
              visible={true}
              onTap={() => setLikelihoodOpen(true)}
            />
          }
          centerLeft={
            <MemoryButton
              onTap={() => setGoalTreeOpen(true)}
              activeSlots={filledCount}
            />
          }
          centerRight={
            <ProgressButton
              onTap={() => setProgressOpen(true)}
              percentComplete={percentComplete}
            />
          }
          right={
            <span
              className="flex size-10 items-center justify-center rounded-md opacity-50"
              title="Expert (coming soon)"
              aria-hidden
            >
              <User className="size-6 text-[#1B2A4A]" />
            </span>
          }
        />
        <PaginationDots activeDot={hasMessages ? 3 : 2} />
        {hasMessages && (
          <div
            ref={carouselRef}
            className="mx-4 mt-3 flex overflow-x-auto overflow-y-hidden gap-4 snap-x snap-mandatory scroll-smooth overscroll-x-contain pb-2 -mx-4 px-4 md:mx-auto md:max-w-3xl"
            role="region"
            aria-label="Conversation exchanges"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className="min-w-[85%] max-w-[85%] md:min-w-[420px] md:max-w-[420px] shrink-0 snap-start space-y-2 rounded-lg border border-gray-200 bg-white p-4"
                role="article"
                aria-label={`Exchange ${i + 1} of ${messages.length}`}
              >
                <p className="text-sm text-[#1B2A4A]">
                  <span className="font-medium">You said:</span> {m.userInput}
                </p>
                <AIResponseBlock
                  understood={m.understood}
                  question={m.question}
                />
              </div>
            ))}
          </div>
        )}
        {allFilled && (
          <div className="mt-3 mx-4 max-w-3xl md:mx-auto">
            <PublishButton
              allFilled={allFilled}
              onPublish={handlePublish}
              isPublishing={isPublishing}
            />
          </div>
        )}
        {isSubmitting && (
          <p className="px-4 pt-1 text-sm text-[#1B2A4A]/70" role="status" aria-live="polite">
            Thinking…
          </p>
        )}
        <InputField
          onSubmit={handleSubmit}
          disabled={isSubmitting}
          placeholder={
            messages.length > 0 ? "Enter your answer here" : undefined
          }
          label={messages.length > 0 ? "Your answer" : "Your idea"}
        />
      </div>
      <BottomNav variant="active" fixed={true} />
      <GoalTreeModal
        open={goalTreeOpen}
        onClose={() => setGoalTreeOpen(false)}
        state={state}
        path={state.path}
      />
      <ProgressChartModal
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        filledCount={filledCount}
        percentComplete={percentComplete}
        path={state.path}
      />
      <LikelihoodDetailPanel
        open={likelihoodOpen}
        onClose={() => setLikelihoodOpen(false)}
        score={24}
        path={state.path}
      />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
