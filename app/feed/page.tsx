import type { Metadata } from "next";
import { fetchDrafts } from "@/lib/supabase-client";
import { FeedPageClient } from "./FeedPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OpenDraft — Feed",
  description: "All published drafts from OpenDraft citizens.",
};

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export default async function FeedPage() {
  let drafts: Awaited<ReturnType<typeof fetchDrafts>> = [];
  let error: string | null = null;
  try {
    drafts = await fetchDrafts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load drafts.";
  }
  const totalPublished = drafts.length;
  const sevenDaysAgo = new Date(Date.now() - MS_PER_WEEK);
  const thisWeek = drafts.filter(
    (d) => new Date(d.published_at) >= sevenDaysAgo
  ).length;
  return (
    <FeedPageClient
      drafts={drafts}
      totalPublished={totalPublished}
      thisWeek={thisWeek}
      error={error}
    />
  );
}
