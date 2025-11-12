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
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { DeleteDialog } from "@/components/layout/delete-dialog";
import { useDeleteMemeMutation } from "@/redux/services/meme"; 
import { toast } from "sonner";
import Image from "next/image";

export type Meme = {
  id: string;
  title: string;
  slug: string;
  description: string;
  file: { id: string; path: string };
  author: { id: string; email: string };
  createdAt: string;
  updatedAt: string;
};

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
              href={`/admin/memes/${meme.id}`}
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
}

const ActionCell = ({ row }: { row: any }) => {
  const meme = row.original;
  const [deleteMeme] = useDeleteMemeMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteMeme = useCallback(async () => {
    try {
      await deleteMeme(meme.id).unwrap();
      toast.success("Meme deleted successfully!");
    } catch (err: any) {
      toast.error(err?.data?.error?.message || "Something went wrong");
    }
  }, [meme.id, deleteMeme]);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/memes/${meme.id}`}>
              <Eye size={16} /> View Details
            </Link>
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
        action={async () => {
          await handleDeleteMeme();
        }}
      />
    </div>
  );
};

