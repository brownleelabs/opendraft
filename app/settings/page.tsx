"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { InfoModal } from "@/components/modals/InfoModal";
import { ChevronRight } from "lucide-react";

/**
 * Settings screen. Account (sign in / create account) and draft history.
 * Auth is v1.5; this page provides the structure and entry points.
 */
export default function SettingsPage() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <TopNav onInfoTap={() => setInfoOpen(true)} />
      <div className="min-h-screen pt-20 pb-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-[#1B2A4A] text-xl font-semibold mb-6">
            Settings
          </h1>

          <section className="space-y-1" aria-labelledby="settings-account-heading">
            <h2 id="settings-account-heading" className="text-sm font-medium text-[#1B2A4A]/70 uppercase tracking-wide mb-3">
              Account
            </h2>
            <button
              type="button"
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-left text-[#1B2A4A] transition-colors hover:bg-[#FAF8F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] active:scale-[0.99]"
              onClick={() => toast.info("Coming soon. Use OpenDraft without an account for now.")}
              aria-describedby="account-desc"
            >
              <span>Create account / Sign in</span>
              <ChevronRight className="size-5 text-[#1B2A4A]/50 shrink-0" aria-hidden />
            </button>
            <p id="account-desc" className="text-sm text-[#1B2A4A]/70 mt-1">
              Coming soon. Use OpenDraft without an account for now.
            </p>
          </section>

          <section className="mt-8 space-y-1" aria-labelledby="settings-history-heading">
            <h2 id="settings-history-heading" className="text-sm font-medium text-[#1B2A4A]/70 uppercase tracking-wide mb-3">
              Drafts
            </h2>
            <Link
              href="/drafts"
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-left text-[#1B2A4A] transition-colors hover:bg-[#FAF8F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] active:scale-[0.99]"
            >
              <span>Draft history</span>
              <ChevronRight className="size-5 shrink-0 text-[#1B2A4A]/50" aria-hidden />
            </Link>
            <p className="text-sm text-[#1B2A4A]/70 mt-1">
              View and resume drafts you&apos;ve started.
            </p>
          </section>

          <section className="mt-8">
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-left text-[#1B2A4A] transition-colors hover:bg-[#FAF8F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3] active:scale-[0.99]"
            >
              <span>About OpenDraft</span>
              <ChevronRight className="size-5 shrink-0 text-[#1B2A4A]/50" aria-hidden />
            </button>
          </section>
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
