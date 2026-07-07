import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect, notFound } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import ProductFormClient from "@/components/admin/ProductFormClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Product | Boutiique Vastraa",
  description: "Modify an existing product listing.",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Search by exact ID or Shopify GID
  let products: any[] = [];
  try { products = await apiGet<any[]>("/admin/products"); } catch {}
  const product = products.find(
    p => p.id === id || p.id === `gid://shopify/Product/${id}`
  );

  if (!product) {
    notFound();
  }

  let collections: any[] = [];
  try { collections = await apiGet<any[]>("/admin/collections"); } catch {}

  return (
    <ProductFormClient 
      product={product} 
      collections={collections} 
    />
  );
}
