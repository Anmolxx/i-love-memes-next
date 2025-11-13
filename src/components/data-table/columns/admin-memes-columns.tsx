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
import { EllipsisVertical, Eye, Trash2, Edit, Tag } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { DeleteDialog } from "@/components/layout/delete-dialog";
import { EditDialog } from "@/components/layout/edit-dialog";
import { useDeleteMemeMutation, useUpdateMemeMutation } from "@/redux/services/meme"; 
import { toast } from "sonner";
import { Meme } from "@/utils/dtos/meme.dto";

export function adminMemeColumns(): ColumnDef<Meme>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Meme Title" />
      ),
      cell: ({ row }) => {
        const meme = row.original;
        const image = meme.file?.path;
        return (
          <div className="space-x-4 flex items-center">
            <img
              src={image || "https://picsum.photos/id/1/200/300"}
              alt={row.getValue("title")}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://picsum.photos/id/1/200/300";
              }}
              className="h-10 w-10 rounded-md object-cover border"
            />
            <Link
              href={`/community/${meme.slug}`}
              className="hover:underline font-medium"
            >
              {row.getValue("title")}
            </Link>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: "author",
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
      accessorKey: "author.email",
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
            {/* Display first 3 tags */}
            {displayedTags.map(tag => (
              <span
                key={tag.id}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium"
              >
                #{tag.name}
              </span>
            ))}

            {/* Tooltip for remaining tags */}
            {hiddenTags.length > 0 && (
              <div className="relative group">
                <Tag size={16} className="text-gray-500 cursor-pointer" />
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 hidden group-hover:flex flex-wrap gap-1 bg-white border border-gray-200 shadow-md rounded-md p-2 z-50 min-w-[150px]">
                  {hiddenTags.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded-full font-medium"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
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
      enableHiding: false,
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionCell row={row} />,
      size: 40,
    },
  ];
};

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
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href={`/community/${meme.slug}`}>
              <Eye size={16} /> View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="text-destructive" size={16} />
            <span className="text-destructive cursor-pointer">Delete Meme</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit size={16} />
            <span className="cursor-pointer">Edit Meme</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        showTrigger={false}
        deleteTitle="Delete Meme"
        deleteDescription={`Are you sure you want to delete "${meme.title}"? This action cannot be undone.`}
        action={async () => {
          await handleDeleteMeme();
        }}
      />

      <EditDialog
        meme={meme}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={async (updated) => {
          await patchMeme({ slugOrId: meme.id, body: updated });
          toast.success("Meme updated!");
        }}
      />
    </div>
  );
};
