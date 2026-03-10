import type { Metadata } from "next";
import { fetchDrafts } from "@/lib/supabase-client";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { FeedDraftList } from "@/components/feed/FeedDraftList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OpenDraft — Feed",
  description: "All published drafts from OpenDraft citizens.",
};

export default async function FeedPage() {
  const drafts = await fetchDrafts();

  return (
    <>
      <TopNav />
      <div className="min-h-screen pt-20 pb-14 px-4">
        <h1 className="font-serif text-[#1B2A4A] text-xl font-semibold mb-6">
          Public Drafts
        </h1>
        <div className="overflow-y-auto max-w-3xl mx-auto">
          <FeedDraftList drafts={drafts} />
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
    </>
  );
}
