import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import OrdersListClient from "@/components/admin/OrdersListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Orders | Boutiique Vastraa",
  description: "Fulfillment center and billing records for customer transactions.",
};

export default async function AdminOrdersPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const orders = await apiGet<any[]>("/admin/orders");

  return (
    <OrdersListClient 
      initialOrders={orders} 
    />
  );
}
