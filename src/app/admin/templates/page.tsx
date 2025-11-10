"use client";

import { useMemo, Suspense } from "react";
import { Metadata } from "next";
import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { OrdersPrimaryButtons } from "@/components/molecules/primary-buttons/orders";
import OrdersTable from "@/components/organisms/tables/orders-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import mockTemplates from "@/mocks/templates";
import { adminTemplateColumns } from "@/components/data-table/columns/admin-template-columns";
import { useSearchParams } from "next/navigation";
import { AddTemplateDialog } from "@/components/dialog/add-template";
import { useGetAllTemplatesQuery } from "@/redux/services/template";

// export const metadata: Metadata = {
//   title: "Orders",
//   description: "Manage your orders in the dashboard.",
// };

function TemplatesContent() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const per_page = searchParams.get("per_page") ?? "5";
  const page_number = searchParams.get("page") ?? "1";

  const query = {
    page: page_number,
    per_page: per_page,
  };

  const { data } = useGetAllTemplatesQuery(query);

  const tableData = data?.data ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const tableColumns = useMemo(() => adminTemplateColumns(), []);

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
          title="Template"
          description="Here you can manage all your meme templates."
        />
        <AddTemplateDialog />
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
