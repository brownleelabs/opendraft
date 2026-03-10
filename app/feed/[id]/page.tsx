import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchDraftById } from "@/lib/supabase-client";
import { DraftViewPageClient } from "./DraftViewPageClient";

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

  return (
    <DraftViewPageClient
      draft={{
        id: draft.id,
        path: draft.path,
        title: draft.title,
        formatted_document: draft.formatted_document,
      }}
    />
  );
}
