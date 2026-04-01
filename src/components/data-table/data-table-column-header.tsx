"use client";

import { type Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, EyeOff, X, ChevronUp, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const API_SORTABLE_FIELDS = ["title", "createdAt", "lastName", "firstName", "email"];

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columnId = column.id;
  const isAPISortable = API_SORTABLE_FIELDS.includes(columnId);

  const currentOrderBy = searchParams.get("orderBy");
  const currentOrder = searchParams.get("order") as "asc" | "desc" | null;

  const sortState = currentOrderBy === columnId ? (currentOrder?.toLowerCase() as 'asc' | 'desc' | false) : false;

  if (!isAPISortable && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }
  
  const updateUrlSort = (order: 'ASC' | 'DESC' | 'RESET') => {
    if (!isAPISortable) return;

    const params = new URLSearchParams(searchParams.toString());

    if (order === 'RESET') {
      params.delete("orderBy");
      params.delete("order");
    } else {
      params.set("orderBy", columnId);
      params.set("order", order);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              sortState === "desc"
                ? "Sorted descending. Click to sort ascending."
                : sortState === "asc"
                ? "Sorted ascending. Click to sort descending."
                : "Not sorted. Click to sort ascending."
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs hover:bg-gray-100"
          >
            <span className="uppercase">{title}</span>
            {sortState === "desc" ? (
              <ChevronDown className="ml-2 size-4" aria-hidden="true" />
            ) : sortState === "asc" ? (
              <ChevronUp className="ml-2 size-4" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="ml-2 size-4" aria-hidden="true" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {isAPISortable && (
            <>
              <DropdownMenuItem
                onClick={() => updateUrlSort('ASC')}
              >
                <ChevronUp className="mr-2 size-3.5 text-muted-foreground/70" />
                ASC
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateUrlSort('DESC')}
              >
                <ChevronDown className="mr-2 size-3.5 text-muted-foreground/70" />
                DESC
              </DropdownMenuItem>
              {sortState && (
                  <DropdownMenuItem onClick={() => updateUrlSort('RESET')}>
                    <X className="mr-2 size-3.5 text-muted-foreground/70" />
                    Reset
                  </DropdownMenuItem>
                )}
            </>
          )}
          {isAPISortable && column.getCanHide() && <DropdownMenuSeparator />}
          {column.getCanHide() && (
            <DropdownMenuItem
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeOff className="mr-2 size-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}