"use client";

import { useMemo, Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { adminClientColumns } from "@/components/data-table/columns/admin-clients-columns";
import { DataTable } from "@/components/data-table/data-table";
import {
    DashboardHeader,
    DashboardLayout,
    DashboardTitle,
} from "@/components/layout/dashboard/layout";
import { useDataTable } from "@/hooks/use-data-table";
import { UsersTableSkeleton } from "@/components/data-table/skeletons/user-skeleton";
import { CreateClientDialog } from "@/components/dialog/create-user";
import { useGetUsersQuery } from "@/redux/services/user";
import {
    DataTableToolbar,
    DataTableToolbarFilters,
} from "@/components/data-table/data-table-toolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { User } from "@/utils/dtos/user.dto";

type UserOrderBy = "createdAt" | "updatedAt" | "firstName" | "lastName" | "email";
const VALID_ORDER_BY = ["createdAt", "updatedAt", "firstName", "lastName", "email"] as const;

const SEARCH_FIELDS = ["firstName", "lastName", "email"] as const;
type SearchField = (typeof SEARCH_FIELDS)[number];

const ROLE_ADMIN_VALUE = 1;

export default function UsersPage() {
    return (
        <Suspense fallback={<UsersTableSkeleton />}>
            <UsersContent />
        </Suspense>
    );
}

function UsersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "10";
    const rawOrderBy = searchParams.get("orderBy") ?? "createdAt";
    const rawOrder = (searchParams.get("order") ?? "DESC").toUpperCase() as "ASC" | "DESC";

    const rawFirst = searchParams.get("firstName") ?? "";
    const rawLast = searchParams.get("lastName") ?? "";
    const rawEmail = searchParams.get("email") ?? "";
    const rawStatus = searchParams.get("status") ?? "";
    const rawRole = searchParams.get("role") ?? "";

    const page = Math.max(1, parseInt(rawPage));
    const limit = Math.min(50, Math.max(1, parseInt(rawLimit)));

    const activeField =
        rawFirst ? "firstName" :
        rawLast ? "lastName" :
        rawEmail ? "email" :
        "firstName" as SearchField;

    const initialSearch = rawFirst || rawLast || rawEmail;

    const [searchField, setSearchField] = useState<SearchField>(activeField);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    const debouncedSearch = useDebounce(searchQuery, 600);

    const statusNumber =
        rawStatus === "1" ? 1 :
        rawStatus === "2" ? 2 :
        undefined;
    
    const roleNumber =
        rawRole === String(ROLE_ADMIN_VALUE) ? ROLE_ADMIN_VALUE :
        undefined;

    const queryParams = useMemo(() => {
        const params: Record<string, any> = { page, limit, orderBy: rawOrderBy, order: rawOrder };
        if (debouncedSearch) params[searchField] = debouncedSearch;
        if (statusNumber !== undefined) params.status = statusNumber;
        if (roleNumber !== undefined) params.role = roleNumber;
        return params;
    }, [page, limit, rawOrderBy, rawOrder, debouncedSearch, searchField, statusNumber, roleNumber]);

    const { data, isLoading } = useGetUsersQuery(queryParams);

    const updateUrl = useCallback(
        (newParams: Partial<{ firstName: string; lastName: string; email: string; status: string; role: string }>) => {
            const params = new URLSearchParams(searchParams.toString());
            
            SEARCH_FIELDS.forEach((f) => params.delete(f));
            if (newParams.firstName) params.set("firstName", newParams.firstName);
            if (newParams.lastName) params.set("lastName", newParams.lastName);
            if (newParams.email) params.set("email", newParams.email);
            
            if (newParams.status !== undefined) {
                if (newParams.status === "") params.delete("status");
                else params.set("status", newParams.status);
            }
            if (newParams.role !== undefined) {
                if (newParams.role === "") params.delete("role");
                else params.set("role", newParams.role);
            }

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, router, pathname]
    );

    useEffect(() => {
        updateUrl({ [searchField]: debouncedSearch });
    }, [debouncedSearch, searchField, updateUrl]);

    const rawTableData = (data?.data ?? []) as User[];
    const tableData = rawTableData.map((user: User) => ({
        ...user,
        status: user.status?.name?.toLowerCase() ?? "",
    }));

    const pageCount = data?.meta?.totalPages ?? 0;
    const tableColumns = useMemo(() => adminClientColumns(), []);
    const { table } = useDataTable({
        data: tableData,
        columns: tableColumns,
        defaultPerPage: limit,
        pageCount,
    });

    const filters: DataTableToolbarFilters[] = [
        {
            columnName: "status",
            title: "Status",
            options: [
                { label: "Active", value: "1" },
                { label: "Inactive", value: "2" },
            ],
            onChange: (selected) => {
                const statusValue = selected.includes("1") ? "1" : selected.includes("2") ? "2" : "";
                updateUrl({ status: statusValue, role: "" });
            },
        },
        {
            columnName: "role",
            title: "Role",
            options: [
                { label: "Admin Only", value: String(ROLE_ADMIN_VALUE) },
            ],
            onChange: (selected) => {
                const roleValue = selected.includes(String(ROLE_ADMIN_VALUE)) ? String(ROLE_ADMIN_VALUE) : "";
                updateUrl({ role: roleValue, status: "" });
            },
        },
    ];

    const handleReset = () => {
        table.resetColumnFilters();
        setSearchQuery("");
        updateUrl({ status: "", role: "" }); 
    };
    
    const UserToolbar = (
        <DataTableToolbar<typeof tableData[0], UserOrderBy>
            table={table}
            searchPlaceholder={`Search by ${searchField}`}
            filters={filters}
            serverSearchQuery={searchQuery}
            setServerSearchQuery={setSearchQuery}
            searchFieldOptions={SEARCH_FIELDS}
            searchField={searchField}
            setSearchField={setSearchField}
            order={rawOrder}
            setOrder={() => {}}
            orderBy={rawOrderBy as UserOrderBy}
            setOrderBy={() => {}}
            sortableFields={VALID_ORDER_BY}
            onReset={handleReset}
        />
    );

    return (
        <DashboardLayout>
            <DashboardHeader>
                <DashboardTitle title="Users" description="Manage all your users." />
                <CreateClientDialog />
            </DashboardHeader>
            {isLoading ? (
                <UsersTableSkeleton />
            ) : (
                <>
                    <div className="mb-6">{UserToolbar}</div>
                    <DataTable table={table} />
                </>
            )}
        </DashboardLayout>
    );
}