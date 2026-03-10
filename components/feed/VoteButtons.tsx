"use client";

export interface VoteButtonsProps {
  voteCount: number;
  onVote: (value: 1 | -1) => void;
}

const baseBtnClass =
  "flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-sm border border-[#E8E3D8] bg-transparent px-3 py-1.5 font-sans text-sm transition-colors duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]";

/**
 * Upvote (↑ count) and downvote buttons. Navy for downvote; upvote shows count.
 * Voted state would use bg-[#2D5016] text-white border-[#2D5016] (not wired to API yet).
 */
export function VoteButtons({ voteCount, onVote }: VoteButtonsProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Vote on this draft">
      <button
        type="button"
        onClick={() => onVote(1)}
        className={`${baseBtnClass} text-[#1B2A4A] hover:bg-[#F3F4F6]`}
        aria-label="Upvote"
      >
        ↑ {voteCount}
      </button>
      <button
        type="button"
        onClick={() => onVote(-1)}
        className={`${baseBtnClass} border-[#1B2A4A]/30 text-[#1B2A4A] hover:bg-[#F3F4F6]`}
        aria-label="Downvote"
      >
        ↓
      </button>
    </div>
  );
}
