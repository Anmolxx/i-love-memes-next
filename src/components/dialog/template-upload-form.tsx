"use client";

import { useCallback } from "react";
import { DropzoneOptions } from "react-dropzone";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/extension/file-upload";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const TemplateFormSchema = z.object({
  templateName: z
    .string({
      message: "Template name is required",
    })
    .min(2, {
      message: "Template name must be at least 2 characters.",
    })
    .max(50, {
      message: "Template name must be less than 50 characters.",
    }),
  imageFile: z
    .array(
      z
        .instanceof(File)
        .refine(
          (file) =>
            file.size <
            (parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_IN_MB as string) ||
              4) *
              1024 *
              1024,
          {
            message: "File size must be less than 4MB",
          }
        )
        .refine(
          (file) => {
            return ACCEPTED_IMAGE_TYPES.includes(file.type);
          },
          {
            message: "Only image files (JPEG, PNG, GIF, WebP) are allowed",
          }
        )
    )
    .min(1, {
      message: "Please upload an image file",
    })
    .max(1, {
      message: "Only one image file is allowed",
    }),
});

interface TemplateUploadFormProps {
  onSuccess?: () => void;
}

export function TemplateUploadForm({ onSuccess }: TemplateUploadFormProps) {
  const form = useForm<z.infer<typeof TemplateFormSchema>>({
    resolver: zodResolver(TemplateFormSchema),
    defaultValues: {
      templateName: "",
      imageFile: [],
    },
  });

  const dropzoneOptions = {
    multiple: false,
    maxFiles: 1,
    maxSize:
      (parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_IN_MB as string) || 4) *
      1024 *
      1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
  } satisfies DropzoneOptions;

  const onSubmit = async (data: z.infer<typeof TemplateFormSchema>) => {
    // For now, just console.log the data
    console.log("Template Upload Data:", {
      templateName: data.templateName,
      imageFile: data.imageFile[0], // Since we only allow one file
      fileName: data.imageFile[0]?.name,
      fileSize: data.imageFile[0]?.size,
      fileType: data.imageFile[0]?.type,
    });

    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append("templateName", data.templateName);
    // formData.append("imageFile", data.imageFile[0]);

    // Reset form on success
    form.reset();

    // Call success callback if provided
    onSuccess?.();
  };

  const { imageFile } = form.formState.errors;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Name Field */}
        <FormField
          control={form.control}
          name="templateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter template name (e.g., Funny Cat Meme)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image File Upload */}
        <FormField
          control={form.control}
          name="imageFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload Template Image</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value}
                  onValueChange={field.onChange}
                  dropzoneOptions={dropzoneOptions}
                  reSelect={true}
                >
                  <FileInput>
                    <div className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div className="text-center">
                        <p className="text-lg font-medium text-gray-900">
                          Drop your image here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports: JPEG, PNG, GIF, WebP (Max: 4MB)
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </FileInput>

                  {/* Display uploaded file */}
                  {field.value && field.value.length > 0 && (
                    <FileUploaderContent className="mt-4">
                      {field.value.map((file, i) => (
                        <FileUploaderItem
                          key={i}
                          index={i}
                          className="w-full p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm font-medium truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </FileUploaderItem>
                      ))}
                    </FileUploaderContent>
                  )}
                </FileUploader>
              </FormControl>
              <FormMessage />

              {/* Display file upload errors */}
              {imageFile && (
                <div className="text-destructive text-sm mt-2">
                  {Array.isArray(imageFile) ? (
                    imageFile.map((error: any, index: number) => (
                      <p key={index}>{error.message}</p>
                    ))
                  ) : (
                    <p>{imageFile.message}</p>
                  )}
                </div>
              )}
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-w-[120px]"
          >
            {form.formState.isSubmitting ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
