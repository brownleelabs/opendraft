"use client";

export interface VoteButtonsProps {
  voteCount: number;
  onVote: (value: 1 | -1) => void;
}

/**
 * Upvote and downvote buttons with count between. Navy text. Calls onVote(1) or onVote(-1).
 */
export function VoteButtons({ voteCount, onVote }: VoteButtonsProps) {
  return (
    <div className="flex items-center gap-2 text-[#1B2A4A]">
      <button
        type="button"
        onClick={() => onVote(-1)}
        className="flex size-8 items-center justify-center rounded-md border border-[#1B2A4A]/20 bg-transparent text-[#1B2A4A] transition-transform duration-100 hover:bg-[#1B2A4A]/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2"
        aria-label="Downvote"
      >
        ▼
      </button>
      <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">
        {voteCount}
      </span>
      <button
        type="button"
        onClick={() => onVote(1)}
        className="flex size-8 items-center justify-center rounded-md border border-[#1B2A4A]/20 bg-transparent text-[#1B2A4A] transition-transform duration-100 hover:bg-[#1B2A4A]/5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2"
        aria-label="Upvote"
      >
        ▲
      </button>
    </div>
  );
}
