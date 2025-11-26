import { X, ListChevronsUpDown, Table as TableIcon, Grid, Images, FolderOpen, Trash2 } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/data-table/data-table-col-toggle";
import { DataTableTagFilter } from "./data-table-tag-filter";
import { DataTableSort } from "./data-table-sort";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type FilterOption = {
    label: string;
    value: string;
};

export type DataTableToolbarFilters = {
    columnName: string;
    title: string;
    options: FilterOption[];
    onChange?: (selected: string[]) => void;
    onReset?: () => void;
};

const FIELD_LABELS: Record<string, string> = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
};

type DataTableToolbarProps<TData, TOrderBy extends string> = {
    table: Table<TData>;
    searchPlaceholder?: string;
    filters?: DataTableToolbarFilters[];
    serverSearchQuery?: string;
    setServerSearchQuery?: (query: string) => void;
    searchFieldOptions?: readonly string[];
    searchField?: string;
    setSearchField?: ((field: string) => void) | React.Dispatch<React.SetStateAction<any>>;
    selectedTags?: string[];
    setSelectedTags?: (tags: string[]) => void;
    order?: "ASC" | "DESC";
    setOrder?: (order: "ASC" | "DESC" | undefined) => void;
    orderBy?: TOrderBy;
    setOrderBy?: (field: TOrderBy | undefined) => void;
    sortableFields?: readonly TOrderBy[];
    view?: "table" | "gallery"; 
    setView?: (view: "table" | "gallery") => void;
    showDeleted?: boolean;
    toggleDeletedView?: () => void;
    onReset?: () => void; 
};

export function DataTableToolbar<TData, TOrderBy extends string>({
    table,
    searchPlaceholder = "Search...",
    filters,
    serverSearchQuery = "",
    setServerSearchQuery = () => {},
    searchFieldOptions,
    searchField,
    setSearchField,
    selectedTags = [],
    setSelectedTags,
    order,
    setOrder,
    orderBy,
    setOrderBy,
    sortableFields,
    view = "table",
    setView,
    showDeleted = false,
    toggleDeletedView,
    onReset,
}: DataTableToolbarProps<TData, TOrderBy>) {
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        !!serverSearchQuery ||
        (selectedTags?.length ?? 0) > 0;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
                <div className="relative w-[150px] lg:w-[250px]">
                    <Input
                        placeholder={searchPlaceholder}
                        value={serverSearchQuery}
                        onChange={(event) => setServerSearchQuery(event.target.value)}
                        className="h-8 pr-10"
                    />
                    {searchFieldOptions && setSearchField && (
                        <div className="absolute top-0 right-0 h-full flex items-center pr-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 w-8 p-0 flex items-center justify-center"
                                    >
                                        <ListChevronsUpDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-32 p-1">
                                    {searchFieldOptions.map((field) => (
                                        <DropdownMenuItem
                                            key={field}
                                            onClick={() => setSearchField(field)}
                                            className={field === searchField ? "font-semibold cursor-pointer" : "cursor-pointer"}
                                        >
                                            {FIELD_LABELS[field] || field}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

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
                                onChange={item.onChange}
                                onReset={onReset}
                            />
                        ) : null;
                    })}
                </div>

                {isFiltered && (
                    <Button
                        onClick={onReset ?? (() => {
                            table.resetColumnFilters();
                            setServerSearchQuery("");
                            if (setSelectedTags) setSelectedTags([]);
                        })}
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
                
                {view !== "gallery" && (
                    <DataTableViewOptions table={table} />
                )}

                {toggleDeletedView && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={showDeleted ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleDeletedView}
                                    className="h-8 px-2 text-xs font-semibold cursor-pointer"
                                >
                                    {showDeleted ? (
                                        <FolderOpen className="h-4 w-4 me-1" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 me-1" />
                                    )}
                                    {showDeleted ? "Active" : "Deleted"}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4} side="bottom"
                            className="bg-white text-black dark:bg-[#202020] dark:text-white shadow-lg p-2 rounded-md border border-gray-200 dark:border-none">
                                {showDeleted ? "Switch to Active Memes View" : "Switch to Recycled Memes View"}
                            </TooltipContent>
                        </Tooltip>
                    )}
                    
                {setView && (
                    <div className="flex items-center gap-2">
                        {view === "gallery" ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setView("table")}
                                        className="flex items-center justify-center cursor-pointer"
                                    >
                                        <TableIcon size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4} className="dark:bg-[#202020] border border-gray-200 dark:border-none p-2">Switch to Table View</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setView("gallery")}
                                        className="flex items-center justify-center cursor-pointer"
                                    >
                                        <Images size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4} className="dark:bg-[#202020] border border-gray-200 dark:border-none p-2">Switch to Gallery View</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}