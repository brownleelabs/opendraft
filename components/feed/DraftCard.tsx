"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LikelihoodBadge } from "@/components/toolbar/LikelihoodBadge";
import { VoteButtons } from "@/components/feed/VoteButtons";

export interface DraftCardProps {
  id: string;
  path: "policy" | "product";
  title: string;
  excerpt: string;
  likelihoodScore: number;
  publishedAt: string;
  voteCount: number;
  onVote: (value: 1 | -1) => void;
}

function CategoryTag({ path }: { path: "policy" | "product" }) {
  return (
    <Badge
      className={
        path === "policy"
          ? "bg-[#1B2A4A] text-white"
          : "bg-[#2D5016] text-white"
      }
    >
      {path === "policy" ? "Policy" : "Product"}
    </Badge>
  );
}

function formatPublishedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Card for one published draft: CategoryTag, title (Playfair), excerpt (Inter), LikelihoodBadge, VoteButtons, date.
 */
export function DraftCard({
  id,
  path,
  title,
  excerpt,
  likelihoodScore,
  publishedAt,
  voteCount,
  onVote,
}: DraftCardProps) {
  return (
    <Card>
      <Link
        href={`/feed/${id}`}
        className="block focus-visible:ring-2 focus-visible:ring-[#2D5016] focus-visible:ring-offset-2 rounded-lg outline-none"
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CategoryTag path={path} />
          <LikelihoodBadge score={likelihoodScore} visible={true} />
        </CardHeader>
        <CardContent className="space-y-2">
          <CardTitle className="font-serif text-[#1B2A4A]">{title}</CardTitle>
          <p className="font-sans text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </CardContent>
      </Link>
      <CardFooter
        className="flex flex-wrap items-center justify-between gap-2 border-t pt-4"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-muted-foreground">
          {formatPublishedDate(publishedAt)}
        </span>
        <VoteButtons voteCount={voteCount} onVote={onVote} />
      </CardFooter>
    </Card>
  );
}
