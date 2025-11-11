import { DashboardHeader, DashboardLayout, DashboardTitle } from "@/components/layout/dashboard/layout";
import { ProductsPrimaryButtons } from "@/components/molecules/primary-buttons/products";
import ProductsTable from "@/components/organisms/tables/products-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memes",
  description: "Manage your memes in the dashboard.",
}

export default function ProductsPage() {
  return (
    <DashboardLayout>
      
      <DashboardHeader>
        <DashboardTitle title="Memes" description="Here you can manage all your memes."/>
        <ProductsPrimaryButtons />
      </DashboardHeader>

      {/* <ProductsTable /> */}
    </DashboardLayout>
  )
}