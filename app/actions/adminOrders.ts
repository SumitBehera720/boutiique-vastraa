"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiPatch } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) throw new Error("Unauthorized access.");
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await requireAuth();
    const res = await apiPatch<any>(`/admin/orders/${encodeURIComponent(orderId)}/status`, { status });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    revalidatePath("/track-order");
    revalidatePath("/account");
    return { success: true, order: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status." };
  }
}
