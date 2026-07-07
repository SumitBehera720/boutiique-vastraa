import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import CustomersListClient from "@/components/admin/CustomersListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers Directory | Boutiique Vastraa",
  description: "Customer registers, purchase counts, and lifetime value records.",
};

export default async function AdminCustomersPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  let customers: any[] = [];
  let orders: any[] = [];
  try { customers = await apiGet<any[]>("/admin/customers"); } catch {}
  try { orders = await apiGet<any[]>("/admin/orders"); } catch {}

  return (
    <CustomersListClient 
      customers={customers} 
      orders={orders} 
    />
  );
}
