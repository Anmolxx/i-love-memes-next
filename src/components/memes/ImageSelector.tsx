"use client";

import { useGetTemplatesQuery } from "@/redux/services/template";
import { useUploadFileMutation } from "@/redux/services/uploadfile";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import useAuthentication from "@/hooks/use-authentication";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
  onSelect: (url: string, id?: string) => void;
  onTemplateSelect?: (template: any) => void;
  selectedImage?: string | null;
  onBeforeSelect?: () => void;
}

const ImageSelector: React.FC<Props> = ({
  onSelect,
  onTemplateSelect,
  selectedImage,
  onBeforeSelect,
}) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const { isAdmin } = useAuthentication();

  const [rawSearchQuery, setRawSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [tags] = useState<string[]>([]);
  
  const debouncedSearchQuery = useDebounce(rawSearchQuery, 600); 

  const { data: templates } = useGetTemplatesQuery(
    {
      page: 1,
      limit: 50,
      search: debouncedSearchQuery,
      tags: tags,
      orderBy: "createdAt",
      order: "DESC",
    },
    {
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
    }
  );

  const handleTemplateSelect = (template: any) => {
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

  const handleClearSearch = () => {
    setRawSearchQuery("");
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    const maxSize = 4 * 1024 * 1024;
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
        onBeforeSelect?.();
        router.replace("/meme", { scroll: false });
        const formattedPath = result.file.path;
        onSelect(formattedPath, result.file.id);
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

  const hasTemplates = templates && templates.length > 0;
  const showNoResultsMessage = debouncedSearchQuery.length > 0 && !hasTemplates;

  return (
    <div className="bg-white rounded-lg h-full flex flex-col p-1 max-h-screen">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Popular Templates
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="p-2 cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        {isSearchVisible && (
          <div className="relative flex items-center mb-4">
            <Input
              placeholder="Search templates..."
              value={rawSearchQuery}
              onChange={(e) => setRawSearchQuery(e.target.value)}
              className="h-9 pr-8"
            />
            {rawSearchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 h-full px-2 py-0 hover:bg-transparent cursor-pointer"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}

        {isAdmin && (
          <Button
            onClick={handleAddImage}
            className="w-full"
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
        {/* Conditional Humourous Message for No Results */}
        {showNoResultsMessage && (
          <div className="flex flex-col items-center justify-center h-full py-10 text-center text-gray-500">
            <Search className="w-10 h-10 mb-4 text-gray-400" />
            <p className="text-xl font-semibold mb-2">
              Template Not Found! 🤯
            </p>
            {debouncedSearchQuery ? (
              <p className="max-w-xs">
                Looks like your search for **&quot;{debouncedSearchQuery}&quot;** is funnier than the results! Try a different word.
              </p>
            ) : (
              <p className="max-w-xs">
                It&apos;s surprisingly empty in here. Time to make history and **upload a new template**!
              </p>
            )}
          </div>
        )}

        {/* Templates Grid */}
        {hasTemplates && (
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template: any, idx: number) => (
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
                      (e.currentTarget as HTMLImageElement).src =
                        "/brand/ilovememes-logo.png";
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
        )}
      </div>
    </div>
  );
};

export default ImageSelector;