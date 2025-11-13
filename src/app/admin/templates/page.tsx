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
import { useGetAllTemplatesQuery } from "@/redux/services/template";
import { AdminSearchBar } from "@/components/molecules/search-bar/search";
import { TagSelector } from "@/components/community/TagsSelector";

function TemplatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = Object.fromEntries(searchParams);
  const per_page = searchParams.get("per_page") ?? "5";
  const page_number = searchParams.get("page") ?? "1";

  // --- Search + Tags State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // --- Debounced Search ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 600);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- Reset page to 1 when search or tags change ---
  useEffect(() => {
    router.push(`?page=1&per_page=${per_page}`);
  }, [debouncedSearch, selectedTags, per_page, router]);

  // --- API Query ---
  const query = {
    page: page_number,
    per_page,
    search: debouncedSearch,
    tags: selectedTags.join(","),
  };

  const { data, isFetching } = useGetAllTemplatesQuery(query);

  const tableData = data?.items ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const tableColumns = useMemo(() => adminTemplateColumns(), []);
  const { table } = useDataTable({
    data: tableData,
    columns: tableColumns,
    defaultPerPage: parseInt(per_page),
    pageCount: pageCount,
  });

  // --- Handle Search Button ---
  const handleSearch = () => {
    router.push(`?page=1&per_page=${per_page}&search=${searchQuery}`);
  };

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Template"
          description="Here you can manage all your meme templates."
        />

        {/* --- Admin Search Bar --- */}
        <div className="flex items-center gap-3 ml-auto mt-2">
          <AdminSearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
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
