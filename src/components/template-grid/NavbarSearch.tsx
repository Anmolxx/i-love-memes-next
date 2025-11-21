"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import { DataTableTagFilter } from "../data-table/data-table-tag-filter";
import { X, RefreshCcw } from "lucide-react";
import useAuthentication from "@/hooks/use-authentication"
import { UserHoverCard } from "@/components/ui/extension/welcome-handler"

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

  const links = [
      { id: 1, label: "Home", href: "/" },
      { id: 2, label: "Community", href: "/community" },
      { id: 3, label: "Meme Merch", href: "https://www.jewelrycandles.com/", external:true },
    ];
  
  const logo = {
    src:"/brand/ilovememes-logo.png",
    alt:"I Love Memes",
    href:"/"
  }

  const ctaButton = {
      label: "Generate Meme",
      href: "/meme",
      external: false,
    };
  
  return (
    <div className="relative flex items-center justify-between w-full h-20 px-4 md:px-8 border-b bg-white">
      <div className="flex items-center gap-6 font-medium text-base font-serif flex-shrink-0">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              className="text-[#4b087ea5] hover:text-[#4b087e] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
                href={ctaButton.href}
                target={ctaButton.external ? "_blank" : undefined}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white text-sm font-medium shadow-sm"
              >
              {ctaButton.label}
            </Link>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex-shrink-0">
            <Link href={logo.href} aria-label={logo.alt}>
              <NextImage
                src={logo.src}
                alt={logo.alt}
                width={180}
                height={40}
                className="object-contain"
              />
            </Link>
          </div>
  
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

        <UserHoverCard/>
      </div>
    </div>
  );
}
