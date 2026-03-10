"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CompletionPanelProps {
  onPublish: () => void;
  isPublishing: boolean;
}

export function CompletionPanel({ onPublish, isPublishing }: CompletionPanelProps) {
  return (
    <div className="w-full max-h-[40vh] overflow-y-auto border-t-2 border-[#1B2A4A] bg-white px-6 py-6">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#2D5016]">
        ✦ DRAFT COMPLETE
      </p>
      <h2 className="mt-2 font-serif text-lg text-[#1B2A4A]">
        Your draft is ready.
      </h2>
      <p className="mt-2 font-sans text-sm text-[#6B7280]">
        Publishing makes it visible in the public feed and generates a shareable link.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="min-h-[44px] w-full border-0 bg-[#1B2A4A] px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:bg-[#2D5016] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          PUBLISH DRAFT →
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-not-allowed font-sans text-sm text-[#6B7280] underline opacity-50">
              Download as PDF
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Coming soon.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
