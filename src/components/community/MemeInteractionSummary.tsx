"use client";
import { useEffect } from "react";
import { useGetInteractionSummaryQuery } from "@/redux/services/interaction";
import { InteractionSummary } from "@/types/meme-types";

interface MemeSummaryFetcherProps {
  memeId: string;
  userId: string | undefined;
  updateMemeState: (memeId: string, summary: InteractionSummary) => void;
}

export function MemeSummaryFetcher({ memeId, userId, updateMemeState }: MemeSummaryFetcherProps) {
  const { data: summary } = useGetInteractionSummaryQuery(
    { memeId, userId: userId ?? "" },
    { skip: !userId }
  );

  useEffect(() => {
    if (summary) updateMemeState(memeId, summary);
  }, [summary, memeId, updateMemeState]);

  return null;
}
