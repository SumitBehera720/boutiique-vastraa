import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { apiGet } from "@/lib/api/client";
import ReviewsListClient from "@/components/admin/ReviewsListClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Reviews & Feedback | Boutiique Vastraa",
  description: "Approve, moderate, or remove customer feedback and testimonials.",
};

export default async function AdminReviewsPage() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    redirect("/account/login");
  }

  let reviews: any[] = [];
  try { reviews = await apiGet<any[]>("/admin/reviews"); } catch {}

  return (
    <ReviewsListClient 
      initialReviews={reviews} 
    />
  );
}
