"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";
import { DeleteDialog } from "@/components/dialog/delete-dialog";
import { useDeleteFileMutation } from "@/redux/services/uploadfile";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export interface FileItem {
  id: string;
  path: string;
}

export function adminFilesColumns(): ColumnDef<FileItem>[] {
  return [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value: boolean | "indeterminate") =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean | "indeterminate") =>
              row.toggleSelected(!!value)
            }
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File ID" />
      ),
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      enableSorting: false,
    },

    {
      accessorKey: "preview",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Preview" />
      ),
      cell: ({ row }) => {
        const path = row.original.path;

        return (
          <img
            src={path}
            alt="file preview"
            className="h-12 w-12 object-cover rounded border"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://via.placeholder.com/100?text=Preview";
            }}
          />
        );
      },
      enableSorting: false,
    },

    {
      accessorKey: "file URL",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File URL" />
      ),
      cell: ({ row }) => (
        <a
          href={row.original.path}
          className="text-blue-600 underline text-sm"
          target="_blank"
        >
          {row.original.path}
        </a>
      ),
      enableSorting: false,
    },

    {
      id: "actions",
      size: 40,
      cell: ({ row }) => <ActionCell row={row} />,
    },
  ];
}

const ActionCell = ({ row }: { row: any }) => {
  const file: FileItem = row.original;
  const [deleteFile] = useDeleteFileMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = useCallback(async () => {
    try {
      await deleteFile(file.id).unwrap();
      toast.success("File deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete file");
    }
  }, [file.id, deleteFile]);

  return (
    <div className="flex flex-col items-end gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem className="cursor-pointer" asChild>
            <a href={file.path} target="_blank" className="cursor-pointer flex gap-2">
              <Eye size={16} />
              View File
            </a>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive cursor-pointer"
          >
            <Trash2 className="text-destructive" size={16} />
            <span className="text-destructive">Delete File</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        showTrigger={false}
        deleteTitle="Delete File"
        deleteDescription={`Are you sure you want to delete this file? This action cannot be undone.`}
        action={handleDelete}
      />
    </div>
  );
};
