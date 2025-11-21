"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import { DataTableTagFilter } from "../data-table/data-table-tag-filter";
import { X, RefreshCcw, ExternalLink } from "lucide-react";
import useAuthentication from "@/hooks/use-authentication";

interface NavbarSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleSearch: () => void;
  isFetching: boolean;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
}

export function NavbarSearch({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isFetching,
  selectedTags,
  setSelectedTags,
}: NavbarSearchProps) {
  const handleReset = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };
  const { isAdmin } = useAuthentication();
  
  const clearSearch = () => {
    setSearchQuery("");
  };

  const showReset = searchQuery.length > 0 || selectedTags.length > 0;

  const linkClassName =
    "text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200 text-base font-semibold";

  const gradientStyle = {
    backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  };

  return (
    <div className="relative flex items-center justify-between w-full h-20 px-4 md:px-8 border-b bg-white">
      <nav className="flex items-center gap-6 flex-1 justify-start min-w-[30%] text-sm font-medium font-serif">
        {isAdmin ? (
          <Link href="/admin/meme" className={linkClassName} target="_blank">
              Admin
          </Link> 
       ) : ( 
            <Link href="/" className={linkClassName}>
               Home
            </Link> 
      )}

        <Link href="/templates" className={linkClassName}>
          Templates
        </Link>

        <Link
          href="https://www.jewelrycandles.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkClassName} flex items-center gap-1`}
        >
          Meme Merch
          <ExternalLink className="w-3 h-3" />
        </Link>

        <Link
          href="/meme"
          style={gradientStyle}
          className="text-white hover:opacity-90 transition-opacity text-base font-semibold whitespace-nowrap"
          target="_blank"
        >
          Create Humour
        </Link>
      </nav>

      <Link
        href="/"
        className="absolute left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="relative h-18 w-36 flex-shrink-0">
          <NextImage
            src="/brand/ilovememes-logo.png"
            alt="I Love Memes"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>

      <div className="flex items-center justify-end gap-2 flex-1 min-w-[30%]">
        <div className="relative flex items-center max-w-xs w-full">
          <Input
            placeholder="Search Memes"
            value={searchQuery}
            className="h-10 pr-8 w-full rounded-lg"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isFetching}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 h-full px-2 py-0 hover:bg-transparent cursor-pointer"
              onClick={clearSearch}
            >
              <X className="h-4 w-4 cursor-pointer" />
            </Button>
          )}
        </div>

        <DataTableTagFilter
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          className="h-10"
        />

        {showReset && (
          <Button
            variant="outline"
            onClick={handleReset}
            title="Reset Search and Filters"
            className="flex items-center gap-1 border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
