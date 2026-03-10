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
            OpenDraft helps you turn a raw idea into a structured proposal —
            either a bill for your representative or a feature request for a
            company.
          </p>
          <p className="text-sm text-[#1B2A4A]">
            You describe what you want to change. We ask questions until the
            idea is specific enough to act on. The result is a formatted
            document that gets sent to the right person.
          </p>
          <p className="text-sm text-[#1B2A4A]">
            Every published draft is public. Others can read and vote on it. The
            more support a draft gets, the more times it gets sent.
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
