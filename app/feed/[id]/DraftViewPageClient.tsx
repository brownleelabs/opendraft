"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { Badge } from "@/components/ui/badge";
import { InfoModal } from "@/components/modals/InfoModal";

interface DraftViewPageClientProps {
  draft: {
    id: string;
    path: string;
    title: string;
    formatted_document: string;
  };
}

export function DraftViewPageClient({ draft }: DraftViewPageClientProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const isPolicy = draft.path === "policy";

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      <div className="min-h-screen pt-20 pb-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/feed"
            className="inline-flex min-h-[44px] items-center text-sm text-[#2D5016] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5016] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] rounded"
          >
            ← Back to feed
          </Link>
          <Badge
            className={
              isPolicy
                ? "mt-4 bg-[#1B2A4A] text-white"
                : "mt-4 bg-[#2D5016] text-white"
            }
          >
            {isPolicy ? "Policy" : "Product"}
          </Badge>
          <h1 className="mt-2 font-serif text-[#1B2A4A] text-xl font-semibold">
            {draft.title}
          </h1>
          <div className="mt-6 rounded-[2px] border border-[#E8E3D8] bg-white p-6 font-serif text-[#1B2A4A] whitespace-pre-wrap">
            {draft.formatted_document}
          </div>
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
