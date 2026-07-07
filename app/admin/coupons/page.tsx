import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import CouponsListClient from "@/components/admin/CouponsListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Coupon Codes | Boutiique Vastraa",
  description: "Create, activate, or toggle pricing promo codes for checkout.",
};

export default async function AdminCouponsPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  const coupons = await apiGet<any[]>("/admin/coupons");

  return (
    <CouponsListClient 
      initialCoupons={coupons} 
    />
  );
}
