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

export async function saveFooterSettingsAction(footerData: any) {
  try {
    await requireAuth();
    const settings = jsonDb.getSettings();

    settings.footer = footerData;

    jsonDb.saveSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save Footer Settings Error:", error);
    return { success: false, error: error.message || "Failed to save footer settings." };
  }
}

export async function saveHeaderSettingsAction(headerData: any) {
  try {
    await requireAuth();
    const settings = jsonDb.getSettings();

    settings.header = headerData;

    jsonDb.saveSettings(settings);
    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Save Header Settings Error:", error);
    return { success: false, error: error.message || "Failed to save header settings." };
  }
}

export async function uploadFileAction(formData: FormData) {
  try {
    await requireAuth();
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file selected." };
    }

    const fs = await import("fs");
    const path = await import("path");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename safely
    const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    
    // Ensure public/images/uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    // Return public path
    const publicPath = `/images/uploads/${uniqueName}`;
    return { success: true, url: publicPath };
  } catch (error: any) {
    console.error("Upload File Action Error:", error);
    return { success: false, error: error.message || "Failed to upload file." };
  }
}
