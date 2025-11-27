"use client";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag } from "@/utils/dtos/tag.dto";
import { toast } from "sonner";
import { DataTableTagFilter } from "@/components/data-table/data-table-tag-filter";
import { useGetAllTagsQuery } from "@/redux/services/tag";

interface EditDialogProps<T, Payload> {
  data: T;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getTags: (data: T) => string[];
  buildPayload: (data: T, title: string, description: string, tags: string[]) => Payload;
  onSave: (payload: Payload) => Promise<void>;
}

export function EditDialog<T, Payload>({
  data,
  open,
  onOpenChange,
  getTags,
  buildPayload,
  onSave,
}: EditDialogProps<T, Payload>) {
  const [title, setTitle] = useState((data as any).title ?? "");
  const [description, setDescription] = useState((data as any).description ?? "");
  const initialSelected = getTags(data);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelected);
  const [isSaving, setIsSaving] = useState(false);
  const { data: tagData } = useGetAllTagsQuery({ page: 1, limit: 50 });

  const finalTags: Tag[] = useMemo(() => {
    if (!tagData?.items) return [];
    return selectedTags
      .map((name) => tagData.items.find((t: Tag) => t.name === name))
      .filter(Boolean);
  }, [selectedTags, tagData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const tagNames = finalTags.map((t) => t.name);
      const payload = buildPayload(data, title, description, tagNames);
      await onSave(payload);
      onOpenChange(false);
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-6">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
          <DialogDescription>Edit the fields below and save changes.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tags</label>
            <DataTableTagFilter
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              variant="dialog"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
