import { X } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/molecules/data-table/datra-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-col-toggle";
import { DataTableTagFilter } from "./data-table-tag-filter";
import { DataTableSort } from "./data-table-sort";

export type FilterOption = {
  label: string;
  value: string;
};

export type DataTableToolbarFilters = {
  columnName: string;
  title: string;
  options: FilterOption[];
};

type DataTableToolbarProps<TData, TOrderBy extends string> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  filters?: DataTableToolbarFilters[];
  serverSearchQuery?: string;
  setServerSearchQuery?: (query: string) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  order?: "ASC" | "DESC";
  setOrder?: (order: "ASC" | "DESC" | undefined) => void;
  orderBy?: TOrderBy;
  setOrderBy?: (field: TOrderBy | undefined) => void;
  sortableFields?: readonly TOrderBy[];
};

export function DataTableToolbar<TData, TOrderBy extends string>({
  table,
  searchPlaceholder = "Search...",
  filters,
  serverSearchQuery = "",
  setServerSearchQuery = () => {},
  selectedTags = [],
  setSelectedTags,
  order,
  setOrder,
  orderBy,
  setOrderBy,
  sortableFields,
}: DataTableToolbarProps<TData, TOrderBy>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!serverSearchQuery ||
    (selectedTags?.length ?? 0) > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={searchPlaceholder}
          value={serverSearchQuery}
          onChange={(event) => setServerSearchQuery(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          {setSelectedTags && (
            <DataTableTagFilter
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          )}

          {filters?.map((item) => {
            const column = table.getColumn(item.columnName);
            return column ? (
              <DataTableFacetedFilter
                key={item.columnName}
                column={column}
                title={item.title}
                options={item.options}
              />
            ) : null;
          })}
        </div>

        {isFiltered && (
          <Button
            onClick={() => {
              table.resetColumnFilters();
              setServerSearchQuery("");
              if (setSelectedTags) setSelectedTags([]);
            }}
            className="h-8 w-fit px-2"
          >
            Reset
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-x-2">
        {sortableFields && (
          <DataTableSort<TOrderBy>
            order={order}
            setOrder={setOrder}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
            sortableFields={sortableFields}
          />
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
