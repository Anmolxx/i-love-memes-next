"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetTemplatesQuery } from "@/redux/services/template";
import { NavbarSearch } from "./NavbarSearch";
import { Button } from "@/components/ui/button";
import { TagSelector } from "./TagSelector";
import { useDebounce } from "@/hooks/use-debounce";
import NextImage from "next/image";

export function TemplateGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 600);
  const { data, isFetching } = useGetTemplatesQuery({
    page,
    limit: 30,
    search: debouncedSearch,
    tags: selectedTags,
  });

  const templates = data?.items || [];
  const handleSearch = () => setPage(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Navbar with logo and search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Link href="/">
          <div className="relative h-16 w-40 flex-shrink-0">
            <NextImage
              src="/brand/ilovememes-logo.png"
              alt="I Love Memes"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="flex-1">
          <NavbarSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isFetching={isFetching}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
          />
        </div>

        <TagSelector setAvailableTags={setAvailableTags} />
      </div>

      {/* Templates gallery */}
      {templates.length === 0 && !isFetching ? (
        <p className="text-gray-500 text-center mt-6">No templates found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: any) => {
            const bgImage = template.config?.backgroundImage?.src;

            return (
              <div
                key={template.id}
                className="border rounded-lg shadow-sm overflow-hidden flex flex-col"
              >
                {bgImage ? (
                  <div className="w-full h-56 relative">
                    <img
                      src={bgImage}
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold text-lg">{template.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {template.description}
                  </p>

                  <Link
                    href={`/meme/${template.slug}`}
                    target="_blank"
                    className="mt-auto"
                  >
                    <Button className="w-full cursor-pointer">
                      Use this template
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
