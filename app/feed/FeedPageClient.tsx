"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { FeedDraftList } from "@/components/feed/FeedDraftList";
import { InfoModal } from "@/components/modals/InfoModal";
import type { Draft } from "@/lib/supabase-client";

interface FeedPageClientProps {
  drafts: Draft[];
  error?: string | null;
}

export function FeedPageClient({ drafts, error }: FeedPageClientProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      <div className="min-h-screen pt-20 pb-14 px-4">
        <h1 className="font-serif text-[#1B2A4A] text-xl font-semibold mb-6">
          Public Drafts
        </h1>
        <div className="overflow-y-auto max-w-3xl mx-auto">
          {error ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
              role="alert"
            >
              <p className="font-sans text-[#1B2A4A] text-sm">
                Unable to load drafts.
              </p>
              <p className="mt-1 font-sans text-[#1B2A4A]/70 text-sm">
                {error}
              </p>
              <button
                type="button"
                onClick={() => router.refresh()}
                className="mt-4 min-h-[44px] rounded-lg bg-[#1B2A4A] px-4 py-2 font-sans text-sm font-medium text-white transition-transform hover:opacity-90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
              >
                Try again
              </button>
              <p className="mt-3">
                <Link
                  href="/"
                  className="inline-flex min-h-[44px] items-center text-sm text-[#2D5016] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5016] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] rounded"
                >
                  ← Back to home
                </Link>
              </p>
            </div>
          ) : (
            <FeedDraftList drafts={drafts} />
          )}
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
