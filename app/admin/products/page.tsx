import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { jsonDb } from "@/lib/db/jsonDb";
import ProductsListClient from "@/components/admin/ProductsListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Products | Boutiique Vastraa",
  description: "Products management portal for Boutiique Vastraa staff.",
};

export default async function AdminProductsPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const products = jsonDb.getProducts();
  const collections = jsonDb.getCollections();

  return (
    <ProductsListClient 
      initialProducts={products} 
      collections={collections} 
    />
  );
}
