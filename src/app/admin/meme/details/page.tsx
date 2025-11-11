import { FormPageLayout } from "@/components/layout/form-page-layout/layout";
import ProductDetailsForm from "@/components/organisms/forms/dashboard/products/product-details";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme Details",
  description: "Here you can see the details for a Meme"
}

export default function ProductDetailsPage() {
  return (
    <FormPageLayout>
      <ProductDetailsForm />
    </FormPageLayout>
  )
}