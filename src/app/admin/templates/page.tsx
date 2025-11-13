"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { adminTemplateColumns } from "@/components/data-table/columns/admin-template-columns";
import { useSearchParams, useRouter } from "next/navigation";
import { AddTemplateDialog } from "@/components/dialog/add-template";
import { useGetTemplatesQuery } from "@/redux/services/template"; // ✅ updated hook name
import { AdminSearchBar } from "@/components/molecules/search-bar/search";
import { TagSelector } from "@/components/community/TagsSelector";

function TemplatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Extract URL params ---
  const per_page = parseInt(searchParams.get("per_page") ?? "10");
  const page = parseInt(searchParams.get("page") ?? "1");
  const searchFromUrl = searchParams.get("search") ?? "";

  // --- Local States ---
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // --- Debounce search ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 600);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- Update URL when search or pagination changes ---
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("per_page", per_page.toString());
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, selectedTags, page, per_page, router]);

  // --- API Query ---
  const { data, isFetching } = useGetTemplatesQuery({
    page,
    limit: per_page,
    orderBy: "createdAt",
    search: debouncedSearch,
  });

  // --- Data & Table setup ---
  const tableData = data?.items ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;
  const tableColumns = useMemo(() => adminTemplateColumns(), []);
  const { table } = useDataTable({
    data: tableData,
    columns: tableColumns,
    defaultPerPage: per_page,
    pageCount: pageCount,
  });

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Templates"
          description="Manage all your meme templates here."
        />

        {/* --- Search & Actions --- */}
        <div className="flex items-center gap-3 ml-auto mt-2">
          <AdminSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={() => {}}
            isFetching={isFetching}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            inputWidth="w-80"
          />
          <TagSelector setAvailableTags={setAvailableTags} />
          <AddTemplateDialog />
        </div>
      </DashboardHeader>

      <DataTable table={table} />
      <DataTablePagination table={table} />
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
