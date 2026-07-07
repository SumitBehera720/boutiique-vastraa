import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect, notFound } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import OrderDetailClient from "@/components/admin/OrderDetailClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Details | Boutiique Vastraa",
  description: "Fulfillment invoice and shipping receipt.",
};

export default async function AdminOrderDetailPage({
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

  let orders: any[] = [];
  try { orders = await apiGet<any[]>("/admin/orders"); } catch {}
  const order = orders.find(o => o.id === id);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailClient 
      order={order} 
    />
  );
}
