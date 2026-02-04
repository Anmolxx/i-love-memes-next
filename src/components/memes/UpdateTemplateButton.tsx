"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Canvas } from "fabric";
import { toast } from "sonner";
import { EditDialog } from "@/components/dialog/edit-dialog";
import {  useGetTemplateByIdOrSlugQuery, useUpdateTemplateMutation } from "@/redux/services/template";
import { Template } from "@/utils/types/template";

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
  
  const templateData = template?.data;
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
        data={templateData as Template}
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
          let canvasConfigJson = null;

          if (canvasRef?.current) {
            canvasConfigJson = canvasRef.current.toJSON();
          }

          const finalPayload = {
            ...payload,
            config: canvasConfigJson || undefined,
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
