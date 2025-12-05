"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NextImage from "next/image";
import { DataTableTagFilter } from "../data-table/data-table-tag-filter";
import { X, RefreshCcw, Menu, LayoutDashboard } from "lucide-react"; 
import { UserHoverCard } from "../ui/extension/welcome-handler";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false); 
  
  const handleReset = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };
  
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
    
    // Toggle function for the single mobile panel
    const toggleMobilePanel = () => {
        setShowMobilePanel(prev => !prev);
    }
    
    // Function to remove a single tag (re-added for badge functionality)
    const removeTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };
    const isTemplate = true;

  return (
    <div className="relative flex items-center justify-between w-full h-20 px-4 md:px-8 border-b bg-white">
      {/* LEFT SIDE: Menu Button + Desktop Links */}
      <div className="flex items-center gap-6 font-medium text-base font-serif flex-shrink-0">
        
        {/* Desktop links hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
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
            className="hidden md:inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white text-sm font-medium shadow-sm"
          >
            {ctaButton.label}
          </Link>
        </div>

        {/* Mobile menu button (FIXED: Added -ml-2 to push left) */}
        <button
          className="md:hidden p-0 -ml-1" 
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="w-6 h-6" /> 
        </button>
      </div>

      {/* CENTER: Logo (Should be inherently centered due to absolute positioning) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex-shrink-0">
       <Link href="/" aria-label="I Love Memes">
           <div className="relative h-40 w-[140px] md:w-[180px]">
             <NextImage
               src="/brand/ilovememes-logo.png"
               alt="I Love Memes"
               fill
               className="object-contain"
               sizes="(max-width: 768px) 140px, 180px"
               priority
             />
           </div>
         </Link>
      </div>

      {/* RIGHT SIDE: Search Icon + Initials */}
      <div className="flex items-center justify-end gap-2 flex-1 min-w-[30%]">
        
        {/* --- Desktop Search and Tags (HIDDEN on Mobile) --- */}
        <div className="relative items-center max-w-xs w-full hidden md:flex"> 
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

        <div className="hidden md:block">
          <DataTableTagFilter
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            className="h-10"
          />
        </div>
        
        {/* --- Desktop Reset Button (HIDDEN on Mobile) --- */}
        {showReset && (
          <Button
            variant="outline"
            onClick={handleReset}
            title="Reset Search and Filters"
            className="hidden md:flex items-center gap-1 border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
        
        {/* --- Mobile Search Icon with Tooltip --- */}
        <div className="flex items-center gap-1 md:hidden">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            aria-label="Open search and filter"
                            onClick={toggleMobilePanel}
                            className={`p-2 rounded hover:bg-gray-100 ${showMobilePanel ? 'bg-gray-200' : ''}`}
                        >
                            <LayoutDashboard className="w-6 h-6 text-gray-600" /> 
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Filter Options</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        <div>
          <UserHoverCard template={isTemplate}/>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 bg-white border-t md:hidden p-3 ">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link 
                key={link.id} 
                href={link.href} 
                className="py-2 px-2 rounded hover:bg-gray-50"
                onClick={() => setMobileOpen(false)} 
              >
                {link.label}
              </Link>
            ))}

            <Link 
                href={ctaButton.href} 
                className="py-2 px-2 rounded bg-gradient-to-r from-[#CD01BA] to-[#E20317] text-white text-center"
                onClick={() => setMobileOpen(false)}
            >
              {ctaButton.label}
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Search and Tags Panel (Combined) */}
      {showMobilePanel && (
        <div className="absolute md:hidden top-12 right-4 z-50 w-72 bg-white border rounded-md shadow-lg p-3">
          
          {/* Search Input Section */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
                <Input
                placeholder="Search Memes"
                value={searchQuery}
                className="h-10 pr-8 w-full rounded-lg"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSearch();
                        setShowMobilePanel(false); // Close panel on search
                    }
                }}
                disabled={isFetching}
                />
                {searchQuery && (
                    <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-2 py-0 hover:bg-transparent cursor-pointer"
                    onClick={clearSearch}
                    >
                    <X className="h-4 w-4 cursor-pointer" />
                    </Button>
                )}
            </div>
          </div>
          
          {/* Tag Filter Section */}
          <div className="mb-4">
             <h4 className="text-sm font-medium mb-2 text-gray-700">Filter by Tags:</h4>
             <DataTableTagFilter
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                className="w-full"
             />
          </div>

          {/* --- SELECTED TAGS BADGES (New Addition) --- */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4 border-b pb-3">
                <span className="text-xs text-gray-500 w-full">Current Filters:</span>
                {selectedTags.map((tag) => (
                    <span 
                        key={tag}
                        className="flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full"
                    >
                        {tag}
                        <X 
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-purple-600" 
                            onClick={() => removeTag(tag)}
                        />
                    </span>
                ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3">
            {showReset && (
                <Button
                    variant="outline"
                    onClick={() => {handleReset(); setShowMobilePanel(false)}}
                    title="Reset Search and Filters"
                    size="sm"
                    className="flex items-center gap-1 border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <RefreshCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
            )}
            <Button size="sm" onClick={() => setShowMobilePanel(false)}>Done</Button>
          </div>
        </div>
      )}
    </div>
  );
}
