import * as React from "react";
import {
  flexRender,
  Row,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { TableVirtuoso } from "react-virtuoso";
import { HTMLAttributes } from "react";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>;
  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null;
  showPagination?: boolean;
  height: string;
}

const TableRowComponent = <TData,>(rows: Row<TData>[]) =>
  function getTableRow(props: HTMLAttributes<HTMLTableRowElement>) {
    // @ts-expect-error data-index is a valid attribute
    const index = props["data-index"];
    const row = rows[index];

    if (!row) return null;

    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        {...props}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="p-3 text-sm">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  };

export function DataTable<TData>({
  table,
  height,
  floatingBar = null,
  children,
  className,
  showPagination,
  ...props
}: DataTableProps<TData>) {
  const { rows } = table.getRowModel();

  return (
    <>
      {children}
      <TableVirtuoso
        className={cn(
          "w-full space-y-2.5 overflow-auto bg-background",
          className
        )}
        style={{ height, scrollbarWidth: "thin" }}
        totalCount={rows.length}
        components={{
          Table: Table,
          TableRow: TableRowComponent(rows),
        }}
        fixedHeaderContent={() =>
          table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="bg-primary" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className="text-background dark:text-foreground text-xs h-10 bg-primary dark:bg-background"
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))
        }
      />
    </>
  );
}
