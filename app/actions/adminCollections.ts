"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiPost, apiPut, apiDelete } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) throw new Error("Unauthorized access.");
}

export async function deleteCollectionAction(id: string) {
  try {
    await requireAuth();
    await apiDelete(`/admin/collections/${encodeURIComponent(id)}`);
    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete collection." };
  }
}

export async function saveCollectionAction(collectionData: any) {
  try {
    await requireAuth();
    if (!collectionData.title || !collectionData.description) {
      return { success: false, error: "Please fill in Title and Description." };
    }
    if (collectionData.id) {
      const res = await apiPut<any>(`/admin/collections/${encodeURIComponent(collectionData.id)}`, collectionData);
      revalidatePath("/admin/collections");
      revalidatePath(`/collections/${res.handle}`);
      revalidatePath("/collections");
      revalidatePath("/");
      return { success: true, id: res.id, handle: res.handle };
    } else {
      const res = await apiPost<any>("/admin/collections", collectionData);
      revalidatePath("/admin/collections");
      revalidatePath(`/collections/${res.handle}`);
      revalidatePath("/collections");
      revalidatePath("/");
      return { success: true, id: res.id, handle: res.handle };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save collection." };
  }
}
