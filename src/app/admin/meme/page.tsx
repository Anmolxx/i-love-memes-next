"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader, DashboardLayout, DashboardTitle } from "@/components/layout/dashboard/layout";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { useGetCommunityMemesQuery } from "@/redux/services/meme";
import { adminMemeColumns } from "@/components/data-table/columns/admin-memes-columns";
import { CreateMemeDialog } from "@/components/dialog/create-meme";

function MemesContent() {
  const searchParams = useSearchParams();
  const per_page = searchParams.get("per_page") ?? "10";
  const page_number = searchParams.get("page") ?? "1";

  const query = {
    page: parseInt(page_number),
    per_page: parseInt(per_page),
  };

  const { data, isLoading } = useGetCommunityMemesQuery(query);

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
        <DashboardTitle
          title="Memes"
          description="Here you can manage all memes submitted to the community."
        />
        <CreateMemeDialog/>
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
