"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

export type FeedFilter = "all" | "policy" | "product";

interface FeedListProps {
  drafts: Draft[];
}

export function FeedList({ drafts }: FeedListProps) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(drafts.map((d) => [d.id, d.vote_count ?? 0]))
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

  const filtered =
    filter === "all"
      ? drafts
      : drafts.filter((d) => d.path === filter);

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-10 border-b border-[#E8E3D8] bg-white py-3">
        <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 scrollbar-none md:flex-wrap md:justify-center">
          {(["all", "policy", "product"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`min-h-[44px] min-w-[44px] rounded-sm px-4 py-1.5 font-sans text-xs font-semibold transition-colors duration-150 ${
                filter === f
                  ? "bg-[#1B2A4A] text-white"
                  : "bg-transparent text-[#1B2A4A] hover:bg-[#F3F4F6]"
              }`}
            >
              {f === "all" ? "ALL" : f === "policy" ? "POLICY" : "PRODUCT"}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-6">
        {drafts.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="text-center font-sans text-sm text-[#6B7280]">
            No {filter === "policy" ? "policy" : "product"} drafts yet.
          </p>
        ) : (
          <ul
            className="flex list-none flex-col gap-4 p-0 m-0"
            aria-label="Published drafts"
          >
            {filtered.map((d) => (
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
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center pt-20" role="status" aria-label="No published drafts yet">
      <div
        className="relative h-[200px] w-[400px] max-w-[90vw] rounded-[2px] border border-[#E8E3D8] bg-[#FAF8F3] p-5 shadow-[0_4px_24px_rgba(27,42,74,0.08),0_1px_4px_rgba(27,42,74,0.04)]"
        aria-hidden
      >
        <div className="grid h-full grid-rows-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex min-h-0 items-center border-b border-[#E8E3D8]"
              style={{ borderBottomWidth: "1px" }}
            />
          ))}
        </div>
        <span className="absolute left-5 top-5 font-serif text-sm text-[#C8C0B0]">
          Your proposal could be here.
        </span>
      </div>
      <p className="mt-6 font-serif text-xl italic text-[#9CA3AF]">
        No drafts published yet.
      </p>
      <Link
        href="/draft"
        className="mt-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-sans text-sm font-medium text-[#1B2A4A] underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
      >
        Be the first. →
      </Link>
    </div>
  );
}
