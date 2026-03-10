"use client";

import { useState } from "react";
import Link from "next/link";
import { InfoModal } from "@/components/modals/InfoModal";

export default function Home() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-[#FAF8F3]">
      {/* ZONE 1 — TOP (fixed, 60px) */}
      <header
        className="fixed left-0 right-0 top-0 z-10 flex h-[60px] items-center justify-between border-b border-[#E8E3D8] bg-[#FAF8F3] px-4"
        role="banner"
      >
        <span
          className="font-sans text-sm font-semibold tracking-[0.15em] text-[#1B2A4A]"
          aria-hidden
        >
          OPENDRAFT
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/feed"
            className="font-sans text-sm font-semibold tracking-[0.15em] text-[#1B2A4A] no-underline hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
          >
            FEED →
          </Link>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex size-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#1B2A4A] bg-transparent font-sans text-sm font-medium text-[#1B2A4A] transition-colors duration-150 hover:bg-[#1B2A4A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
            aria-label="Info"
          >
            ?
          </button>
        </div>
      </header>

      {/* ZONE 2 — HERO (flex-1, centered vertically) */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-[60px]">
        <div className="flex w-full max-w-[600px] flex-1 flex-col items-center justify-center gap-12">
          {/* Statement above the paper — animate-ink-in delay 100ms */}
          <div
            className="animate-ink-in flex flex-col items-center gap-2 text-center opacity-0"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            <h1 className="font-serif text-[28px] leading-tight text-[#1B2A4A] md:text-[40px]">
              Turn your idea into a proposal.
            </h1>
            <p className="font-sans text-[15px] text-[#6B7280]">
              For a lawmaker. For a company. In minutes.
            </p>
          </div>

          {/* Paper card — animate-slide-up delay 0ms */}
          <div
            className="animate-slide-up relative h-[200px] w-[min(600px,90vw)] rounded-[2px] border border-[#E8E3D8] bg-[#FAF8F3] p-5 opacity-0 shadow-[0_4px_24px_rgba(27,42,74,0.08),0_1px_4px_rgba(27,42,74,0.04)] md:h-[280px] md:p-[20px]"
            style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
            aria-hidden
          >
            {/* 12 horizontal ruled lines, evenly spaced; full width minus 40px padding */}
            <div className="grid h-full grid-rows-12 gap-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex min-h-0 items-center border-b border-[#E8E3D8]"
                  style={{ borderBottomWidth: "1px" }}
                >
                  {i === 0 && (
                    <span className="font-serif text-sm text-[#C8C0B0]">
                      POLICY PROPOSAL — CITY OF CHICAGO
                    </span>
                  )}
                  {i === 2 && (
                    <span className="font-serif text-sm text-[#C8C0B0]">
                      Section 1. The following change is proposed...
                    </span>
                  )}
                  {i === 4 && (
                    <span className="font-serif text-sm text-[#C8C0B0]">
                      Whereas the current system fails to address...
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* DRAFT stamp — bottom-right, rotated -15deg */}
            <span
              className="absolute bottom-5 right-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8C0B0]"
              style={{ transform: "rotate(-15deg)" }}
            >
              DRAFT
            </span>
          </div>
        </div>
      </main>

      {/* ZONE 3 — BOTTOM — CTA animate-ink-in delay 250ms */}
      <footer className="flex flex-shrink-0 flex-col items-center justify-center gap-3 pb-8 pt-4">
        <Link
          href="/draft"
          className="animate-ink-in group inline-flex min-h-[44px] items-center justify-center border-0 bg-[#1B2A4A] px-12 py-4 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-white no-underline opacity-0 transition-[background-color,transform] duration-200 hover:bg-[#2D5016] hover:[transform:skewX(-8deg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] active:scale-[0.98] [transform:skewX(-6deg)]"
          style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
        >
          <span className="inline-block skew-x-[6deg] transition-transform duration-200 group-hover:skew-x-[8deg]">CREATE A DRAFT</span>
        </Link>
        <p className="text-center font-sans text-xs text-[#9CA3AF]">
          No account required. Your draft is yours.
        </p>
      </footer>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
