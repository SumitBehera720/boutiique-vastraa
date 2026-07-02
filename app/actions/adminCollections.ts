"use server";

import { jsonDb, Collection } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access.");
  }
}

export async function deleteCollectionAction(id: string) {
  try {
    await requireAuth();
    
    const collections = jsonDb.getCollections();
    const filtered = collections.filter(c => c.id !== id);
    
    if (collections.length === filtered.length) {
      return { success: false, error: "Collection not found." };
    }
    
    jsonDb.saveCollections(filtered);
    revalidatePath("/admin/collections");
    revalidatePath("/collections");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete Collection Error:", error);
    return { success: false, error: error.message || "Failed to delete collection." };
  }
}

export async function saveCollectionAction(collectionData: {
  id?: string;
  title: string;
  handle?: string;
  description: string;
  imageUrl?: string;
}) {
  try {
    await requireAuth();

    if (!collectionData.title || !collectionData.description) {
      return { success: false, error: "Please fill in Title and Description." };
    }

    const collections = jsonDb.getCollections();
    const handle = collectionData.handle || collectionData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check handle collision
    const existing = collections.find(c => c.handle === handle && c.id !== collectionData.id);
    if (existing) {
      return { success: false, error: `Collection handle "${handle}" already exists.` };
    }

    const isEdit = !!collectionData.id;
    let target: Collection;

    const formattedImage = collectionData.imageUrl ? {
      url: collectionData.imageUrl,
      altText: collectionData.title
    } : null;

    if (isEdit) {
      const idx = collections.findIndex(c => c.id === collectionData.id);
      if (idx === -1) {
        return { success: false, error: "Collection not found." };
      }

      target = {
        ...collections[idx],
        title: collectionData.title,
        handle,
        description: collectionData.description,
        image: formattedImage
      };

      collections[idx] = target;
    } else {
      target = {
        id: `gid://shopify/Collection/${Date.now()}`,
        title: collectionData.title,
        handle,
        description: collectionData.description,
        image: formattedImage
      };
      collections.push(target);
    }

    jsonDb.saveCollections(collections);
    revalidatePath("/admin/collections");
    revalidatePath(`/collections/${handle}`);
    revalidatePath("/collections");
    revalidatePath("/");

    return { success: true, id: target.id, handle: target.handle };
  } catch (error: any) {
    console.error("Save Collection Error:", error);
    return { success: false, error: error.message || "Failed to save collection." };
  }
}
