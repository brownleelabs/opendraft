"use client";

import { VoteButtons } from "@/components/feed/VoteButtons";

export interface DraftCardProps {
  id: string;
  path: "policy" | "product";
  title: string;
  formattedDocument: string;
  publishedAt: string;
  voteCount: number;
  onVote: (value: 1 | -1) => void;
}

function relativeTime(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (sec < 60) return "just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function excerpt(text: string, maxLength: number): string {
  const trimmed = (text ?? "").trim();
  if (trimmed.length <= maxLength) return trimmed || "";
  return trimmed.slice(0, maxLength).trim() + "…";
}

export function DraftCard({
  id,
  path,
  title,
  formattedDocument,
  publishedAt,
  voteCount,
  onVote,
}: DraftCardProps) {
  const pathLabel = path === "policy" ? "POLICY" : "PRODUCT";
  const displayTitle = (title ?? "").trim() || null;
  const excerptText = excerpt(formattedDocument ?? "", 160);

  return (
    <article
      className="rounded-[2px] border border-[#E8E3D8] bg-white px-5 py-5 transition-[border-color,box-shadow] duration-150 hover:border-[#1B2A4A] hover:shadow-[0_4px_16px_rgba(27,42,74,0.06)] md:px-8 md:py-7"
      aria-labelledby={`draft-title-${id}`}
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <span
          className="rounded-sm px-2.5 py-1 font-sans text-xs font-semibold uppercase text-white"
          style={{
            backgroundColor: path === "policy" ? "#1B2A4A" : "#2D5016",
          }}
        >
          {pathLabel}
        </span>
        <span className="font-sans text-xs text-[#9CA3AF]">
          {relativeTime(publishedAt)}
        </span>
      </div>
      <h2
        id={`draft-title-${id}`}
        className="mt-2 line-clamp-2 font-serif text-[18px] text-[#1B2A4A] md:text-[22px]"
      >
        {displayTitle ?? <span className="italic text-[#9CA3AF]">Untitled Draft</span>}
      </h2>
      {excerptText && (
        <p className="mt-2 font-sans text-sm leading-relaxed text-[#4B5563]">
          {excerptText}
        </p>
      )}
      <div className="mt-4 flex flex-row flex-wrap items-center justify-between gap-4 border-t border-[#F3F4F6] pt-4">
        <VoteButtons voteCount={voteCount} onVote={onVote} />
        <span className="min-h-[44px] min-w-[44px] flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-wider text-[#1B2A4A]">
          READ DRAFT →
        </span>
      </div>
    </article>
  );
}
