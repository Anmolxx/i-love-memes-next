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
import { EllipsisVertical, Eye, Trash2, Edit, CirclePlus } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { DeleteDialog } from "@/components/dialog/delete-dialog";
import { EditDialog } from "@/components/dialog/edit-dialog";
import { useDeleteMemeMutation, useUpdateMemeMutation } from "@/redux/services/meme";
import { toast } from "sonner";
import { Meme } from "@/utils/dtos/meme.dto";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ImagePopover } from "@/components/ui/extension/image-popover";

const MemeTitleCell = ({ meme }: { meme: Meme }) => {
  const path = meme.file?.path;
  
  const [isOpen, setIsOpen] = useState(false); 

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
        onClick={() => window.open(`/community/${meme.slug}`, "_blank")}
        className="hover:underline font-medium text-left cursor-pointer"
      >
        {meme.title}
      </button>
    </div>
  );
};


export function adminMemeColumns(): ColumnDef<Meme>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meme Title" />
      ),
      // 💡 FIX: Use the new React component here
      cell: ({ row }) => <MemeTitleCell meme={row.original} />, 
      enableSorting: false,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium truncate max-w-xs block">
          {row.getValue("description")}
        </span>
      ),
      enableSorting: false, 
      enableHiding: false,
    },
    {
      accessorKey: "Created By",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created By" />
      ),
      cell: ({ row }) => {
        const author = row.original.author;
        return (
          <span className="text-sm">
            {author?.firstName || author?.lastName
              ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
              : "Anonymous"}
          </span>
        );
      },
      enableSorting: false, 
      enableHiding: false,
    },
    {
      accessorKey: "Credentials",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Credentials" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.author.email}</span>,
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
            {displayedTags.map(tag => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1.5 rounded-lg font-medium dark:bg-[#28282B] dark:text-white border dark:border-gray-200 border-gray-900 bg-gray-200"
              >
                #{tag.name}
              </span>
            ))}
          
            {hiddenTags.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <CirclePlus className="cursor-pointer text-black dark:text-white" size={18} />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-white text-black dark:bg-[#202020] dark:text-white shadow-lg p-2 rounded-md border border-gray-200 dark:border-none"
                >
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {hiddenTags.map(tag => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-1 rounded-lg font-medium border border-transparent bg-gray-200 text-gray-800 dark:bg-black dark:text-white"
                      >
                        #{tag.name}
                      </span>
                    ))}
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
      cell: ({ row }) => <ActionCell row={row} />,
      size: 40,
    },
  ];
};

interface UpdateMemePayload {
  title?: string;
  description?: string;
  tags?: string[];
  templateId?: string;
  file?: { id: string };
  audience?: string;
}

const ActionCell = ({ row }: { row: any }) => {
  const meme: Meme = row.original;
  const [deleteMeme] = useDeleteMemeMutation();
  const [patchMeme] = useUpdateMemeMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeleteMeme = useCallback(async () => {
    try {
      await deleteMeme(meme.id).unwrap();
      toast.success("Meme deleted successfully!");
    } catch (err: any) {
      toast.error(err?.data?.error?.message || "Something went wrong");
    }
  }, [meme.id, deleteMeme]);

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/community/${meme.slug}`} target="_blank">
              <Eye size={16} /> View Meme
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
              <Edit size={16} /> <span>Edit Meme</span>
            </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="text-destructive" size={16} /> 
            <span className="text-destructive">Delete Meme</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        showTrigger={false}
        deleteTitle="Delete Meme"
        deleteDescription={`Are you sure you want to delete "${meme.title}"? This action cannot be undone.`}
        action={handleDeleteMeme}
      />

      <EditDialog
        data={meme}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        getTags={(m) => m.tags?.filter((t) => !t.deletedAt).map((t) => t.name) || []}
        buildPayload={(m, title, description, tags): UpdateMemePayload => ({
          title,
          description,
          tags,
          templateId: m.template?.id,
          file: m.file ? { id: m.file.id } : undefined,
          audience: m.audience,
        })}
        onSave={async (payload) => {
          await patchMeme({ slugOrId: meme.id, body: payload });
          toast.success("Meme updated!");
        }}
      />
    </div>
  );
};