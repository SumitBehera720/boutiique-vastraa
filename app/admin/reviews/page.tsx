import { verifyAdminSession } from "@/app/actions/adminAuth";
import { redirect } from "next/navigation";
import { jsonDb } from "@/lib/db/jsonDb";
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

  const reviews = jsonDb.getReviews();

  return (
    <ReviewsListClient 
      initialReviews={reviews} 
    />
  );
}
