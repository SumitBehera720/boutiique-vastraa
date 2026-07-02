"use server";

import { jsonDb, Review } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access.");
  }
}

export async function getReviewsAction() {
  await requireAuth();
  return jsonDb.getReviews();
}

export async function toggleReviewApprovalAction(reviewId: string) {
  try {
    await requireAuth();
    const reviews = jsonDb.getReviews();
    const review = reviews.find((r) => r.id === reviewId);
    if (review) {
      review.approved = !review.approved;
      jsonDb.saveReviews(reviews);
      revalidatePath("/admin/reviews");
      revalidatePath("/");
      return { success: true, approved: review.approved };
    }
    return { success: false, error: "Review not found" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle review approval." };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    await requireAuth();
    const reviews = jsonDb.getReviews();
    const filtered = reviews.filter((r) => r.id !== reviewId);
    jsonDb.saveReviews(filtered);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete review." };
  }
}

// Storefront action: Submitting review from Product Details page
export async function submitProductReviewAction(formData: {
  productHandle: string;
  author: string;
  rating: number;
  comment: string;
}) {
  try {
    const reviews = jsonDb.getReviews();
    const newReview: Review = {
      id: `review_${Date.now()}`,
      productHandle: formData.productHandle,
      author: formData.author.trim(),
      rating: Number(formData.rating),
      comment: formData.comment.trim(),
      approved: false, // Moderated by default!
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    jsonDb.saveReviews(reviews);
    
    return { 
      success: true, 
      message: "Thank you! Your review has been submitted and is pending moderation." 
    };
  } catch (error: any) {
    console.error("Submit Review Error:", error);
    return { success: false, error: "Failed to submit review. Please try again." };
  }
}
