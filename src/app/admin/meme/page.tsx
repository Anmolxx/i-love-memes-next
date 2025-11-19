"use client";

import { useMemo, Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetMemesQuery } from "@/redux/services/meme";
import { adminMemeColumns } from "@/components/data-table/columns/admin-memes-columns";
import { CreateMemeDialog } from "@/components/molecules/primary-buttons/creation-primary-buttons/create-meme";
import { Meme } from "@/utils/dtos/meme.dto";
import { MemesTableSkeleton } from "@/components/data-table/skeletons/meme-skeleton";
import {
  DataTableToolbar,
  DataTableToolbarFilters,
} from "@/components/data-table/data-table-toolbar";
import { useDebounce } from "@/hooks/use-debounce";

const VALID_ORDER_BY = [
  "createdAt",
  "updatedAt",
  "title",
  "upvotes",
  "downvotes",
  "reports",
  "trending",
  "score",
] as const;

type MemeOrderByKey = typeof VALID_ORDER_BY[number];
type SortOrder = "ASC" | "DESC";

function MemesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page") ?? "1");
  const rawLimit = Number(searchParams.get("limit") ?? "10");
  const limit = rawLimit > 50 ? 10 : rawLimit;

  const tags = searchParams.getAll("tags");

  const rawOrderBy = searchParams.get("orderBy");
  const orderBy: MemeOrderByKey =
    rawOrderBy && VALID_ORDER_BY.includes(rawOrderBy as MemeOrderByKey)
      ? (rawOrderBy as MemeOrderByKey)
      : "createdAt";

  const rawOrder = searchParams.get("order");
  const order: SortOrder =
    rawOrder === "ASC" || rawOrder === "DESC" ? rawOrder : "DESC";

  const initialSearch = searchParams.get("search") ?? "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 600);
  
  const updateUrl = useCallback(
    (
      newParams: Partial<{
        page: number;
        limit: number;
        search: string;
        tags: string[];
        orderBy: MemeOrderByKey;
        order: SortOrder;
      }>,
      resetPage = true
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      if (resetPage) params.set("page", "1");

      Object.entries(newParams).forEach(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v as string));
        } else {
          params.set(key, String(value));
        }
      });

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    if (debouncedSearch !== initialSearch) {
      updateUrl({ search: debouncedSearch });
    }
  }, [debouncedSearch, updateUrl, initialSearch]);
  
  const { data, isLoading } = useGetMemesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    tags: tags.length ? tags : undefined,
    orderBy,
    order,
  });

  const tableData = data?.items ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;
  const tableColumns = useMemo(() => adminMemeColumns(), []);
  const { table } = useDataTable({
    data: tableData,
    columns: tableColumns,
    defaultPerPage: limit,
    pageCount,
  });

  const filters: DataTableToolbarFilters[] = [];

  const MemeToolbar = (
    <DataTableToolbar<Meme, MemeOrderByKey>
      table={table}
      searchPlaceholder="Filter Content"
      filters={filters}
      serverSearchQuery={searchQuery}
      setServerSearchQuery={setSearchQuery}
      selectedTags={tags}
      setSelectedTags={(newTags) => updateUrl({ tags: newTags })}
      order={order}
      setOrder={(o) => updateUrl({ order: o })}
      orderBy={orderBy}
      setOrderBy={(ob) => updateUrl({ orderBy: ob })}
      sortableFields={VALID_ORDER_BY}
      view= "table"
    />
  );

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Memes"
          description="Here you can manage all memes submitted to the community."
        />
        <CreateMemeDialog />
      </DashboardHeader>

      {isLoading ? (
        <MemesTableSkeleton/>
      ) : (
        <>
          <div className="mb-6">{MemeToolbar}</div>
          <DataTable table={table} />
        </>
      )}
    </DashboardLayout>
  );
}

export default function MemesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MemesContent />
    </Suspense>
  );
}
