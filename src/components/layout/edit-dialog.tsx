"use client";
import { useState } from "react";
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
import { Meme } from "@/utils/dtos/meme.dto";
import { Tag } from "@/utils/dtos/tag.dto";
import { useCreateTagMutation } from "@/redux/services/tag"; 
import { error } from "console";
import { toast } from "sonner";

interface EditDialogProps {
  meme: Meme;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Partial<Meme>) => Promise<void>;
}

export function EditDialog({ meme, open, onOpenChange, onSave }: EditDialogProps) {
  const [title, setTitle] = useState(meme.title);
  const [description, setDescription] = useState(meme.description);
  const [tags, setTags] = useState<Tag[]>(meme.tags?.filter(tag => !tag.deletedAt) || []);
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [createTag] = useCreateTagMutation();

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ title, description, tags: tags, });
    setIsSaving(false);
    onOpenChange(false);
  };

  const addTag = async () => {
    if (!newTag.trim() || tags.length >= 2) return;

    try {
      // Call the API to create the tag
      const createdTag = await createTag({ name: newTag.trim() }).unwrap();
      setTags([...tags, createdTag]);
      setNewTag("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.error?.message || "Failed to create tag");
    }
  };

  const removeTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full p-6">
        <DialogHeader>
          <DialogTitle>Edit Meme</DialogTitle>
          <DialogDescription>Edit the fields below and save changes.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Tags section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tags (max 2)</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} disabled={!newTag.trim() || tags.length >= 2}>
                Add
              </Button>
            </div>
            <div className="flex gap-2 mt-1 flex-wrap">
              {tags.map(tag => (
                <span
                  key={tag.id}
                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full cursor-pointer"
                  onClick={() => removeTag(tag.id)}
                >
                  #{tag.name} ✕
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button className="cursor-pointer" onClick={handleSave} disabled={isSaving}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
