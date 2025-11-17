"use client";

import { useMemo, useState, useEffect, Suspense, useCallback } from "react";
import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { adminTemplateColumns } from "@/components/data-table/columns/admin-template-columns";
import { useSearchParams, useRouter } from "next/navigation";
import { AddTemplateDialog } from "@/components/molecules/primary-buttons/creation-primary-buttons/add-template";
import {
  DataTableToolbar,
  DataTableToolbarFilters,
} from "@/components/data-table/data-table-toolbar";
import { TemplatesTableSkeleton } from "@/components/data-table/skeletons/template-skeleton";
import { useGetTemplatesQuery } from "@/redux/services/template";
import { Template } from "@/utils/dtos/template.dto";
import { useDebounce } from "@/hooks/use-debounce";

const VALID_ORDER_BY = ["createdAt", "updatedAt", "title"] as const;
type TemplateOrderBy = typeof VALID_ORDER_BY[number];
type SortOrder = "ASC" | "DESC";

function TemplatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") ?? "1");
  const tags = searchParams.getAll("tags");
  const rawLimit = Number(searchParams.get("limit") ?? "10");
  const limit = rawLimit > 50 ? 10 : rawLimit;
  const initialSearch = searchParams.get("search") ?? "";

  const rawOrderBy = searchParams.get("orderBy") as TemplateOrderBy | null;
  const orderBy: TemplateOrderBy =
    rawOrderBy && VALID_ORDER_BY.includes(rawOrderBy)
      ? rawOrderBy
      : "createdAt";

  const rawOrder = searchParams.get("order");
  const order: SortOrder =
    rawOrder === "ASC" || rawOrder === "DESC" ? rawOrder : "DESC";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 600);

  const updateUrl = useCallback(
    (
    newParams: Partial<{
      page: number;
      limit: number;
      search: string;
      tags: string[];
      orderBy: TemplateOrderBy;
      order: SortOrder;
    }>
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]
)

useEffect(() => {
  if (debouncedSearch !== initialSearch) {
    updateUrl({ search: debouncedSearch });
  }
}, [debouncedSearch]);

  const { data, isLoading } = useGetTemplatesQuery({
    page,
    limit,
    search: debouncedSearch || undefined,
    orderBy,
    order,
  });

  const tableData = data?.items ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;
  const columns = useMemo(() => adminTemplateColumns(), []);
  const { table } = useDataTable({
    data: tableData,
    columns,
    defaultPerPage: limit,
    pageCount,
  });

  const filters: DataTableToolbarFilters[] = [];

  const TemplateToolbar = (
    <DataTableToolbar<Template, TemplateOrderBy>
      table={table}
      searchPlaceholder="Filter Templates"
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
    />
  );

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Templates"
          description="Manage all your meme templates here."
        />
        <AddTemplateDialog />
      </DashboardHeader>

      {isLoading ? (
        <TemplatesTableSkeleton/>
      ) : (
        <>
          <div className="mb-6">{TemplateToolbar}</div>
          <DataTable table={table} />
        </>
      )}
    </DashboardLayout>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
