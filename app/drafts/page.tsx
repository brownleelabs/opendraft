import type { Metadata } from "next";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";

export const metadata: Metadata = {
  title: "OpenDraft — Previous Drafts",
  description: "Your draft history.",
};

export default function DraftsPage() {
  return (
    <>
      <TopNav />
      <div className="min-h-screen pt-14 pb-14 px-4">
        <h1 className="font-serif text-[#1B2A4A] text-xl font-semibold mb-6">
          Previous Drafts
        </h1>
        <p className="text-sm text-[#1B2A4A]/80 max-w-3xl mx-auto">
          Your draft history will appear here. Start a draft from the home page
          to see it listed here later.
        </p>
      </div>
      <BottomNav variant="active" fixed={true} />
    </>
  );
}
