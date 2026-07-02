import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { jsonDb } from "@/lib/db/jsonDb";
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

  const customers = jsonDb.getCustomers();
  const orders = jsonDb.getOrders();

  return (
    <CustomersListClient 
      customers={customers} 
      orders={orders} 
    />
  );
}
