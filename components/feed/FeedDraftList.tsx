"use client";

import { useCallback } from "react";
import { DraftCard } from "@/components/feed/DraftCard";
import type { Draft } from "@/lib/supabase-client";

interface FeedDraftListProps {
  drafts: Draft[];
}

function excerpt(text: string, maxLength: number = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + "…";
}

/**
 * Client list of draft cards. Handles vote via POST /api/vote (stub).
 */
export function FeedDraftList({ drafts }: FeedDraftListProps) {
  const handleVote = useCallback(async (draftId: string, value: 1 | -1) => {
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftId, value }),
    });
    // Stub: no state update until v1.5
  }, []);

  return (
    <ul className="flex flex-col gap-4 list-none p-0 m-0">
      {drafts.map((d) => (
        <li key={d.id}>
          <DraftCard
            id={d.id}
            path={d.path === "product" ? "product" : "policy"}
            title={d.title}
            excerpt={excerpt(d.formatted_document)}
            likelihoodScore={d.likelihood_score}
            publishedAt={d.published_at}
            voteCount={d.vote_count ?? 0}
            onVote={(value) => handleVote(d.id, value)}
          />
        </li>
      ))}
    </ul>
  );
}
