"use server";

import { jsonDb, Order } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access.");
  }
}

export async function updateOrderStatusAction(orderId: string, status: Order['fulfillmentStatus']) {
  try {
    await requireAuth();

    const order = jsonDb.updateOrderStatus(orderId, status);
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin");
    revalidatePath("/track-order");
    revalidatePath("/account");

    return { success: true, order };
  } catch (error: any) {
    console.error("Update Order Status Error:", error);
    return { success: false, error: error.message || "Failed to update order status." };
  }
}
