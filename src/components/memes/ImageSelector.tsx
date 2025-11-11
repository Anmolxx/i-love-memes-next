"use client";

import {
  useGetTemplatesQuery,
  useUploadFileMutation,
} from "@/redux/services/template";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import useAuthentication from "@/hooks/use-authentication";

interface Props {
  onSelect: (url: string, id?: string) => void;
  onTemplateSelect?: (template: any) => void; 
  selectedImage?: string | null;
}

const ImageSelector: React.FC<Props> = ({
  onSelect,
  onTemplateSelect,
  selectedImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const { isAdmin } = useAuthentication();

  const { data: templates } = useGetTemplatesQuery(undefined, {
    selectFromResult: ({ data }) => {
      return {
        data:
          data?.items?.map((template: any) => {
            
            const backgroundImage = template.config?.backgroundImage;
            let previewUrl = null;

            if (backgroundImage?.src) {
              previewUrl = backgroundImage.src;
            }

            return {
              id: template.id,
              title: template.title,
              description: template.description,
              slug: template.slug,
              previewUrl,
              config: template.config, 
              backgroundImage: backgroundImage,
            };
          }) || [],
      };
    },
  });

  const handleTemplateSelect = (template: any) => {
    console.log("template", template);
    
    if (!template.previewUrl) return;
    if (template.previewUrl) {
      if (template.slug && onTemplateSelect) {
        onTemplateSelect(template);
      }
      onSelect(template.previewUrl, template.id);
    }
  };

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const acceptedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!acceptedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (4MB limit)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 4MB");
      return;
    }

    try {
      toast.info("Uploading image...");

      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadFile(formData).unwrap();

     
      if (result.file && result.file.path) {
        toast.success("Image uploaded successfully!");
       
        const formattedPath = result.file.path;
        onSelect(formattedPath, result.file.id);
        console.log("Uploaded file data:", result.file);
        console.log("Formatted path:", formattedPath);
        console.log("File ID:", result.file.id);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
    
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  return (
    <div className="bg-white rounded-lg h-full flex flex-col p-1 max-h-screen">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">
          Popular Templates
        </h2>
        {isAdmin && (
          <Button
            onClick={handleAddImage}
            className="mt-2 w-full"
            variant="outline"
            disabled={isUploading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Image"}
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="grid grid-cols-2 gap-3">
          {templates?.map((template: any, idx: number) => (
            <div
              key={template.id || idx}
              className={`cursor-pointer border-2 rounded-lg overflow-hidden aspect-square bg-gray-50 transition-all hover:shadow-md ${
                selectedImage === template.previewUrl
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleTemplateSelect(template)}
              title={template.title}
            >
              {template.previewUrl ? (
                <img
                  src={template.previewUrl}
                  alt={template.title || `template-${idx}`}
                  onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/brand/ilovememes-logo.png"; 
                    }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  <span className="text-sm text-center p-2">
                    {template.title || "No Preview"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;
