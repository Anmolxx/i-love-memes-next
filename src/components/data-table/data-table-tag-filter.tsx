// "use client";

// import * as React from "react";
// import { Check, PlusCircle, ChevronRight, ListPlus } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
//   CommandSeparator,
// } from "@/components/ui/command";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { useGetAllTagsQuery, useCreateTagMutation } from "@/redux/services/tag";
// import { useDebounce } from "@/hooks/use-debounce";
// import useAuthentication from "@/hooks/use-authentication";

// type TagFilterVariant = 'filter' | 'dialog';

// interface NewTagFormData {
//   name: string;
//   category: string;
//   description: string;
// }

// interface MemeTag {
//   id: string;
//   name: string;
//   deletedAt: string | null;
// }

// interface DataTableTagFilterProps extends React.HTMLAttributes<HTMLButtonElement>{
//   selectedTags?: string[];
//   setSelectedTags?: (tags: string[]) => void;
//   variant?: TagFilterVariant;
//   isLeft?: boolean;
//   isTop?: boolean;
// }

// export function DataTableTagFilter({
//   selectedTags: initialSelectedTags = [],
//   setSelectedTags: setExternalSelectedTags,
//   variant = 'filter',
//   className,
//   isLeft = false,
//   isTop = false,
//   ...props
// }: DataTableTagFilterProps) {
//   const isControlled = !!setExternalSelectedTags;
  
//   const [internalSelectedTags, setInternalSelectedTags] = React.useState<string[]>(initialSelectedTags);
//   const [isMainPopoverOpen, setIsMainPopoverOpen] = React.useState(false);
//   const tags = isControlled ? initialSelectedTags : internalSelectedTags;
//   const { isAdmin } = useAuthentication();

//   const [createTag, { isLoading: isCreating }] = useCreateTagMutation();

//   const setTags = React.useCallback((newTags: string[]) => {
//     if (isControlled && setExternalSelectedTags) {
//       setExternalSelectedTags(newTags);
//     } else {
//       setInternalSelectedTags(newTags);
//     }
//   }, [isControlled, setExternalSelectedTags]);

//   React.useEffect(() => {
//     if (!isControlled) {
//       setInternalSelectedTags(initialSelectedTags);
//     }
//   }, [initialSelectedTags, isControlled]);

//   const [search, setSearch] = React.useState("");
//   const debouncedSearch = useDebounce(search, 600);
//   const maxDisplayCount = variant === 'dialog' ? 5 : 2;
//   const { data: tagsData, isLoading } = useGetAllTagsQuery({ search: debouncedSearch });

//   const [allKnownTags, setAllKnownTags] = React.useState<Map<string, string>>(new Map());

//   const [isNewTagPopoverOpen, setIsNewTagPopoverOpen] = React.useState(false);

//   const newTagForm = useForm<NewTagFormData>({
//     defaultValues: {
//       name: "",
//       category: "",
//       description: "",
//     },
//   });

//   const handleCreateTag = newTagForm.handleSubmit(async (data) => {
//     try {
//       const postBody = {
//         name: data.name.trim(),
//         category: data.category.trim(),
//         description: data.description.trim(),
//         status: "ACTIVE",
//       };

//       await createTag(postBody).unwrap();
      
//       toast.success(`Tag "${data.name}" created successfully!`);
//       setIsNewTagPopoverOpen(false);
//       newTagForm.reset();

//     } catch (error: any) {
//       console.error("Error creating tag:", error);
//       toast.error(error.data?.message || "Failed to create tag. Please try again.");
//     }
//   });

//   const availableTags: { value: string; label: string }[] = React.useMemo(() => {
//     if (!tagsData?.items) return [];
//     return tagsData.items.map((tag: MemeTag) => ({
//       value: tag.name,
//       label: `#${tag.name}`,
//     }));
//   }, [tagsData]);

//   const selectedTagOptions = React.useMemo(() => {
//     return tags.map((tagValue) => ({
//       value: tagValue,
//       label: allKnownTags.get(tagValue) || `#${tagValue}`,
//     }));
//   }, [tags, allKnownTags]);

//   React.useEffect(() => {
//     if (tagsData?.items) {
//       setAllKnownTags(prevMap => {
//         const newMap = new Map(prevMap);
//         tagsData.items.forEach((tag: MemeTag) => {
//           newMap.set(tag.name, `#${tag.name}`);
//         });
//         return newMap;
//       });
//     }
//   }, [tagsData]);

//   const allDisplayTags = React.useMemo(() => {
//     const combinedTags = new Map<string, { value: string; label: string }>();
//     selectedTagOptions.forEach(tag => combinedTags.set(tag.value, tag));
//     availableTags.forEach(tag => {
//         if (!combinedTags.has(tag.value)) {
//           combinedTags.set(tag.value, tag);
//         }
//     });
//     return Array.from(combinedTags.values());
//   }, [selectedTagOptions, availableTags]);

//   if (isLoading && !tagsData) {
//       return (
//         <Button variant="outline" size="sm" className="h-8 border-dashed" disabled>
//           <PlusCircle className="mr-2 h-4 w-4" />
//           Loading Tags...
//         </Button>
//       );
//     }

//   return (
//     <Popover open={isMainPopoverOpen} onOpenChange={setIsMainPopoverOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" size="sm" 
//         className={cn("h-8 border-dashed cursor-pointer", className,
//           variant === 'dialog' && "w-full justify-start overflow-hidden")}
//           {...props}>
//           <PlusCircle className="mr-2 h-4 w-4" />
//           Tags
//           {tags.length > 0 && (
//             <>
//               <div className="mx-2 h-4 w-px bg-border sm:block hidden" /> 
//               <div className="hidden space-x-1 lg:flex">
//                 {tags.length > maxDisplayCount ? ( 
//                   <Badge variant="secondary" className="rounded-sm px-1 font-normal">
//                     {tags.length} selected
//                   </Badge>
//                 ) : (
//                   selectedTagOptions
//                     .slice(0, maxDisplayCount) 
//                     .map((option) => (
//                       <Badge
//                         variant="secondary"
//                         key={option.value}
//                         className="rounded-sm px-1 font-normal"
//                       >
//                         {option.label}
//                       </Badge>
//                     ))
//                 )}
//               </div>
//             </>
//           )}
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="w-[200px] p-0 flex flex-col" align="start">
//         <Command className="flex-grow">
//           <CommandInput
//             placeholder="Search tags..."
//             value={search}
//             onValueChange={(value) => setSearch(value)}
//           />
//           <CommandList>
//             <CommandEmpty>No results found.</CommandEmpty>
            
//             <CommandGroup>
//               {allDisplayTags.map((tag) => {
//                 const isSelected = tags.includes(tag.value);
//                 return (
//                   <CommandItem
//                     key={tag.value}
//                     value={tag.label}
//                     onSelect={() => {
//                       const newTags = isSelected
//                         ? tags.filter((t) => t !== tag.value)
//                         : [...tags, tag.value];
//                       setTags(newTags);
//                       setSearch("");
//                     }}
//                   >
//                     <div
//                       className={cn(
//                         "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
//                         isSelected
//                           ? "bg-primary text-primary-foreground"
//                           : "opacity-50 [&>svg]:invisible"
//                       )}
//                     >
//                       <Check className="h-4 w-4" />
//                     </div>
//                     <span>{tag.label}</span>
//                   </CommandItem>
//                 );
//               })}
//             </CommandGroup>
            
//             {tags.length > 0 && (
//               <>
//                 <CommandSeparator />
//                 <CommandGroup>
//                   <CommandItem
//                     onSelect={() => setTags([])}
//                     className="justify-center text-center"
//                   >
//                     Clear filters
//                   </CommandItem>
//                 </CommandGroup>
//               </>
//             )}
//           </CommandList>
//         </Command>
        
//         {isAdmin && (
//             <div className="p-1 border-t">
//               <Popover open={isNewTagPopoverOpen} onOpenChange={setIsNewTagPopoverOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="w-full justify-start h-8 text-sm"
//                     onClick={() => {
//                         setIsNewTagPopoverOpen(true);
//                         setIsMainPopoverOpen(true); 
//                     }}
//                   >
//                     <ListPlus className="mr-2 h-4 w-4" />
//                     <span className="flex items-center justify-between w-full">
//                       Add Tag
//                       <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                     </span>
//                   </Button>
//                 </PopoverTrigger>

//               <PopoverContent
//                 className={cn(
//                   "p-3 absolute w-[250px] shadow-lg border bg-popover z-50",
//                   isTop ? "top-10" : "-top-70",
//                   isLeft
//                     ? "right-[calc(100%+8px)]" 
//                     : isTop ? "left-[calc(100%-200px)]" : "left-[calc(100%+8px)]"  
//                 )}
//                 align="start"
//                 side={isLeft ? "left" : "right"}   
//                 sideOffset={6}
//               >
//                   <form onSubmit={handleCreateTag} className="space-y-3">
//                     <h4 className="text-sm font-semibold mb-2">Create New Tag</h4>
                    
//                     <div className="space-y-1">
//                       <label className="text-xs font-medium">Tag Name</label>
//                       <Input
//                         {...newTagForm.register("name", { required: true, maxLength: 50 })}
//                         placeholder="e.g., Funny Cat"
//                         autoFocus
//                         className="h-8"
//                       />
//                     </div>

//                     <div className="space-y-1">
//                       <label className="text-xs font-medium">Category</label>
//                       <Input
//                         {...newTagForm.register("category", { required: true, maxLength: 50 })}
//                         placeholder="e.g., humor"
//                         className="h-8"
//                       />
//                     </div>

//                     <div className="space-y-1">
//                       <label className="text-xs font-medium">Description</label>
//                       <Textarea
//                         {...newTagForm.register("description", { maxLength: 255 })}
//                         placeholder="Tags related to funny cat memes"
//                         rows={2}
//                       />
//                     </div>
                    
//                     <Button 
//                       type="submit" 
//                       size="sm" 
//                       className="w-full"
//                       disabled={!newTagForm.formState.isValid || isCreating}
//                     >
//                       {isCreating ? "Creating..." : "Create Tag"}
//                     </Button>
//                   </form>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           )}
//       </PopoverContent>
//     </Popover>
//   );
// }

"use client";

import * as React from "react";
import { Check, PlusCircle, ChevronRight, ListPlus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGetAllTagsQuery, useCreateTagMutation } from "@/redux/services/tag";
import { useDebounce } from "@/hooks/use-debounce";
import useAuthentication from "@/hooks/use-authentication";

type TagFilterVariant = 'filter' | 'dialog';

interface NewTagFormData {
  name: string;
  category: string;
  description: string;
}

interface MemeTag {
  id: string;
  name: string;
  deletedAt: string | null;
}

interface DataTableTagFilterProps extends React.HTMLAttributes<HTMLButtonElement>{
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  variant?: TagFilterVariant;
  isLeft?: boolean;
  isTop?: boolean;
}

export function DataTableTagFilter({
  selectedTags: initialSelectedTags = [],
  setSelectedTags: setExternalSelectedTags,
  variant = 'filter',
  className,
  isLeft = false,
  isTop = false,
  ...props
}: DataTableTagFilterProps) {
  const isControlled = !!setExternalSelectedTags;
  
  const [internalSelectedTags, setInternalSelectedTags] = React.useState<string[]>(initialSelectedTags);
  const [isMainPopoverOpen, setIsMainPopoverOpen] = React.useState(false);
  const tags = isControlled ? initialSelectedTags : internalSelectedTags;
  const { isAdmin } = useAuthentication();

  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();

  const setTags = React.useCallback((newTags: string[]) => {
    if (isControlled && setExternalSelectedTags) {
      setExternalSelectedTags(newTags);
    } else {
      setInternalSelectedTags(newTags);
    }
  }, [isControlled, setExternalSelectedTags]);

  React.useEffect(() => {
    if (!isControlled) {
      setInternalSelectedTags(initialSelectedTags);
    }
  }, [initialSelectedTags, isControlled]);

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 600);
  const maxDisplayCount = variant === 'dialog' ? 5 : 2;
  const { data: tagsData, isLoading } = useGetAllTagsQuery({ search: debouncedSearch });

  const [allKnownTags, setAllKnownTags] = React.useState<Map<string, string>>(new Map());

  const [isNewTagPopoverOpen, setIsNewTagPopoverOpen] = React.useState(false);

  const newTagForm = useForm<NewTagFormData>({
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  const handleCreateTag = newTagForm.handleSubmit(async (data) => {
    try {
      const postBody = {
        name: data.name.trim(),
        category: data.category.trim(),
        description: data.description.trim(),
        status: "ACTIVE",
      };

      await createTag(postBody).unwrap();
      
      toast.success(`Tag "${data.name}" created successfully!`);
      setIsNewTagPopoverOpen(false);
      newTagForm.reset();

    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast.error(error.data?.message || "Failed to create tag. Please try again.");
    }
  });

  const availableTags: { value: string; label: string }[] = React.useMemo(() => {
    if (!tagsData?.items) return [];
    return tagsData.items.map((tag: MemeTag) => ({
      value: tag.name,
      label: `#${tag.name}`,
    }));
  }, [tagsData]);

  const selectedTagOptions = React.useMemo(() => {
    return tags.map((tagValue) => ({
      value: tagValue,
      label: allKnownTags.get(tagValue) || `#${tagValue}`,
    }));
  }, [tags, allKnownTags]);

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
    const combinedTags = new Map<string, { value: string; label: string }>();
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
    <Popover open={isMainPopoverOpen} onOpenChange={setIsMainPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" 
        className={cn("h-8 border-dashed cursor-pointer", className,
          variant === 'dialog' && "w-full justify-start overflow-hidden")}
          {...props}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tags
          {tags.length > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-border sm:block hidden" /> 
              <div className="hidden space-x-1 lg:flex">
                {tags.length > maxDisplayCount ? ( 
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {tags.length} selected
                  </Badge>
                ) : (
                  selectedTagOptions
                    .slice(0, maxDisplayCount) 
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

      <PopoverContent className="w-[200px] p-0 flex flex-col" align="start">
        <Command className="flex-grow">
          <CommandInput
            placeholder="Search tags..."
            value={search}
            onValueChange={(value) => setSearch(value)}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            <CommandGroup>
              {allDisplayTags.map((tag) => {
                const isSelected = tags.includes(tag.value);
                return (
                  <CommandItem
                    key={tag.value}
                    value={tag.label}
                    onSelect={() => {
                      const newTags = isSelected
                        ? tags.filter((t) => t !== tag.value)
                        : [...tags, tag.value];
                      setTags(newTags);
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
            
            {tags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setTags([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
        
        {isAdmin && (
            <div className="p-1 border-t">
              <Popover open={isNewTagPopoverOpen} onOpenChange={setIsNewTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-sm"
                    onClick={() => {
                        setIsNewTagPopoverOpen(true);
                        setIsMainPopoverOpen(true); 
                    }}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    <span className="flex items-center justify-between w-full">
                      Add Tag
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Button>
                </PopoverTrigger>

              <PopoverContent
                className={cn(
                  "p-3 absolute w-[250px] shadow-lg border bg-popover z-50",
                  isTop ? "top-10" : "-top-70",
                  isLeft
                    ? "right-[calc(100%+8px)]" 
                    : isTop ? "left-[calc(100%-200px)]" : "left-[calc(100%+8px)]"  
                )}
                align="start"
                side={isLeft ? "left" : "right"}   
                sideOffset={6}
              >
                  <form onSubmit={handleCreateTag} className="space-y-3">
                    <h4 className="text-sm font-semibold mb-2">Create New Tag</h4>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Tag Name</label>
                      <Input
                        {...newTagForm.register("name", { required: true, maxLength: 50 })}
                        placeholder="e.g., Funny Cat"
                        autoFocus
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Category</label>
                      <Input
                        {...newTagForm.register("category", { required: true, maxLength: 50 })}
                        placeholder="e.g., humor"
                        className="h-8"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium">Description</label>
                      <Textarea
                        {...newTagForm.register("description", { maxLength: 255 })}
                        placeholder="Tags related to funny cat memes"
                        rows={2}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="w-full"
                      disabled={!newTagForm.formState.isValid || isCreating}
                    >
                      {isCreating ? "Creating..." : "Create Tag"}
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
            </div>
          )}
      </PopoverContent>
    </Popover>
  );
}