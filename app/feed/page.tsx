import type { Metadata } from "next";
import { fetchDrafts } from "@/lib/supabase-client";
import { FeedPageClient } from "./FeedPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OpenDraft — Feed",
  description: "All published drafts from OpenDraft citizens.",
};

export default async function FeedPage() {
  let drafts: Awaited<ReturnType<typeof fetchDrafts>> = [];
  let error: string | null = null;
  try {
    drafts = await fetchDrafts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load drafts.";
  }
  return <FeedPageClient drafts={drafts} error={error} />;
}
