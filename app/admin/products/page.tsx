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

  let products: any[] = [];
  let collections: any[] = [];
  try { products = await apiGet<any[]>("/admin/products"); } catch {}
  try { collections = await apiGet<any[]>("/admin/collections"); } catch {}

  return (
    <ProductsListClient 
      initialProducts={products} 
      collections={collections} 
    />
  );
}
