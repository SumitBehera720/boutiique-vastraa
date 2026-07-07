"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) throw new Error("Unauthorized access.");
}

export async function getCouponsAction() {
  try {
    await requireAuth();
    return await apiGet<any[]>("/admin/coupons");
  } catch {
    return [];
  }
}

export async function saveCouponAction(couponData: any) {
  try {
    await requireAuth();
    if (couponData.id) {
      await apiPost(`/admin/coupons`, couponData);
    } else {
      await apiPost("/admin/coupons", couponData);
    }
    revalidatePath("/admin/coupons");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save coupon." };
  }
}

export async function toggleCouponAction(couponId: string) {
  try {
    await requireAuth();
    const res = await apiPatch<any>(`/admin/coupons/${encodeURIComponent(couponId)}/toggle`);
    revalidatePath("/admin/coupons");
    return { success: true, active: res.active };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle coupon." };
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    await requireAuth();
    await apiDelete(`/admin/coupons/${encodeURIComponent(couponId)}`);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon." };
  }
}

export async function applyPromoCodeAction(code: string, subtotal: number) {
  try {
    const res = await apiPost<any>("/coupons/validate", { code: code.trim(), cart_subtotal: subtotal });
    return {
      success: true,
      code: res.code,
      type: res.type,
      value: res.value,
      discountAmount: res.discountAmount,
    };
  } catch (err: any) {
    const msg = err.data?.message || err.message || "Failed to apply promo code.";
    return { success: false, error: msg };
  }
}
