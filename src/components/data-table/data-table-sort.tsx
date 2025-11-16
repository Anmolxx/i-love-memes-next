"use client";

import { ArrowDownUp, Trash2, ChevronsUpDown, ChevronDown } from "lucide-react";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DataTableSortProps<TOrderBy extends string> = {
  order?: "ASC" | "DESC";
  setOrder?: (order: "ASC" | "DESC" | undefined) => void;
  orderBy?: TOrderBy;
  setOrderBy?: (field: TOrderBy | undefined) => void;
  sortableFields: readonly TOrderBy[];
  fieldLabels?: Record<TOrderBy, string>;
};

const DEFAULT_FIELD_LABELS = {
  createdAt: "Date Created",
  updatedAt: "Date Updated",
  title: "Title",
  upvotes: "Upvotes",
  downvotes: "Downvotes",
  reports: "Reports",
  trending: "Trending",
  score: "Score",
} as const;

const ORDER_OPTIONS = [
  { label: "ASC", value: "ASC" },
  { label: "DESC", value: "DESC" },
];

export function DataTableSort<TOrderBy extends string>({
  order,
  setOrder,
  orderBy,
  setOrderBy,
  sortableFields,
  fieldLabels = DEFAULT_FIELD_LABELS as Record<TOrderBy, string>,
}: DataTableSortProps<TOrderBy>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const DEFAULT_ORDER_BY = sortableFields[0];
  const DEFAULT_ORDER: "ASC" | "DESC" = "DESC";

  const currentOrderBy =
    orderBy ??
    (searchParams.get("orderBy") as TOrderBy) ??
    DEFAULT_ORDER_BY;

  const currentOrder =
    order ??
    (searchParams.get("order") as "ASC" | "DESC") ??
    DEFAULT_ORDER;

  const [open, setOpen] = React.useState(false);

  const updateURL = React.useCallback(
    (newOrderBy?: TOrderBy, newOrder?: "ASC" | "DESC") => {
      const params = new URLSearchParams(searchParams.toString());

      if (!newOrderBy || !newOrder) {
        params.delete("orderBy");
        params.delete("order");
      } else {
        params.set("orderBy", newOrderBy);
        params.set("order", newOrder);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleDeleteSort = React.useCallback(() => {
    setOrder?.(undefined);
    setOrderBy?.(undefined);
    updateURL(undefined, undefined);
    setOpen(false);
  }, [setOrder, setOrderBy, updateURL]);

  const handleResetSort = React.useCallback(() => {
    setOrder?.(DEFAULT_ORDER);
    setOrderBy?.(DEFAULT_ORDER_BY);
    updateURL(DEFAULT_ORDER_BY, DEFAULT_ORDER);
  }, [setOrder, setOrderBy, updateURL, DEFAULT_ORDER_BY]);

  const handleUpdate = React.useCallback(
    (key: "orderBy" | "order", value: string) => {
      const newOrderBy =
        key === "orderBy" ? (value as TOrderBy) : currentOrderBy;
      const newOrder = key === "order" ? (value as "ASC" | "DESC") : currentOrder;
      setOrderBy?.(newOrderBy);
      setOrder?.(newOrder);
      updateURL(newOrderBy, newOrder);
    },
    [currentOrderBy, currentOrder, setOrder, setOrderBy, updateURL]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 font-normal cursor-pointer rounded-md"
        >
          <ArrowDownUp className="mr-1 h-4 w-4" />
          Sort
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-4 flex flex-col gap-3" align="end">
        <p className="font-medium text-base text-black dark:text-white">
          Sort Data By
        </p>

        <div className="flex items-center gap-2">


          <Select
            value={currentOrderBy}
            onValueChange={(v) => handleUpdate("orderBy", v)}
          >
            <SelectTrigger hideIcon className="h-8 w-[180px] rounded-md pr-10 relative">
              <SelectValue placeholder="Select field" />
              <ChevronsUpDown className="absolute right-3 h-4 w-4 opacity-60" />
            </SelectTrigger>

            <SelectContent>
              {sortableFields.map((f) => (
                <SelectItem key={f} value={f}>
                  {fieldLabels[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentOrder}
            onValueChange={(v) => handleUpdate("order", v)}
          >
            <SelectTrigger hideIcon className="h-8 w-[120px] rounded-md pr-10 relative">
              <SelectValue placeholder="Order" />
              <ChevronDown className="absolute right-3 h-4 w-4 opacity-60" />
            </SelectTrigger>

            <SelectContent>
              {ORDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md cursor-pointer"
            onClick={handleDeleteSort}
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            className="rounded-md cursor-pointer"
            onClick={handleResetSort}
          >
            Reset Sorting
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
