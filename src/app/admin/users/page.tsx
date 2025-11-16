"use client";

import { useMemo, Suspense, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { adminClientColumns } from "@/components/data-table/columns/admin-clients-columns";
import { DataTable } from "@/components/data-table/data-table";
import {
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { useDataTable } from "@/hooks/use-data-table";
import { CreateClientDialog } from "@/components/dialog/create-user";
import { useGetUsersQuery } from "@/redux/services/user";
import {
  DataTableToolbar,
  DataTableToolbarFilters,
} from "@/components/data-table/data-table-toolbar";

type UserOrderBy = "createdAt" | "updatedAt" | "title";

const VALID_ORDER_BY = ["createdAt", "updatedAt", "title"] as const;

function UsersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawPage = searchParams.get("page") ?? "1";
  const rawLimit = searchParams.get("limit") ?? "10";

  const page = Math.max(1, parseInt(rawPage));
  const limit = (() => {
    const l = parseInt(rawLimit);
    return isNaN(l) || l < 1 || l > 50 ? 10 : l;
  })();

  const { data, isLoading } = useGetUsersQuery({ page, limit });

  const tableData = data?.data ?? [];
  const pageCount = data?.meta?.totalPages ?? 0;

  const tableColumns = useMemo(() => adminClientColumns(), []);

  const { table } = useDataTable({
    data: tableData,
    columns: tableColumns,
    defaultPerPage: limit,
    pageCount,
  });

  // Client-side search & sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState<UserOrderBy>("createdAt");
  const [order, setOrder] = useState<"ASC" | "DESC">("ASC");

  const updateUrl = (
    newParams: Partial<{
      search: string;
      order: "ASC" | "DESC";
      orderBy: UserOrderBy;
    }>
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Faceted filters for status
  const filters: DataTableToolbarFilters[] = [
    {
      columnName: "status",
      title: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  const UserToolbar = (
    <DataTableToolbar<typeof tableData[0], UserOrderBy>
      table={table}
      searchPlaceholder="Search Users"
      filters={filters}
      serverSearchQuery={searchQuery}
      setServerSearchQuery={setSearchQuery}
      order={order}
      setOrder={(o) => {
        setOrder(o!);
        updateUrl({ order: o! });
      }}
      orderBy={orderBy}
      setOrderBy={(ob) => {
        setOrderBy(ob!);
        updateUrl({ orderBy: ob! });
      }}
      sortableFields={VALID_ORDER_BY}
    />
  );

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle title="Users" description="Manage all your users." />
        <CreateClientDialog />
      </DashboardHeader>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-6">{UserToolbar}</div>
          <DataTable table={table} />
        </>
      )}
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
