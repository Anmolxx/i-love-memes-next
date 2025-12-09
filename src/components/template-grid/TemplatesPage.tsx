"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useGetTemplatesQuery } from "@/redux/services/template";
import { NavbarSearch } from "./NavbarSearch";
import { Button } from "@/components/ui/button";
import { TagSelector } from "./TagSelector";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Template } from "@/utils/dtos/template.dto";
import { TemplateGallerySkeleton } from "./TemplateSkeleton"; 
import { Footer } from "@/sections/Footer";
import { FooterSkeleton } from "@/sections/skeletons/FooterSkeleton";
import { Pagination } from "@/components/ui/extension/Pagination";

export function TemplateGallery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("limit") ?? "9");
  const initialSearch = searchParams.get("search") ?? "";
  const initialTags = searchParams.getAll("tags") ?? [];

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  const debouncedSearch = useDebounce(searchQuery, 600);
  const { data, isFetching, isLoading } = useGetTemplatesQuery({
    page: currentPage,
    limit: per_page,
    search: debouncedSearch,
    tags: selectedTags,
  });

  const updateUrl = useCallback(
    (page: number, search?: string, tags?: string[]) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", per_page.toString());
      if (search) params.set("search", search);
      tags?.forEach(tag => params.append("tags", tag));
      router.push(`/templates?${params.toString()}`);
    },
    [router, per_page]
  );

  const handleSearch = () => setCurrentPage(1);

  useEffect(() => {
    setCurrentPage(1);
    updateUrl(1, searchQuery, selectedTags);
  }, [selectedTags, searchQuery, updateUrl]);

  const templates = data?.items || [];
  const meta = data?.meta;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrl(newPage, searchQuery, selectedTags);
  };

  return (
    <>
      <div className="w-full bg-white">
        <div className="max-w-[110rem] mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <NavbarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              isFetching={isFetching}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              availableTags={availableTags}
            />
            <TagSelector setAvailableTags={setAvailableTags} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 mb-5">
        {isFetching ? (
          <TemplateGallerySkeleton />
        ) : templates.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">No templates found</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => {
                const bgImage = template.config?.backgroundImage?.src;
                return (
                  <div
                    key={template.id}
                    className="border-1 border-[#D6C2FF] rounded-xl shadow-md p-2 flex flex-col hover:shadow-lg transition-shadow group"
                  >
                    {bgImage ? (
                      <div className="w-full h-56 relative">
                        <img
                          src={bgImage}
                          alt={template.title}
                          className="w-full h-full object-contain bg-gray-10 bg-black rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                        No Image
                      </div>
                    )}

                    <div className="py-4 px-2 flex flex-col gap-1 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-[#1F1147]">
                        {template.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 pb-4">
                        {template.description}
                      </p>

                      <Link
                        href={`/meme/${template.slug}`}
                        target="_blank"
                        className="mt-auto"
                      >
                        <Button className="w-full cursor-pointer rounded-full text-white bg-[#300458] hover:bg-[#300458]">
                          Use this template
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

           {meta && meta.totalPages > 1 && (
             <div className="mt-6 flex justify-center">
               <Pagination
                 page={currentPage}
                 pageCount={meta.totalPages}
                 onPageChange={handlePageChange}
               />
             </div>
           )}
          </>
        )}
      </div>

      {isLoading ? <FooterSkeleton /> : <Footer />}
    </>
  );
}