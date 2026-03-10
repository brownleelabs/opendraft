"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { VoteButtons } from "@/components/feed/VoteButtons";

const FINGERPRINT_KEY = "opendraft_device_fingerprint";

function getStoredFingerprint(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(FINGERPRINT_KEY);
  } catch {
    return null;
  }
}

function setStoredFingerprint(fp: string): void {
  try {
    localStorage.setItem(FINGERPRINT_KEY, fp);
  } catch {
    /* ignore */
  }
}

export interface DraftDetailVoteSectionProps {
  draftId: string;
  initialVoteCount: number;
}

export function DraftDetailVoteSection({
  draftId,
  initialVoteCount,
}: DraftDetailVoteSectionProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);

  const handleVote = useCallback(
    async (value: 1 | -1) => {
      const prev = voteCount;
      setVoteCount((c) => c + value);
      const deviceFingerprint = getStoredFingerprint();
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          value,
          deviceFingerprint: deviceFingerprint ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setVoteCount(prev);
        toast.error("You've already voted on this draft.");
        return;
      }
      if (!res.ok) {
        setVoteCount(prev);
        toast.error("Vote failed. Please try again.");
        return;
      }
      if (typeof data.newTotal === "number") {
        setVoteCount(data.newTotal);
      }
      if (data.deviceFingerprint) {
        setStoredFingerprint(data.deviceFingerprint);
      }
    },
    [draftId, voteCount]
  );

  return <VoteButtons voteCount={voteCount} onVote={handleVote} />;
}
