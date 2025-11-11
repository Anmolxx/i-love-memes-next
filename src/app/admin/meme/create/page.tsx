import { FormPageLayout } from "@/components/layout/form-page-layout/layout";
import ProductForm from "@/components/organisms/forms/dashboard/products/product-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Memes",
  description: "Here you can create your new Memes and Meme Templates."
}

export default function ProductCreatePage() {
  return (
    <FormPageLayout>
      <ProductForm />
    </FormPageLayout>
  )
}