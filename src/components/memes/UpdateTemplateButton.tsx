"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Canvas } from "fabric";
import { toast } from "sonner";
import { EditDialog } from "@/components/dialog/edit-template";
import {  useGetTemplateByIdOrSlugQuery, useUpdateTemplateMutation } from "@/redux/services/template";

interface UpdateTemplateButtonProps {
  canvasRef: React.RefObject<Canvas | null>;
  templateSlug: string;
  backgroundImageId?: string | null;
}

export default function UpdateTemplateButton({
  canvasRef,
  templateSlug,
  backgroundImageId,
}: UpdateTemplateButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { data: template, isLoading } =  useGetTemplateByIdOrSlugQuery(templateSlug);
  const [updateTemplate] = useUpdateTemplateMutation();
  
  if (isLoading) return null;
  if (!template) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="rounded-full cursor-pointer h-10 px-4 md:px-6 border-[#1E085C] text-[#1E085C] text-sm md:text-base"
      >
        <Edit size={16} />
        <span>Update Template</span>
      </Button>

      <EditDialog
        data={template}
        open={showDialog}
        onOpenChange={setShowDialog}
        getTags={(t) =>
          t.tags
            ?.filter((tag: any) => !tag.deletedAt)
            .map((tag: any) => tag.name) || []
        }
        buildPayload={(t, title, description, tags) => ({
          title,
          description,
          tags,
          backgroundImageId,
        })}
        onSave={async (payload) => {
          let imageDataUrl = null;

          if (canvasRef?.current) {
            imageDataUrl = canvasRef.current.toDataURL({
              format: "png",
              quality: 1,
              multiplier: 1,
            });
          }

          const finalPayload = {
            ...payload,
            preview: imageDataUrl || undefined,
          };

          await updateTemplate({
            slugOrId: templateSlug,
            body: finalPayload,
          });

          toast.success("Template updated!");
        }}
      />
    </>
  );
}
