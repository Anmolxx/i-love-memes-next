"use client";

import React, { useEffect } from "react";
import { useGetAllTagsQuery } from "@/redux/services/tag";

interface TagSelectorProps {
  setAvailableTags: (tags: string[]) => void;
}

export function TagSelector({ setAvailableTags }: TagSelectorProps) {
  const { data: tagsData, isLoading, error } = useGetAllTagsQuery();

  useEffect(() => {
    if (tagsData) {
      const tagNames = tagsData.map((tag: { id: string; name: string }) => tag.name);
      setAvailableTags(tagNames);
    }
  }, [tagsData, setAvailableTags]);

  if (error) return <div>Failed to load tags.</div>;

  return null; 
}
