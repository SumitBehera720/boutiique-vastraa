"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiGet, apiPatch, apiDelete, apiPost } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) throw new Error("Unauthorized access.");
}

export async function getReviewsAction() {
  await requireAuth();
  return apiGet<any[]>("/admin/reviews");
}

export async function toggleReviewApprovalAction(reviewId: string) {
  try {
    await requireAuth();
    const res = await apiPatch<any>(`/admin/reviews/${encodeURIComponent(reviewId)}/toggle-approval`);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true, approved: res.approved };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle review approval." };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    await requireAuth();
    await apiDelete(`/admin/reviews/${encodeURIComponent(reviewId)}`);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete review." };
  }
}

export async function submitProductReviewAction(formData: {
  productHandle: string;
  author: string;
  rating: number;
  comment: string;
}) {
  try {
    await apiPost("/reviews", {
      product_id: formData.productHandle,
      reviewer_name: formData.author,
      rating: formData.rating,
      comment: formData.comment,
    });
    return {
      success: true,
      message: "Thank you! Your review has been submitted and is pending moderation.",
    };
  } catch (error: any) {
    return { success: false, error: "Failed to submit review. Please try again." };
  }
}
