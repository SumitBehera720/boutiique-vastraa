"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiGet, apiPost, apiPut, apiDelete, apiFetch } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access. Admin session required.");
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    await apiDelete(`/admin/products/${encodeURIComponent(id)}`);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product." };
  }
}

export async function uploadImageAction(formData: FormData) {
  try {
    await requireAuth();
    const token = await import("@/lib/api/client").then(m => m.apiFetch);
    const res = await apiFetch<any>("/admin/upload/image", {
      method: "POST",
      body: formData,
      headers: {},
    });
    return { success: true, url: res.url };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload image." };
  }
}

export async function saveProductAction(productData: any) {
  try {
    await requireAuth();

    if (!productData.title || !productData.price || !productData.description) {
      return { success: false, error: "Please fill in title, price, and description." };
    }

    if (productData.id) {
      const res = await apiPut<any>(`/admin/products/${encodeURIComponent(productData.id)}`, productData);
      revalidatePath("/admin/products");
      revalidatePath(`/products/${res.handle}`);
      revalidatePath("/products");
      revalidatePath("/collections");
      revalidatePath("/");
      return { success: true, id: res.id, handle: res.handle };
    } else {
      const res = await apiPost<any>("/admin/products", productData);
      revalidatePath("/admin/products");
      revalidatePath("/products");
      revalidatePath("/collections");
      revalidatePath("/");
      return { success: true, id: res.id, handle: res.handle };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save product." };
  }
}
