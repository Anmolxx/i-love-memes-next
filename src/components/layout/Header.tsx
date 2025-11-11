"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, Share2, Save } from "lucide-react";
import { Canvas, FabricImage, FabricText } from "fabric";
import { useAppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/auth";
import { toast } from "sonner";
import { useSaveAsTemplateMutation, useUploadFileMutation } from "@/redux/services/template";
import { usePostMemeMutation } from "@/redux/services/community";
import useAuthentication from "@/hooks/use-authentication";
import { useForm } from "react-hook-form";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
interface HeaderProps {
  canvasRef: React.RefObject<Canvas | null>;
  onReset: () => void;
  backgroundImageId?: string | null;
}

type TemplateFormData = {
  title: string;
  description: string;
};

type MemeFormData = {
  title: string;
  description: string;
};

const Header: React.FC<HeaderProps> = ({
  canvasRef,
  onReset,
  backgroundImageId,
}) => {
  const appDispatcher = useAppDispatch();
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuthentication();
  const [saveAsTemplateTrigger] = useSaveAsTemplateMutation();
  const [postMemeTrigger] = usePostMemeMutation();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [isSaveMemeOpen, setIsSaveMemeOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  

  const form = useForm<TemplateFormData>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const memeForm = useForm<MemeFormData>({
      defaultValues: {
        title: "",
        description: "",
      },
    });

  const getExportDataURL = async (): Promise<string | null> => {
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
  };

  const exportMeme = async () => {
    const dataURL = await getExportDataURL();
    if (!dataURL) {
      toast.error("Nothing to export yet");
      return;
    }

    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = dataURL;
    link.click();
    toast.success("Downloading meme.png");
  };

  const openExportModal = async () => {
    const url = await getExportDataURL();
    if (!url) {
      toast.error("Create a meme first");
      return;
    }
    setPreviewUrl(url);
    setIsExportOpen(true);
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
  
  async function handleLogout() {
    await appDispatcher(logout());
    router.push("/");
  }

  const saveAsTemplate = (data: TemplateFormData) => {
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

    console.log("Canvas JSON Data for Template:", templateData);
    saveAsTemplateTrigger({
      title: data.title.trim(),
      description: data.description.trim() || "No description provided",
      ...templateData,
    })
      .unwrap()
      .then(() => {
        toast.success("Template saved successfully!");
        setIsSaveTemplateOpen(false);
        form.reset();
      })
      .catch((error) => {
        console.error("Error saving template:", error);
        toast.error("Failed to save template. Please try again.");
      });
  };

  const [uploadFile] = useUploadFileMutation(); 
  
  const saveMeme = async (data: MemeFormData) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("No canvas found");
      return;
    }
    
    if (!previewUrl) {
      toast.error("No meme preview available");
      return;
    }
    if (!isLoggedIn) {
      toast.error("User not logged in. Please log in.");
      router.push(`/auth/login?redirect=/meme`);
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
  
      console.log("✅ Meme image uploaded, file ID:", uploadedFileId);
  
      await postMemeTrigger({
        title: data.title.trim().slice(0, 20),
        description: data.description.trim() || "No description provided",
        file: { id: uploadedFileId },
      }).unwrap();
      
      toast.success(
        <span>
          🎉 Meme saved to gallery successfully!{" "}
          <Link href="/community" className="underline font-medium text-pink-500">View your Meme</Link>
        </span>,
        {
          duration: 5000, 
        }
      );
      setIsSaveMemeOpen(false);
      setIsExportOpen(false);
      memeForm.reset();
      setPreviewUrl(null);
    } catch (error: any) {
      console.error("Error saving meme:", error);
      toast.error(
        error?.data?.errors?.title
          ? `Title error: ${error.data.errors.title}`
          : "Failed to save meme. Please try again."
      );
    }
  };
  
  
  return (
    <header className="w-full bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-6 space-y-3 md:space-y-0">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-start">
        <Link href="/" aria-label="I Love Memes">
          <div className="relative h-8 w-[140px] md:w-[180px]">
            <Image
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

      {/* Right: Buttons */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-end">
        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
              variant="outline"
            >
              Reset
              <RotateCcw className="w-4 h-4 ml-2" />
            </Button>
          </AlertDialogTrigger>
        
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset your meme?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all text, images, and edits from your current meme. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onReset();
                  setIsResetDialogOpen(false);
                  toast.info("Canvas has been reset");
                }}
                className="cursor-pointer"
              >
                Yes, Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {isLoggedIn && (
        <Button
          onClick={() => handleLogout()}
          className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
          variant="outline"
        >
          Logout
        </Button>
        )}

        {isAdmin && (
          <Dialog
            open={isSaveTemplateOpen}
            onOpenChange={setIsSaveTemplateOpen}
          >
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
                  Create a new template from your current meme design. Fill in
                  the details below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(saveAsTemplate)}
                  className="space-y-4"
                >
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
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSaveTemplateOpen(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
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
        )}

        <Button
          onClick={openExportModal}
          className="rounded-full h-10 px-6 md:px-8 text-white shadow-md text-sm md:text-base cursor-pointer"
          style={{
            backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
            boxShadow:
              "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
          }}
        >
          Save & Download
          <Download className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {isExportOpen && (
        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
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
                    No preview available
                  </div>
                )}
              </div>
      
              {/* Conditional Save Meme Form */}
              {isSaveMemeOpen && (
                <Form {...memeForm}>
                  <form
                    onSubmit={memeForm.handleSubmit(saveMeme)}
                    className="space-y-4"
                  >
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
      
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsSaveMemeOpen(false);
                          memeForm.reset();
                        }}
                        className="rounded-full h-12 px-6 md:px-8 text-white shadow-md text-sm md:text-base flex items-center justify-center"
                        style={{
                          backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                          boxShadow:
                            "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!memeForm.watch("title")?.trim()}
                        className="rounded-full h-12 px-6 md:px-8 text-white shadow-md text-sm md:text-base flex items-center justify-center cursor-progress"
                        style={{
                          backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                          boxShadow:
                            "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                        }}
                      >
                        Save Meme
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}
      
              {/* Action Buttons */}
              {!isSaveMemeOpen && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Save to Gallery Button */}
                  <Button
                    onClick={() => setIsSaveMemeOpen(true)}
                    className="rounded-full h-12 px-6 md:px-8 text-white shadow-md text-sm md:text-base flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                      boxShadow:
                        "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                    }}
                  >
                    Save to Gallery
                    <Save className="w-4 h-4 ml-2" />
                  </Button>
      
                  {/* Download Button */}
                  <Button
                    onClick={exportMeme}
                    className="rounded-full h-12 px-6 md:px-8 text-white shadow-md text-sm md:text-base flex items-center justify-center cursor-pointer"
                    style={{
                      backgroundImage: "linear-gradient(90deg,#CD01BA,#E20317)",
                      boxShadow:
                        "0 2px 8px rgba(205,1,186,0.5), 0 2px 8px rgba(226,3,23,0.5)",
                    }}
                  >
                    Download
                    <Download className="w-4 h-4 ml-2" />
                  </Button>
      
                  {/* Share Button */}
                  <Button
                    onClick={shareMeme}
                    variant="outline"
                    className="rounded-full h-12 px-6 md:px-8 text-sm md:text-base flex items-center justify-center cursor-pointer"
                  >
                    Share
                    <Share2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
};

export default Header;
