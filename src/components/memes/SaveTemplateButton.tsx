"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { Canvas } from "fabric";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSaveAsTemplateMutation } from "@/redux/services/template";
import { useCreateTagMutation } from "@/redux/services/tag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTableTagFilter } from "@/components/data-table/data-table-tag-filter";

interface SaveTemplateButtonProps {
  canvasRef: React.RefObject<Canvas | null>;
  backgroundImageId?: string | null;
}

type TemplateFormData = {
  title: string;
  description: string;
}

const SaveTemplateButton: React.FC<SaveTemplateButtonProps> = ({
  canvasRef,
  backgroundImageId,
}) => {
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saveAsTemplateTrigger] = useSaveAsTemplateMutation();
  const [createTag] = useCreateTagMutation();
  const form = useForm<Omit<TemplateFormData, 'tags'>>({ 
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const saveAsTemplate = (data: Omit<TemplateFormData, 'tags'>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("No canvas found");
      return;
    }
    const canvasData = canvas.toJSON();
    const templateData = {
      config: {
        ...canvasData,
        backgroundImage: canvasData.backgroundImage
          ? {
              ...canvasData.backgroundImage,
              fileId: backgroundImageId,
            }
          : null,
      },
    };

    saveAsTemplateTrigger({
      title: data.title.trim(),
      description: data.description.trim() || "No description provided",
      tags: selectedTags, 
      ...templateData,
    })
      .unwrap()
      .then(() => {
        toast.success("Template saved successfully!");
        setIsSaveTemplateOpen(false);
        form.reset();
        setSelectedTags([]); 
      })
      .catch((error) => {
        console.error("Error saving template:", error);
        toast.error("Failed to save template. Please try again.");
      });
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsSaveTemplateOpen(open);
    if (!open) {
      setSelectedTags([]);
      form.reset();
    }
  };

  return (
    <Dialog open={isSaveTemplateOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
          variant="outline"
        >
          Save as Template
          <Save className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a new template from your current meme design. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(saveAsTemplate)}
            className="space-y-4"
          >
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter template title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter template description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Field (using DataTableTagFilter) */}
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                {/* ✨ NEW: Use the DataTableTagFilter component */}
                <DataTableTagFilter
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  variant='dialog'
                  createTagMutation={createTag} // Use the 'dialog' variant for full width and better display in the dialog
                />
              </FormControl>
            </FormItem>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleOpenChange(false); // Use the unified handler
                }}
              >
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                type="submit"
                disabled={!form.watch("title")?.trim()}
              >
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SaveTemplateButton;