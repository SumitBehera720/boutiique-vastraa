"use server";

import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access. Admin session required.");
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    const { products } = await import("@/lib/data-store");
    const all = await products.all();
    const filtered = all.filter((p: any) => p.id !== id);
    await products.save(filtered);
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
    const file = formData.get("file") || formData.get("image");
    if (!(file instanceof File)) throw new Error("No file uploaded");
    
    const ext = file.name.split(".").pop() || "png";
    const fileName = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const publicDir = path.join(process.cwd(), "public", "images");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, fileName), buffer);
    return { success: true, url: `/images/${fileName}` };
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

    const { products, generateId } = await import("@/lib/data-store");
    const all = await products.all();

    let id = productData.id;
    let handle = productData.handle;

    if (id) {
      const idx = all.findIndex((p: any) => p.id === id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...productData };
      }
    } else {
      id = generateId();
      if (!handle) {
        handle = productData.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      const newProduct = {
        ...productData,
        id,
        handle,
        createdAt: new Date().toISOString(),
      };
      all.push(newProduct);
    }

    await products.save(all);

    revalidatePath("/admin/products");
    revalidatePath(`/products/${handle}`);
    revalidatePath("/products");
    revalidatePath("/collections");
    revalidatePath("/");
    
    return { success: true, id, handle };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save product." };
  }
}

