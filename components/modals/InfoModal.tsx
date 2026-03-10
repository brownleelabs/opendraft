"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export function InfoModal({ open, onClose }: InfoModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleGetStarted = () => {
    onClose();
    if (pathname === "/draft") return;
    setTimeout(() => router.push("/draft"), 0);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        overlayClassName="bg-black/30 animate-fade-in"
        className="max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-[#1B2A4A]">
            What is OpenDraft?
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <p className="text-sm text-[#1B2A4A]">
            Most good ideas never reach the right person. Not because
            they&apos;re bad ideas — because they&apos;re never written down
            clearly enough to act on.
          </p>
          <p className="text-sm text-[#1B2A4A]">
            OpenDraft asks you questions until your idea becomes a
            structured proposal. Policy path sends it toward a lawmaker.
            Product path sends it toward a company. Either way, you wrote it.
          </p>
          <p className="text-sm text-[#1B2A4A]">
            Every published draft is in the public record.
            Anyone can read it. Anyone can vote on it.
          </p>
          <button
            type="button"
            onClick={handleGetStarted}
            className="min-h-[44px] w-full border-0 bg-[#1B2A4A] py-3 font-sans text-sm font-semibold uppercase text-white transition-colors duration-200 hover:bg-[#2D5016] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98]"
          >
            Get Started
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
