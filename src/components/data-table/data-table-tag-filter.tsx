"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetAllTagsQuery } from "@/redux/services/tag";
import { useDebounce } from "@/hooks/use-debounce";

interface MemeTag {
  id: string;
  name: string;
  deletedAt: string | null;
}

interface GetAllTagsResponse {
  items: MemeTag[];
  meta: { totalItems: number; totalPages: number; currentPage: number; limit: number };
  success: boolean;
  message: string;
}

interface TagOption {
  value: string;
  label: string;
}

interface DataTableTagFilterProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export function DataTableTagFilter({
  selectedTags,
  setSelectedTags,
}: DataTableTagFilterProps) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search,600);

  const { data: tagsData, isLoading } = useGetAllTagsQuery({ search: debouncedSearch });

  const [allKnownTags, setAllKnownTags] = React.useState<Map<string, string>>(new Map());

  const availableTags: TagOption[] = React.useMemo(() => {
    if (!tagsData?.items) return [];
    return tagsData.items.map((tag: MemeTag) => ({
      value: tag.name,
      label: `#${tag.name}`,
    }));
  }, [tagsData]);

  const selectedTagOptions = React.useMemo(() => {
    return selectedTags.map((tagValue) => ({
      value: tagValue,
      label: allKnownTags.get(tagValue) || `#${tagValue}`,
    }));
  }, [selectedTags, allKnownTags]);

  React.useEffect(() => {
    if (tagsData?.items) {
      setAllKnownTags(prevMap => {
        const newMap = new Map(prevMap);
        tagsData.items.forEach((tag: MemeTag) => {
          newMap.set(tag.name, `#${tag.name}`);
        });
        return newMap;
      });
    }
  }, [tagsData]);

  const allDisplayTags = React.useMemo(() => {
    const combinedTags = new Map<string, TagOption>();
    selectedTagOptions.forEach(tag => combinedTags.set(tag.value, tag));
    availableTags.forEach(tag => {
        if (!combinedTags.has(tag.value)) {
            combinedTags.set(tag.value, tag);
        }
    });
    return Array.from(combinedTags.values());
  }, [selectedTagOptions, availableTags]);

  if (isLoading && !tagsData) {
      return (
        <Button variant="outline" size="sm" className="h-8 border-dashed" disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Loading Tags...
        </Button>
      );
    }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          Tags
          {selectedTags.length > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-border sm:block hidden" />
              <div className="hidden space-x-1 lg:flex">
                {selectedTags.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedTags.length} selected
                  </Badge>
                ) : (
                  selectedTagOptions
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search tags..."
            value={search}
            onValueChange={(value) => setSearch(value)}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {/* Group for all tags (selected + search results) */}
            <CommandGroup>
              {allDisplayTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.value);
                return (
                  <CommandItem
                    key={tag.value}
                  
                    value={tag.label} 
                    onSelect={() => {
                      const newTags = isSelected
                        ? selectedTags.filter((t) => t !== tag.value)
                        : [...selectedTags, tag.value];
                      setSelectedTags(newTags);
                      setSearch(""); 
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&>svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{tag.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            
            {selectedTags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setSelectedTags([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}