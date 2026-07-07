"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { apiPost, apiFetch } from "@/lib/api/client";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) throw new Error("Unauthorized access.");
}

export async function saveSeoSettingsAction(seoData: any) {
  try {
    await requireAuth();
    await apiPost("/admin/settings/seo", seoData);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save SEO settings." };
  }
}

export async function saveBannersSettingsAction(bannersData: any) {
  try {
    await requireAuth();
    await apiPost("/admin/settings/banners", { banners: bannersData });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save homepage banners." };
  }
}

export async function saveHomepageSettingsAction(homepageData: any) {
  try {
    await requireAuth();
    await apiPost("/admin/settings/homepage", { homepage: homepageData });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save homepage settings." };
  }
}

export async function saveFooterSettingsAction(footerData: any) {
  try {
    await requireAuth();
    await apiPost("/admin/settings/footer", { footer: footerData });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save footer settings." };
  }
}

export async function saveHeaderSettingsAction(headerData: any) {
  try {
    await requireAuth();
    await apiPost("/admin/settings/header", { header: headerData });
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save header settings." };
  }
}

export async function uploadFileAction(formData: FormData) {
  try {
    await requireAuth();
    const res = await apiFetch<any>("/admin/upload/file", {
      method: "POST",
      body: formData,
      headers: {},
    });
    return { success: true, url: res.url };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload file." };
  }
}
