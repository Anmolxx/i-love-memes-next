"use client";

import { useMemo, Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

import { DashboardHeader, DashboardLayout, DashboardTitle } from "@/components/layout/dashboard/layout";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetMemesQuery } from "@/redux/services/meme";
import { useGetAllTagsQuery } from "@/redux/services/tag";
import { adminMemeColumns } from "@/components/data-table/columns/admin-memes-columns";
import { CreateMemeDialog } from "@/components/dialog/create-meme";
import { AdminSearchBar } from "@/components/molecules/search-bar/search"
import { TagSelector } from "@/components/community/TagsSelector";

function MemesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Existing pagination params
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  // New search + tag params
  const search = searchParams.get("search") ?? "";
  const tagsParam = searchParams.get("tags") ?? "";

  // Local state for search UI
  const [searchQuery, setSearchQuery] = useState(search);
  const [selectedTags, setSelectedTags] = useState<string[]>(tagsParam ? tagsParam.split(",") : []);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Fetch memes (with filters)
  const { data, isLoading, isFetching } = useGetMemesQuery({
    page: parseInt(page_number),
    per_page: parseInt(per_page),
    search,
    tags: selectedTags.join(","),
  });

  // Fetch all tags for dropdown/autocomplete
  const { data: tagsData } = useGetAllTagsQuery();

  useEffect(() => {
    if (tagsData?.items) setAvailableTags(tagsData.items.map((t: any) => t.name));
  }, [tagsData]);

  // Handle search + filter param sync
  const handleSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim() === "") newParams.delete("search");
    else newParams.set("search", searchQuery);

    if (selectedTags.length) newParams.set("tags", selectedTags.join(","));
    else newParams.delete("tags");

    newParams.set("page", "1"); // reset to first page on search
    router.push(`/admin/meme?${newParams.toString()}`);
  }, [searchQuery, selectedTags, router, searchParams]);

  // Existing table logic
  const tableData = data?.items ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const tableColumns = useMemo(() => adminMemeColumns(), []);

  const { table } = useDataTable({
    data: tableData,
    columns: tableColumns,
    defaultPerPage: parseInt(per_page),
    pageCount: pageCount,
  });

  return (
    <DashboardLayout>
      <DashboardHeader>
          {/* Title + Description */}
          <DashboardTitle
            title="Memes"
            description="Here you can manage all memes submitted to the community."
          />
    
          <div className="flex items-center justify-end gap-4 mt-4 mr-4">
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
            <CreateMemeDialog />
          </div>
      </DashboardHeader>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <DataTable table={table} />
          <DataTablePagination table={table} />
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
