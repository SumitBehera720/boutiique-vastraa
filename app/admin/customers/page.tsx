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

  const customers = await apiGet<any[]>("/admin/customers");
  const orders = await apiGet<any[]>("/admin/orders");

  return (
    <CustomersListClient 
      customers={customers} 
      orders={orders} 
    />
  );
}
