"use server";

import { jsonDb, Settings } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access.");
  }
}

export async function saveSeoSettingsAction(seoData: Settings["seo"]) {
  try {
    await requireAuth();
    const settings = jsonDb.getSettings();

    settings.seo = {
      titleTemplate: seoData.titleTemplate.trim(),
      defaultDescription: seoData.defaultDescription.trim(),
      keywords: seoData.keywords.trim(),
    };

    jsonDb.saveSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save SEO Settings Error:", error);
    return { success: false, error: error.message || "Failed to save SEO settings." };
  }
}

export async function saveBannersSettingsAction(bannersData: Settings["banners"]) {
  try {
    await requireAuth();
    const settings = jsonDb.getSettings();

    settings.banners = bannersData.map((b) => ({
      id: b.id || `slide_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      imageUrl: b.imageUrl.trim(),
      title: b.title.trim(),
      subtitle: b.subtitle.trim(),
      buttonText: b.buttonText.trim(),
      link: b.link.trim(),
    }));

    jsonDb.saveSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save Banners Error:", error);
    return { success: false, error: error.message || "Failed to save homepage banners." };
  }
}

export async function saveHomepageSettingsAction(homepageData: any) {
  try {
    await requireAuth();
    const settings = jsonDb.getSettings();

    settings.homepage = homepageData;

    jsonDb.saveSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save Homepage Settings Error:", error);
    return { success: false, error: error.message || "Failed to save homepage settings." };
  }
}
