"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";

interface AdminNavbarSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  handleSearch: () => void;
  isFetching?: boolean;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  inputWidth?: string; 
}

export function AdminSearchBar({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isFetching = false,
  selectedTags,
  setSelectedTags,
  availableTags,
  inputWidth = "w-72", 
}: AdminNavbarSearchProps) {
  const toggleTag = (tag: string) => {
    if (tag === "__none__") {
        setSelectedTags([]);
        return;
      }
    if (selectedTags.includes(tag))
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  };

  return (
    <div className="flex items-center gap-2 mb-5">
      <Input
        placeholder="Search..."
        value={searchQuery}
        className={`h-10 ${inputWidth}`}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
        disabled={isFetching}
      />

      <Select value="" onValueChange={toggleTag}>
        <SelectTrigger className="w-36 cursor-pointer">
          <SelectValue
            placeholder={
              selectedTags.length ? selectedTags.join(", ") : "Filter Tags"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {selectedTags.includes(tag) ? `✅ ${tag}` : tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
