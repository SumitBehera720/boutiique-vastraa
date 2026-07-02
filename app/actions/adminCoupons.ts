"use server";

import { jsonDb, Coupon } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access.");
  }
}

export async function getCouponsAction() {
  await requireAuth();
  return jsonDb.getCoupons();
}

export async function saveCouponAction(couponData: Omit<Coupon, "id"> & { id?: string }) {
  try {
    await requireAuth();
    const coupons = jsonDb.getCoupons();

    if (couponData.id) {
      // Edit
      const index = coupons.findIndex((c) => c.id === couponData.id);
      if (index !== -1) {
        coupons[index] = {
          ...coupons[index],
          code: couponData.code.toUpperCase().trim(),
          type: couponData.type,
          value: Number(couponData.value),
          active: couponData.active,
          minPurchaseAmount: Number(couponData.minPurchaseAmount || 0),
        };
      }
    } else {
      // Create new
      const newCoupon: Coupon = {
        id: `coupon_${Date.now()}`,
        code: couponData.code.toUpperCase().trim(),
        type: couponData.type,
        value: Number(couponData.value),
        active: couponData.active,
        minPurchaseAmount: Number(couponData.minPurchaseAmount || 0),
      };
      coupons.push(newCoupon);
    }

    jsonDb.saveCoupons(coupons);
    revalidatePath("/admin/coupons");
    revalidatePath("/checkout");
    return { success: true };
  } catch (error: any) {
    console.error("Save Coupon Error:", error);
    return { success: false, error: error.message || "Failed to save coupon." };
  }
}

export async function toggleCouponAction(couponId: string) {
  try {
    await requireAuth();
    const coupons = jsonDb.getCoupons();
    const coupon = coupons.find((c) => c.id === couponId);
    if (coupon) {
      coupon.active = !coupon.active;
      jsonDb.saveCoupons(coupons);
      revalidatePath("/admin/coupons");
      return { success: true, active: coupon.active };
    }
    return { success: false, error: "Coupon not found" };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle coupon." };
  }
}

export async function deleteCouponAction(couponId: string) {
  try {
    await requireAuth();
    const coupons = jsonDb.getCoupons();
    const filtered = coupons.filter((c) => c.id !== couponId);
    jsonDb.saveCoupons(filtered);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon." };
  }
}

// Validation server action for checkout page
export async function applyPromoCodeAction(code: string, subtotal: number) {
  try {
    const coupon = jsonDb.getCouponByCode(code.trim());
    
    if (!coupon) {
      return { success: false, error: "Invalid or expired promo code." };
    }
    
    if (!coupon.active) {
      return { success: false, error: "This promo code is currently inactive." };
    }

    if (subtotal < coupon.minPurchaseAmount) {
      return { 
        success: false, 
        error: `This code requires a minimum purchase amount of ₹${coupon.minPurchaseAmount.toLocaleString('en-IN')}.` 
      };
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    // Limit discount to subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return { 
      success: true, 
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount 
    };
  } catch (error: any) {
    console.error("Apply Promo Error:", error);
    return { success: false, error: "Failed to apply promo code." };
  }
}
