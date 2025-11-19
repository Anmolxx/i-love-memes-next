import { flexRender, type Table as TanstackTable, type Row } from "@tanstack/react-table";
import * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import { Link } from "lucide-react";
import { Popover, PopoverTrigger } from "../ui/popover";
import { ImagePopover } from "../ui/extension/image-popover";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  view?: "table" | "gallery";
}
const GalleryItem = <TData,>({ row }: { row: Row<TData> }) => {
  const file = row.original as any;
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectCell = row.getVisibleCells().find(c => c.column.id === "select");
  const actionsCell = row.getVisibleCells().find(c => c.column.id === "actions");

  return (
    <div
      key={row.id}
      className="rounded-md border p-3 shadow-sm flex flex-col"
    >
      <div className="w-full h-40 overflow-hidden rounded-md mb-2">
        <Popover open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
          <PopoverTrigger asChild>
            <img
              src={file.path}
              alt="file preview"
              className="h-full w-full object-cover rounded border cursor-pointer"
              onClick={() => setIsOpen(true)}
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/100?text=Preview";
              }}
            />
          </PopoverTrigger>
          <ImagePopover src={file.path} />
        </Popover>
      </div>

      <a
        href={file.path}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mb-2"
      >
        <Link className="dark:text-white text-black" size={20} />
      </a>

      <div className="mt-auto flex justify-between items-center">
        {selectCell &&
          flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
        {actionsCell &&
          flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
      </div>
    </div>
  );
};

export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  view = "table",
  ...props
}: DataTableProps<TData>) {
  const rows = table.getRowModel().rows;
  const pageSize = 10;
  const tableHeight = (pageSize / 10) * 70; 
  
  return (
    <div
      className={cn("flex flex-col overflow-hidden", className)}
      {...props}
      style={{ height: `${tableHeight}vh` }}
    >
      {children}

      {/* Gallery View */}
      {view === "gallery" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-auto mb-5">
          {rows.length ? (
            rows.map((row) => (
              <GalleryItem key={row.id} row={row} />
            ))
          ) : (
            <p className="text-center py-10 col-span-full">No results.</p>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          ...getCommonPinningStyles({ column: cell.column }),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination and Action Bar */}
      <div className="flex flex-col gap-2.5 mt-auto">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}