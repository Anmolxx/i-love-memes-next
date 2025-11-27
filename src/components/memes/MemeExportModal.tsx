"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Share2, Save } from "lucide-react";
import { Canvas, FabricImage, FabricText } from "fabric";
import { toast } from "sonner";
import { useUploadFileMutation } from "@/redux/services/uploadfile";
import { usePostMemeMutation } from "@/redux/services/meme";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import useAuthentication from "@/hooks/use-authentication";
import { DataTableTagFilter } from "@/components/data-table/data-table-tag-filter";
import { clearTemplateId } from "@/redux/slices/template";

interface MemeExportModalProps {
  canvasRef: React.RefObject<Canvas | null>;
  backgroundImageId?: string | null;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  templateId?: string | null;
}

type MemeFormData = {
  title: string;
  description: string;
};

const MemeExportModal: React.FC<MemeExportModalProps> = ({
  canvasRef,
  backgroundImageId,
  isOpen,
  onOpenChange,
  templateId,
}) => {
  const router = useRouter();
  const { isAdmin, isLoggedIn } = useAuthentication();
  const [postMemeTrigger] = usePostMemeMutation();
  const [uploadFile] = useUploadFileMutation();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaveMemeOpen, setIsSaveMemeOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); 
  const dispatch = useAppDispatch();
  
  const memeForm = useForm<MemeFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleSetSelectedTags = useCallback((newTags: string[]) => {
    if (!isAdmin && newTags.length > 2) {
      toast.error("You can only add a maximum of 2 tags to a meme.");
      setSelectedTags(newTags.slice(0, 2));
    } else {
      setSelectedTags(newTags);
    }
  }, [isAdmin]);

  const getExportDataURL = useCallback(async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    try {
      const watermarkImg = await FabricImage.fromURL("/watermark.jpg", {
        crossOrigin: "anonymous",
      });
      const maxWatermarkSize = 80;
      const scale = Math.min(
        maxWatermarkSize / watermarkImg.width!,
        maxWatermarkSize / watermarkImg.height!
      );

      watermarkImg.set({
        left: canvas.getWidth() - watermarkImg.width! * scale - 20,
        top: canvas.getHeight() - watermarkImg.height! * scale - 20,
        scaleX: scale,
        scaleY: scale,
        opacity: 0.7,
        selectable: false,
        evented: false,
        excludeFromExport: false,
      });

      canvas.add(watermarkImg);
      canvas.renderAll();

      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      canvas.remove(watermarkImg);
      canvas.renderAll();

      return dataURL;
    } catch (err) {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      console.error("Failed to load watermark image:", err);

      const textWatermark = new FabricText("ilovememes.com", {
        left: 20,
        top: canvas.getHeight() - 30,
        fontSize: 16,
        fill: "rgba(255, 255, 255, 0.8)",
        fontFamily: "Arial",
        selectable: false,
        evented: false,
        excludeFromExport: false,
        stroke: "rgba(0, 0, 0, 0.3)",
        strokeWidth: 1,
      });

      canvas.add(textWatermark);
      canvas.renderAll();

      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });

      canvas.remove(textWatermark);
      canvas.renderAll();

      return dataURL;
    }
  }, [canvasRef]);

  React.useEffect(() => {
    if (isOpen) {
      const generatePreview = async () => {
        const url = await getExportDataURL();
        if (!url) {
          toast.error("Create a meme first");
          onOpenChange(false);
          return;
        }
        setPreviewUrl(url);
      };
      generatePreview();
    } else {
      setPreviewUrl(null);
      setIsSaveMemeOpen(false);
      setSelectedTags([]); 
      memeForm.reset();
    }
  }, [isOpen, onOpenChange, getExportDataURL, memeForm]);

  const exportMeme = async () => {
    if (!previewUrl) {
      toast.error("Nothing to export yet");
      return;
    }
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = previewUrl;
    link.click();
    toast.success("Downloading meme.png");
    onOpenChange(false);
  };

  const shareMeme = async () => {
    if (!previewUrl) return;
    try {
      if (navigator.share && navigator.canShare) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        const file = new File([blob], "meme.png", { type: blob.type });
        if (navigator.canShare({ files: [file] } as any)) {
          await navigator.share({
            files: [file],
            title: "My Meme",
            text: "Check out my meme!",
          } as any);
          return;
        }
      }

      await navigator.clipboard.writeText(previewUrl);
      toast.info("Share not supported. Link copied instead.");
    } catch {
      toast.error("Share failed");
    }
  };

  const saveMeme = async (data: MemeFormData) => {
    const canvas = canvasRef.current;
    if (!canvas || !previewUrl) {
      toast.error("No canvas or preview found");
      return;
    }
  
    if (selectedTags.length > 2) {
      toast.error("You can only add a maximum of 2 tags to a meme.");
      return;
    }
    
    try {
      const canvasData = canvas.toJSON();
      const memeData = {
        config: {
          ...canvasData,
          backgroundImage: canvasData.backgroundImage
            ? { ...canvasData.backgroundImage, fileId: backgroundImageId }
            : null,
        },
      };

      // 2. Upload File
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "meme.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("file", file);

      const uploadResult = await uploadFile(formData).unwrap();
      const uploadedFileId = uploadResult?.file?.id;

      if (!uploadedFileId) {
        throw new Error("Upload failed — missing file ID");
      }
      // 3. Post Meme
      const result = await postMemeTrigger({
        title: data.title.trim().slice(0, 20),
        description: data.description.trim() || "No description provided",
        file: { id: uploadedFileId },
        templateId: templateId,
        tags: selectedTags, 
        ...memeData,
      }).unwrap();

      dispatch(clearTemplateId());

      const memeSlug = result.data?.slug;
      toast.success(
        <span>
          🎉 Meme saved to gallery successfully!{" "}
          <Link href={`/community/${memeSlug}`} className="underline font-medium text-pink-500">View your Meme</Link>
        </span>,
        { duration: 5000 }
      );
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving meme:", error);
      toast.error(
        error?.data?.errors?.title
          ? `Title error: ${error.data.errors.title}`
          : "Failed to save meme. Please try again."
      );
    }
  };

  const handleSaveToGalleryClick = () => {
    if (!isLoggedIn) {
      toast.error("User not logged in. Please log in.");
      router.push(`/auth/login?redirect=/meme`);
      return;
    }
    setIsSaveMemeOpen(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-full">
        <DialogHeader>
          <DialogTitle>Export Meme</DialogTitle>
          <DialogDescription>
            Preview your meme below. You can download it, share it, or save it to the gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Meme Preview */}
          <div className="w-full rounded-lg bg-black border border-gray-200 overflow-hidden flex justify-center items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Meme preview"
                className="max-h-[500px] object-contain"
              />
            ) : (
              <div className="p-10 text-center text-sm text-gray-500">
                Generating preview...
              </div>
            )}
          </div>

          {/* Conditional Save Meme Form */}
          {isSaveMemeOpen ? (
            <Form {...memeForm}>
              <form
                onSubmit={memeForm.handleSubmit(saveMeme)}
                className="space-y-4"
              >
                {/* Title Field */}
                <FormField
                  control={memeForm.control}
                  name="title"
                  rules={{
                    required: "Title is required",
                    maxLength: { value: 20, message: "Max 20 characters" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter meme title..."
                          {...field}
                          maxLength={20}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Description Field */}
                <FormField
                  control={memeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter meme description..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Tag Selection using DataTableTagFilter */}
                <FormItem>
                  <FormLabel>
                    Tags { !isAdmin && <span className="text-xs text-muted-foreground">(Max 2)</span> }
                  </FormLabel>
                  <FormControl>
                    <DataTableTagFilter
                      selectedTags={selectedTags}
                      setSelectedTags={handleSetSelectedTags} 
                      variant='dialog'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsSaveMemeOpen(false);
                      memeForm.reset();
                      setSelectedTags([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!memeForm.watch("title")?.trim()}
                    className="cursor-pointer"
                  >
                    Save Meme
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Button onClick={handleSaveToGalleryClick}>
                Save to Gallery <Save className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={exportMeme} className="cursor-pointer">
                Download <Download className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={shareMeme} variant="outline">
                Share <Share2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemeExportModal;
