"use client";

import { useMemo, Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { adminFilesColumns } from "@/components/data-table/columns/admin-uploadFiles-columns";
import { useGetFilesQuery } from "@/redux/services/uploadfile"; 
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { FilesTableSkeleton } from "@/components/data-table/skeletons/file-skeleton";

type FileItem = {
  id: string;
  name: string;
  type: string;
  size?: number;
  [key: string]: any;
}

function MediaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawLimit = parseInt(searchParams.get("limit") ?? "20");
  const limit = rawLimit > 50 ? 10 : rawLimit;
  const page = parseInt(searchParams.get("page") ?? "1");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [view, setView] = useState<"table" | "gallery">("gallery");
  const viewDefaultSize = view === "gallery" ? 8 : 10;
  
  const { data, isLoading } = useGetFilesQuery({ page, limit });
  const tableData = useMemo(() => data?.items ?? [], [data?.items]);
  const pageCount = data?.meta?.totalPages ?? 0;
  const tableColumns = useMemo(() => adminFilesColumns(), []);
      

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return tableData;
    return tableData.filter((item: FileItem) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
  }, [tableData, debouncedSearch]);

  const { table: filteredTable } = useDataTable({
    data: filteredData,
    columns: tableColumns,
    defaultPerPage: limit,
    pageCount,
  });

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle
          title="Media Library"
          description="Manage uploaded files such as images and assets."
        />
      </DashboardHeader>

      {!isLoading && (
        <div className="mb-4">
          <DataTableToolbar
            table={filteredTable}
            view={view}
            setView={setView}
            searchPlaceholder="Search Media"
            serverSearchQuery={searchQuery}
            setServerSearchQuery={setSearchQuery}
          />
        </div>
      )}

      {isLoading ? <FilesTableSkeleton/> : <DataTable table={filteredTable} view={view}/>}
    </DashboardLayout>
  );
}

export default function MediaPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MediaContent />
    </Suspense>
  );
}
