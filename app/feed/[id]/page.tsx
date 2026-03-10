import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchDraftById } from "@/lib/supabase-client";
import { TopNav } from "@/components/shell/TopNav";
import { BottomNav } from "@/components/shell/BottomNav";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const draft = await fetchDraftById(id);
  if (!draft) return { title: "Draft not found — OpenDraft" };
  return {
    title: `${draft.title} — OpenDraft`,
    description: draft.title,
  };
}

export default async function DraftViewPage({ params }: Props) {
  const { id } = await params;
  const draft = await fetchDraftById(id);
  if (!draft) notFound();

  const isPolicy = draft.path === "policy";

  return (
    <>
      <TopNav />
      <div className="min-h-screen pt-20 pb-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/feed"
            className="text-sm text-[#2D5016] hover:underline focus-visible:ring-2 focus-visible:ring-[#2D5016] focus-visible:ring-offset-2 rounded"
          >
            ← Back to feed
          </Link>
          <Badge
            className={
              isPolicy
                ? "mt-4 bg-[#1B2A4A] text-white"
                : "mt-4 bg-[#2D5016] text-white"
            }
          >
            {isPolicy ? "Policy" : "Product"}
          </Badge>
          <h1 className="mt-2 font-serif text-[#1B2A4A] text-xl font-semibold">
            {draft.title}
          </h1>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 font-serif text-[#1B2A4A] whitespace-pre-wrap">
            {draft.formatted_document}
          </div>
        </div>
      </div>
      <BottomNav variant="active" fixed={true} />
    </>
  );
}
