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
import { EllipsisVertical, Eye, Trash2, Edit, CirclePlus, BarChart3, Undo2, Eraser } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { ConfirmationDialog } from "@/components/dialog/confirmation-dialog";
import { EditDialog } from "@/components/dialog/edit-dialog";
import { useDeleteMemeMutation, usePermanentDeleteMemeMutation, useRestoreMemeMutation, useUpdateMemeMutation } from "@/redux/services/meme";
import { toast } from "sonner";
import { Meme } from "@/utils/types/meme";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { ImagePopover } from "@/components/ui/extension/image-popover";
import { InteractionSummaryDialog } from "@/components/dialog/InteractionSummary";

interface UpdateMemePayload {
  title?: string;
  description?: string;
  tags?: string[];
  templateId?: string;
  file?: { id: string };
  audience?: string;
}

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
      id: "interactionReason",
      accessorFn: (row) => {
        const summary = row.interactionSummary;
        if (!summary?.userInteractions?.length) return "";
        const reasons = summary.userInteractions
          .map((i) => i.reason)
          .filter((r) => r); 
        return reasons.join(",");
      },
      header: () => null,  
      cell: () => null,   
      enableSorting: false,
      enableHiding: false,
      size: 0, 
      maxSize: 0, 
      minSize: 0,
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
                 href={`/community/?tags=${tag.name}`}
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
                            href={`/community/?tags=${tag.name}`}
                            target="_blank"
                            className="hover:opacity-80 transition-opacity py-2"
                          ><span
                        key={tag.id}
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
      id: "interactionSummaryCounts", 
      accessorFn: (row) => {
        const summary = row.interactionSummary;
        if (!summary) return "";
        const counts: string[] = [];
        if (summary.upvoteCount > 0) counts.push("UPVOTE");
        if (summary.downvoteCount > 0) counts.push("DOWNVOTE");
        if (summary.reportCount > 0) counts.push("REPORT");
        if (summary.flagCount > 0) counts.push("FLAG");
        return counts.join(",");
      },
      header: () => null, 
      cell: () => null,    
      enableSorting: false,
      enableHiding: false,
      size: 0, 
      minSize: 0,
      maxSize: 0, 
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
      id: "reported",
      accessorFn: (row) => {
        const summary = row.interactionSummary;
        if (!summary) return "";
        return summary?.reportCount > 0;
      },
      header: () => null, 
      cell: () => null,   
      enableSorting: false,
      enableHiding: false,
      size: 0, 
      maxSize: 0,
      minSize: 0, 
    },
    {
      id: "actions",
      cell: ({ row }) => <MemeActionCell row={row} />,
      size: 40,
    },
  ];
};

const MemeActionCell = ({ row }: { row: any }) => {
  const meme: Meme = row.original;
  const isDeleted = !!meme.deletedAt;

  const [deleteMeme] = useDeleteMemeMutation();
  const [patchMeme] = useUpdateMemeMutation();

  const [restoreMeme] = useRestoreMemeMutation();
  const [permanentDeleteMeme] = usePermanentDeleteMemeMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] =
    useState(false);

  const handleSoftDeleteMeme = useCallback(async () => {
    try {
      await deleteMeme(meme.id).unwrap();
      toast.success("Meme deleted successfully! (Sent to trash)");
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [meme.id, deleteMeme]);

  const handleRestoreMeme = useCallback(async () => {
    try {
      await restoreMeme(meme.id).unwrap();
      toast.success(`Meme "${meme.title}" has been restored!`);
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [meme.id, meme.title, restoreMeme]);

  const handlePermanentDeleteMeme = useCallback(async () => {
    try {
      await permanentDeleteMeme(meme.id).unwrap();
      toast.success(`Meme "${meme.title}" has been permanently deleted.`);
    } catch (err: any) {
      const apiError = err?.data;
      if (apiError?.errors && typeof apiError.errors === "object") {
        Object.values(apiError.errors).forEach((msg: any) => { if (typeof msg === "string") toast.error(msg); });
      } else if (apiError?.message) toast.error(apiError.message);
      else toast.error("Failed to update user");
    }
  }, [meme.id, meme.title, permanentDeleteMeme]);

  const menuItems = isDeleted ? (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowRestoreDialog(true)}
      >
        <Undo2 className="text-primary" size={16} />
        <span className="text-primary">Restore Meme</span>
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
      <DropdownMenuItem className="cursor-pointer" onClick={() => setShowStats(true)}>
        <BarChart3 size={16} /> <span>View Analytics</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer" asChild>
        <Link href={`/community/${meme.slug}`} target="_blank">
          <Eye size={16} /> View Meme
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowEditDialog(true)}
      >
        <Edit size={16} /> <span>Edit Meme</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="text-destructive" size={16} />
        <span className="text-destructive">Delete Meme</span>
      </DropdownMenuItem>
    </>
  );

  return (
    <div className="flex flex-col items-end gap-1">
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
        deleteTitle="Delete Meme"
        deleteDescription={`Are you sure you want to move "${meme.title}" to the Recycle Bin.`}
        action={handleSoftDeleteMeme}
        confirmButtonText="Delete"
        variant="destructive"
      />

      <ConfirmationDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        showTrigger={false}
        deleteTitle="Confirm Restoration"
        deleteDescription={`Are you sure you want to restore "${meme.title}"? It will become visible in the active memes list again.`}
        action={handleRestoreMeme}
        confirmButtonText="Restore"
        variant="default"
      />

      <ConfirmationDialog
        open={showPermanentDeleteDialog}
        onOpenChange={setShowPermanentDeleteDialog}
        showTrigger={false}
        deleteTitle="Permanently Erase Meme"
        deleteDescription={`WARNING: Are you absolutely sure you want to PERMANENTLY delete "${meme.title}"? This action cannot be undone and the meme will be erased.`}
        action={handlePermanentDeleteMeme}
        confirmButtonText="Permanently Erase"
        variant="destructive"
      />

      <EditDialog
        data={meme}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        getTags={(m) =>
          m.tags?.filter((t) => !t.deletedAt).map((t) => t.name) || []
        }
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

      <InteractionSummaryDialog
        open={showStats}
        onOpenChange={setShowStats}
        summary={meme.interactionSummary}
      />
    </div>
  );
};
