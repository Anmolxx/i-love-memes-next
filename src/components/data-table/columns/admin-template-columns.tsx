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
import { EllipsisVertical, Eye, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { DeleteDialog } from "@/components/dialog/delete-dialog";
import { useDeleteTemplateMutation } from "@/redux/services/template";
import { toast } from "sonner";
import { Template } from "@/utils/dtos/template.dto";
import { Checkbox } from "@/components/ui/checkbox";

export function adminTemplateColumns(): ColumnDef<Template>[] {
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => {
        const image = row.original.config.backgroundImage?.src;
        return (
          <div className="space-x-4 flex items-center">
            <img
              src={image || "https://picsum.photos/id/1/200/300"}
              alt={row.getValue("title")}
              onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://picsum.photos/id/1/200/300";
                }}
              className="h-10 w-10 rounded-md object-cover border"
            />
            <Link
              href={`/meme/${row.original.slug}`}
              className="hover:underline font-medium"
            >
              {row.getValue("title")}
            </Link>
          </div>
        );
      },
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
  const template = row.original;
  const [deleteTemplate] = useDeleteTemplateMutation();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteTemplate = useCallback(() => {
    deleteTemplate(template.id)
      .unwrap()
      .then((res) => {
        toast.success(res.data.message || "Template deleted successfully");
      })
      .catch((err) => {
        toast.error(err?.data?.error?.message || "Something went wrong");
      });
  }, [template.id, deleteTemplate]);

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
          <DropdownMenuItem className="cursor-pointer"asChild>
            <Link href={`/meme/${template.slug}`}>
              <Eye size={16} />
              View Details
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="text-destructive" size={16} />
            <span className="text-destructive cursor-pointer">Delete Template</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        showTrigger={false}
        deleteTitle="Delete Template"
        deleteDescription={`Are you sure you want to delete "${template.title}"? This action cannot be undone.`}
        action={async () => {
          await handleDeleteTemplate();
        }}
      />
    </div>
  );
};
