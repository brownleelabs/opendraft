"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { FeedList } from "@/components/feed/FeedList";
import { InfoModal } from "@/components/modals/InfoModal";
import type { Draft } from "@/lib/supabase-client";

interface FeedPageClientProps {
  drafts: Draft[];
  totalPublished: number;
  thisWeek: number;
  error?: string | null;
}

export function FeedPageClient({
  drafts,
  totalPublished,
  thisWeek,
  error,
}: FeedPageClientProps) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      <div className="min-h-screen bg-[#FAF8F3] pb-14 pt-20">
        {error ? (
          <div
            className="mx-auto max-w-2xl px-4 pt-8"
            role="alert"
          >
            <div className="rounded-[2px] border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-sans text-sm text-[#1B2A4A]">
                Unable to load drafts.
              </p>
              <p className="mt-1 font-sans text-sm text-[#1B2A4A]/70">
                {error}
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex min-h-[44px] items-center font-sans text-sm font-medium text-[#2D5016] underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5016] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <header className="border-b border-[#E8E3D8] bg-white pb-12 pt-16">
              <div className="mx-auto max-w-2xl px-4 text-left">
                <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#6B7280]">
                  PUBLIC RECORD
                </p>
                <h1 className="font-serif text-[32px] leading-[1.1] text-[#1B2A4A] md:text-[48px]">
                  The OpenDraft Feed
                </h1>
                <p className="mt-3 font-sans text-base text-[#6B7280]">
                  Structured proposals from the public — for lawmakers and companies.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#E8E3D8] px-4 py-1.5 font-sans text-sm text-[#1B2A4A]">
                    {totalPublished} proposals published
                  </span>
                  <span className="rounded-full border border-[#E8E3D8] px-4 py-1.5 font-sans text-sm text-[#1B2A4A]">
                    {thisWeek} this week
                  </span>
                </div>
              </div>
            </header>
            <FeedList drafts={drafts} />
          </>
        )}
      </div>
      <BottomNav variant="active" fixed={true} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
