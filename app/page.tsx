"use client";

import { useState } from "react";
import Link from "next/link";
import { Paper } from "@/components/paper/Paper";
import { PaperLines } from "@/components/paper/PaperLines";
import { PaperScrollContainer } from "@/components/paper/PaperScrollContainer";
import { BottomNav } from "@/components/shell/BottomNav";
import { PaginationDots } from "@/components/shell/PaginationDots";
import { TopNav } from "@/components/shell/TopNav";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { InfoModal } from "@/components/modals/InfoModal";

export default function Home() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      <div className="pt-14 pb-14">
        <Paper>
          <PaperScrollContainer>
            <PaperLines />
          </PaperScrollContainer>
        </Paper>
        <Toolbar />
        <PaginationDots activeDot={1} />
        <div className="relative z-20 flex justify-center px-4 pt-2">
          <Link
            href="/draft"
            className="relative z-20 inline-block rounded-none bg-[#1B2A4A] px-8 py-3 font-sans text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#1B2A4A] focus:ring-offset-2 focus:ring-offset-[#FAF8F3] skew-x-[-6deg]"
          >
            <span className="inline-block skew-x-[6deg]">CREATE A DRAFT</span>
          </Link>
        </div>
      </div>
      <BottomNav variant="default" fixed={true} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
