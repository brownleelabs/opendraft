"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DraftCard } from "@/components/feed/DraftCard";
import type { Draft } from "@/lib/supabase-client";

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

interface FeedDraftListProps {
  drafts: Draft[];
}

/**
 * Client list of draft cards. Handles vote via POST /api/vote with optimistic UI.
 */
export function FeedDraftList({ drafts }: FeedDraftListProps) {
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      drafts.map((d) => [d.id, d.vote_count ?? 0])
    )
  );

  useEffect(() => {
    setVoteCounts((prev) => {
      const next = { ...prev };
      for (const d of drafts) {
        next[d.id] = d.vote_count ?? 0;
      }
      return next;
    });
  }, [drafts]);

  const handleVote = useCallback(
    async (draftId: string, value: 1 | -1) => {
      setVoteCounts((c) => {
        const prev = c[draftId] ?? 0;
        return { ...c, [draftId]: prev + value };
      });
      const prev = voteCounts[draftId] ?? 0;

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
        setVoteCounts((c) => ({ ...c, [draftId]: prev }));
        toast.error("You've already voted on this draft.");
        return;
      }
      if (!res.ok) {
        setVoteCounts((c) => ({ ...c, [draftId]: prev }));
        toast.error("Vote failed. Please try again.");
        return;
      }
      if (typeof data.newTotal === "number") {
        setVoteCounts((c) => ({ ...c, [draftId]: data.newTotal }));
      }
      if (data.deviceFingerprint) {
        setStoredFingerprint(data.deviceFingerprint);
      }
    },
    [voteCounts]
  );

  if (drafts.length === 0) {
    return (
      <div
        className="rounded-lg border border-[#E5E5E5] bg-white p-6 text-center"
        role="status"
        aria-label="No published drafts yet"
      >
        <p className="font-sans text-[#1B2A4A] text-sm">
          No published drafts yet.
        </p>
        <p className="mt-2 font-sans text-[#1B2A4A]/70 text-sm">
          Create and publish a draft from the home page to see it here.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4 list-none p-0 m-0" aria-label="Published drafts">
      {drafts.map((d) => (
        <li key={d.id}>
          <DraftCard
            id={d.id}
            path={d.path === "product" ? "product" : "policy"}
            title={d.title}
            formattedDocument={d.formatted_document}
            publishedAt={d.published_at}
            voteCount={voteCounts[d.id] ?? d.vote_count ?? 0}
            onVote={(value) => handleVote(d.id, value)}
          />
        </li>
      ))}
    </ul>
  );
}
