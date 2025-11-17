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
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useCallback, useState } from "react";
import { DeleteDialog } from "@/components/dialog/delete-dialog";
import EditUserDialog from "@/components/dialog/edit-user";
import { useDeleteUserMutation } from "@/redux/services/user";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export function adminClientColumns(): ColumnDef<any>[] {
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
      accessorKey: "firstName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="First Name" />
      ),
      cell: ({ row }) => <p>{row.getValue("firstName")}</p>,
      enableSorting: false, 
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Name" />
      ),
      cell: ({ row }) => <p>{row.getValue("lastName")}</p>,
      enableSorting: false, 
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <p>{row.getValue("email")}</p>,
      enableSorting: false, 
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const val = row.getValue("createdAt");
        const date = val ? new Date(String(val)) : null;
        return <p>{date ? date.toLocaleString() : "-"}</p>;
      },
      enableSorting:false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Active" />
      ),
      cell: ({ row }) => {
        const isActive = row?.original?.status === "active";

        return (
          <Badge variant={"secondary"} className="capitalize">
            {isActive ? (
              <div className="bg-green-500 size-2 rounded-full dark:bg-green-400 mr-1" />
            ) : (
              <div className="bg-red-500 size-2 rounded-full dark:bg-red-400 mr-1" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
          </Badge>
        );
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

const ActionCell = ({ row }: any) => {
  const [deleteUser] = useDeleteUserMutation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDeleteUser = useCallback((userId: string) => {
    deleteUser(userId)
      .unwrap()
      .then((res) => {
        toast.success(res.data.message || "User deleted successfully");
      })
      .catch((err) => {
        toast.error(err?.data?.error?.message || "Something went wrong");
      });
  }, [deleteUser]);

  return (
    <>
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <EllipsisVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
              <Eye className="" size={16} />
              <span>Edit User</span>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
              <Trash2 className="text-destructive" size={16} />
              <span className="text-destructive">Delete User</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DeleteDialog
        open={showDeleteDialog}
        showTrigger={false}
        onOpenChange={setShowDeleteDialog}
        onSuccess={() => console.log("success")}
        action={async () => await handleDeleteUser(row.original.id)}
        deleteDescription="This action cannot be undone. This will permanently delete this user from our servers."
      />
      <EditUserDialog
        user={row.original}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </>
  );
};
