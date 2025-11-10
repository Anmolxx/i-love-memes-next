"use client";

import { useMemo, Suspense } from "react";
import { Metadata } from "next";
import { useSearchParams } from "next/navigation";
import { adminClientColumns } from "@/components/data-table/columns/admin-clients-columns";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
// import { CustomersPrimaryButtons } from "@/components/molecules/primary-buttons/customers";
// import CustomersTable from "@/components/organisms/tables/customers-table";
import { useDataTable } from "@/hooks/use-data-table";
import { CreateClientDialog } from "@/components/dialog/create-user";
import { useGetUsersQuery } from "@/redux/services/user";

// export const metadata: Metadata = {
//   title: "Customers",
//   description: "Manage your all your customers.",
// };

function UsersContent() {
  const searchParams = useSearchParams();
  const params = Object.fromEntries(searchParams);
  const per_page = searchParams.get("per_page") ?? "5";
  const page_number = searchParams.get("page") ?? "1";

  const query = {
    page: page_number,
    per_page: per_page,
  };

  const { data } = useGetUsersQuery(query);

  const tableData = data?.data ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const tableColumns = useMemo(() => adminClientColumns(), []);

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
          title="Users"
          description="Manage your all your users."
        />
        <CreateClientDialog />
      </DashboardHeader>
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UsersContent />
    </Suspense>
  );
}
