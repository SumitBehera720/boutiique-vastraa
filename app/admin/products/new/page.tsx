import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { jsonDb } from "@/lib/db/jsonDb";
import ProductFormClient from "@/components/admin/ProductFormClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product | Boutiique Vastraa",
  description: "List a new handcrafted saree or ethnic apparel.",
};

export default async function AdminNewProductPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const collections = jsonDb.getCollections();

  return (
    <ProductFormClient 
      collections={collections} 
    />
  );
}
