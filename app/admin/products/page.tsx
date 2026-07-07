import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";
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

  const products = await apiGet<any[]>("/admin/products");
  const collections = await apiGet<any[]>("/admin/collections");

  return (
    <ProductsListClient 
      initialProducts={products} 
      collections={collections} 
    />
  );
}
