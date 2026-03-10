import Link from "next/link";
import { fetchDraftById } from "@/lib/supabase-client";
import { DraftDetailVoteSection } from "@/components/feed/DraftDetailVoteSection";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  if (sec < 2592000) return `${Math.floor(sec / 604800)}w ago`;
  if (sec < 31536000) return `${Math.floor(sec / 2592000)}mo ago`;
  return `${Math.floor(sec / 31536000)}y ago`;
}

export const dynamic = "force-dynamic";

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await fetchDraftById(id);

  if (!draft) {
    return (
      <>
        <TopNav />
        <div className="min-h-screen bg-[#FAF8F3] pb-14 pt-20">
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 pt-24">
            <p className="font-serif text-xl italic text-[#9CA3AF]">
              Draft not found.
            </p>
            <Link
              href="/feed"
              className="mt-4 font-sans text-sm text-[#1B2A4A] no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2"
            >
              ← Back to Feed
            </Link>
          </div>
        </div>
        <BottomNav variant="active" fixed={true} />
      </>
    );
  }

  const pathLabel = (draft.path ?? "policy") === "policy" ? "POLICY" : "PRODUCT";
  const voteCount = draft.vote_count ?? 0;
  const publishedAt = draft.published_at ?? new Date().toISOString();
  const formattedDoc = draft.formatted_document ?? "";

  return (
    <>
      <TopNav />
      <div className="min-h-screen bg-[#FAF8F3] pb-14 pt-20">
        <div className="mx-auto max-w-2xl px-4 pt-12">
          <header>
            <div className="flex flex-row items-center gap-2">
              <span
                className="rounded-sm px-2.5 py-1 font-sans text-xs font-semibold uppercase text-white"
                style={{
                  backgroundColor:
                    (draft.path ?? "policy") === "policy" ? "#1B2A4A" : "#2D5016",
                }}
              >
                {pathLabel}
              </span>
              <span className="font-sans text-sm text-[#6B7280]">
                Published {relativeTime(publishedAt)}
              </span>
            </div>
            <h1 className="mt-2 font-serif text-[28px] leading-tight text-[#1B2A4A] md:text-[36px]">
              {(draft.title ?? "").trim() || "Untitled Draft"}
            </h1>
            <hr
              className="mt-6 border-[#E8E3D8]"
              style={{ borderWidth: "1px", marginBottom: "24px" }}
            />
          </header>

          <article className="max-w-prose font-sans text-[#1B2A4A] leading-[1.8] whitespace-pre-wrap">
            {formattedDoc}
          </article>

          <footer
            className="mt-12 border-t border-[#E8E3D8] pt-6"
            style={{ borderTopWidth: "1px" }}
          >
            <div className="flex flex-row flex-wrap items-center justify-between gap-4">
              <DraftDetailVoteSection
                draftId={draft.id}
                initialVoteCount={voteCount}
              />
              <Link
                href="/feed"
                className="font-sans text-sm text-[#1B2A4A] no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2"
              >
                ← Back to Feed
              </Link>
            </div>
          </footer>
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
    </>
  );
}
