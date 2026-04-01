"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Eye, Trash2, Edit, CirclePlus, Eraser, Undo2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { ConfirmationDialog } from "@/components/dialog/confirmation-dialog";
import { useDeleteTemplateMutation, usePermanentDeleteTemplateMutation, useRestoreTemplateMutation } from "@/redux/services/template";
import { toast } from "sonner";
import { Template } from "@/utils/types/template";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ImagePopover } from "@/components/ui/extension/image-popover";
import React from "react";

const TemplateTitleCell = ({ template }: { template: Template }) => {
  const path = template.config.backgroundImage?.src;
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="space-x-4 flex items-center">
      <Popover open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <PopoverTrigger asChild>
          <img
            src={path}
            alt="file preview"
            className="h-10 w-10 object-cover rounded border cursor-pointer"
            onClick={() => setIsOpen(true)}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/100?text=Preview";
            }}
          />
        </PopoverTrigger>
        <ImagePopover src={path} />
      </Popover>
      <button
        onClick={() => window.open(`/meme/${template.slug}`, "_blank")}
        className="hover:underline font-medium text-left cursor-pointer"
      >
        {template.title}
      </button>
    </div>
  );
};

export function adminTemplateColumns(): ColumnDef<Template>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => <TemplateTitleCell template={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm font-medium truncate max-w-xs block">
            {row.getValue("description")}
          </span>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
        id: "tags",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tags" />
        ),
        cell: ({ row }) => {
          const tags = row.original.tags?.filter(tag => !tag.deletedAt) ?? [];
          const displayedTags = tags.slice(0, 2);
          const hiddenTags = tags.slice(2);
          return (
                <div className="flex items-center gap-1">
                  {displayedTags.map(tag => {
                    const hasName = tag.name && tag.name.length > 0;
                    const tagClassName =
                      "text-xs px-2 py-1.5 rounded-lg font-medium dark:bg-[#28282B] dark:text-white border dark:border-gray-200 border-gray-900 bg-gray-200";
                    return hasName ? (
                      <Link
                        key={tag.slug}
                        href={`/templates/?tags=${tag.name}`}
                        target="_blank"
                        className="hover:opacity-80 transition-opacity"
                      >
                        <span className={tagClassName}>#{tag.name}</span>
                      </Link>
                    ) : (
                      <span key={tag.id} className={tagClassName}>
                        #Invalid Tag
                      </span>
                    );
                  })}
                   {hiddenTags.length > 0 && (
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <CirclePlus className="cursor-pointer text-black dark:text-white" size={18} />
                       </TooltipTrigger>
                       <TooltipContent
                         side="top"
                         className="bg-white text-black dark:bg-[#202020] dark:text-white shadow-lg p-2 rounded-md border border-gray-200 dark:border-none"
                       >
                         <div className="flex flex-wrap gap-2 max-w-[200px]">
                           {hiddenTags.map(tag => {
                             const hasName = tag.name && tag.name.length > 0;
                             return hasName ? (
                               <Link key={tag.slug}
                                   href={`/templates/?tags=${tag.name}`}
                                   target="_blank"
                                   className="hover:opacity-80 transition-opacity py-2"
                                 ><span
                               className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800 dark:bg-black dark:text-white"
                             >#{tag.name}
                             </span></Link>
                           ): (
                           <span key={tag.id} className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800 dark:bg-black dark:text-white">
                             #Invalid Tag
                           </span>
                         );
                         })}
                         </div>
                       </TooltipContent>
                     </Tooltip>
                   )}
                 </div>  
               );
             },
      enableSorting: false,
      enableHiding: false, 
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <p>{date.toLocaleString()}</p>;
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return <ActionCell row={row} />;
      },
      size: 40,
    },
  ];
}

const ActionCell = ({ row }: { row: any }) => {
  const template: Template = row.original;
  const isDeleted = !!template.deletedAt;
  const [deleteTemplate] = useDeleteTemplateMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [restoreTemplate] = useRestoreTemplateMutation();
  const [permanentDeleteTemplate] = usePermanentDeleteTemplateMutation();
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] =
      useState(false);

  const handleSoftDeleteTemplate = useCallback(async () => {
    try {
        await deleteTemplate(template.id).unwrap();
        toast.success("Template deleted successfully!");
      } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [template.id, deleteTemplate]);

  const handleRestoreTemplate = useCallback(async () => {
    try {
      await restoreTemplate(template.id).unwrap();
      toast.success(`Template "${template.title}" has been restored!`);
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [template.id, template.title, restoreTemplate]);

  const handlePermanentDeleteTemplate = useCallback(async () => {
    try {
      await permanentDeleteTemplate(template.id).unwrap();
      toast.success(`Template "${template.title}" has been permanently deleted.`);
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [template.id, template.title, permanentDeleteTemplate]);

  const menuItems = isDeleted ? (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowRestoreDialog(true)}
      >
        <Undo2 className="text-primary" size={16} />
        <span className="text-primary">Restore Template</span>
      </DropdownMenuItem>
  
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowPermanentDeleteDialog(true)}
      >
        <Eraser className="text-destructive" size={16} />
        <span className="text-destructive">Permanently Erase</span>
      </DropdownMenuItem>
    </>
  ) : (
    <>
      <DropdownMenuItem className="cursor-pointer" asChild>
        <Link href={`/meme/${template.slug}`} target="_blank">
          <Eye size={16} /> View Template
        </Link>
      </DropdownMenuItem>
  
      <DropdownMenuItem
        className="cursor-pointer"
      >
        <Link href={`/meme/${template.slug}`} target="_blank" className="flex items-center gap-2.5 w-full h-full">
          <Edit size={16} /> <span>Edit Template</span>
        </Link>
      </DropdownMenuItem>
  
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="text-destructive" size={16} />
        <span className="text-destructive">Delete Template</span>
      </DropdownMenuItem>
    </>
  );
  
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{menuItems}</DropdownMenuContent>
      </DropdownMenu>
  
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        showTrigger={false}
        deleteTitle="Delete Template"
        deleteDescription={`Are you sure you want to move "${template.title}" to the Recycle Bin.`}
        action={handleSoftDeleteTemplate}
        confirmButtonText="Delete"
        variant="destructive"
      />
  
      <ConfirmationDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        showTrigger={false}
        deleteTitle="Confirm Restoration"
        deleteDescription={`Are you sure you want to restore "${template.title}"? It will become visible in the active list again.`}
        action={handleRestoreTemplate}
        confirmButtonText="Restore"
        variant="default"
      />
  
      <ConfirmationDialog
        open={showPermanentDeleteDialog}
        onOpenChange={setShowPermanentDeleteDialog}
        showTrigger={false}
        deleteTitle="Permanently Erase Template"
        deleteDescription={`WARNING: Are you absolutely sure you want to PERMANENTLY erase "${template.title}"? This action cannot be undone.`}
        action={handlePermanentDeleteTemplate}
        confirmButtonText="Permanently Erase"
        variant="destructive"
      />
    </div>
  );
};