import type { Metadata } from "next";
import { DraftsPageClient } from "./DraftsPageClient";

export const metadata: Metadata = {
  title: "OpenDraft — Previous Drafts",
  description: "Your draft history.",
};

export default function DraftsPage() {
  return <DraftsPageClient />;
}
