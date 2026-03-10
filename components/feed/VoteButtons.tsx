"use client";

export interface VoteButtonsProps {
  voteCount: number;
  onVote: (value: 1 | -1) => void;
}

/**
 * Upvote and downvote buttons with count between. Navy text. Calls onVote(1) or onVote(-1).
 */
export function VoteButtons({ voteCount, onVote }: VoteButtonsProps) {
  const btnClass =
    "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-[#1B2A4A]/20 bg-transparent text-[#1B2A4A] transition-transform duration-100 hover:bg-[#1B2A4A]/5 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]";

  return (
    <div className="flex items-center gap-2 text-[#1B2A4A]" role="group" aria-label="Vote on this draft">
      <button
        type="button"
        onClick={() => onVote(-1)}
        className={btnClass}
        aria-label="Downvote"
      >
        ▼
      </button>
      <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums" aria-live="polite">
        {voteCount}
      </span>
      <button
        type="button"
        onClick={() => onVote(1)}
        className={btnClass}
        aria-label="Upvote"
      >
        ▲
      </button>
    </div>
  );
}
