"use client";

import { useState } from "react";
import { InfoModal } from "@/components/modals/InfoModal";

export function InfoButton() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setInfoOpen(true)}
        className="flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1B2A4A] bg-transparent font-sans text-sm font-medium text-[#1B2A4A] transition-colors duration-150 hover:bg-[#1B2A4A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
        aria-label="Info"
      >
        ?
      </button>
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
