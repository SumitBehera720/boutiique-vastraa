"use server";

import { jsonDb, Product } from "@/lib/db/jsonDb";
import { verifyAdminSession } from "./adminAuth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

// Helper to check authentication
async function requireAuth() {
  const isLogged = await verifyAdminSession();
  if (!isLogged) {
    throw new Error("Unauthorized access. Admin session required.");
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAuth();
    
    const products = jsonDb.getProducts();
    const filtered = products.filter(p => p.id !== id);
    
    if (products.length === filtered.length) {
      return { success: false, error: "Product not found." };
    }
    
    jsonDb.saveProducts(filtered);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/collections");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete Product Action Error:", error);
    return { success: false, error: error.message || "Failed to delete product." };
  }
}

export async function uploadImageAction(formData: FormData) {
  try {
    await requireAuth();
    
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads folder exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique name
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    return { success: true, url: imageUrl };
  } catch (error: any) {
    console.error("Upload Image Action Error:", error);
    return { success: false, error: error.message || "Failed to upload image." };
  }
}

export async function saveProductAction(productData: {
  id?: string;
  title: string;
  handle?: string;
  description: string;
  descriptionHtml?: string;
  price: string;
  compareAtPrice?: string;
  images: string[]; // List of image URLs
  options: { name: string; values: string[] }[];
  variants: {
    title: string;
    price: string;
    compareAtPrice?: string;
    selectedOptions: { name: string; value: string }[];
  }[];
  tags: string[];
  collectionHandles: string[];
  inventory: number;
}) {
  try {
    await requireAuth();

    if (!productData.title || !productData.price || !productData.description) {
      return { success: false, error: "Please fill in title, price, and description." };
    }

    const products = jsonDb.getProducts();
    const handle = productData.handle || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check handle collision
    const existingWithHandle = products.find(p => p.handle === handle && p.id !== productData.id);
    if (existingWithHandle) {
      return { success: false, error: `Product handle "${handle}" is already in use by another product.` };
    }

    const isEdit = !!productData.id;
    let targetProduct: Product;

    // Build the format expected by the frontend
    const priceRange = {
      minVariantPrice: {
        amount: parseFloat(productData.price).toFixed(2),
        currencyCode: "INR"
      }
    };

    const compareAtPriceRange = {
      minVariantPrice: {
        amount: productData.compareAtPrice ? parseFloat(productData.compareAtPrice).toFixed(2) : parseFloat(productData.price).toFixed(2),
        currencyCode: "INR"
      }
    };

    const formattedImages = {
      edges: productData.images.map(url => ({
        node: {
          url,
          altText: productData.title
        }
      }))
    };

    const formattedVariants = {
      edges: productData.variants.map((v, idx) => ({
        node: {
          id: v.selectedOptions.length > 0 
            ? `${isEdit ? productData.id : "new"}-variant-${idx}-${v.selectedOptions.map(o => o.value).join("-").replace(/\s+/g, "-")}`
            : `${isEdit ? productData.id : "new"}-variant-default`,
          title: v.title || "Default Title",
          availableForSale: productData.inventory > 0,
          price: {
            amount: parseFloat(v.price).toFixed(2),
            currencyCode: "INR"
          },
          compareAtPrice: v.compareAtPrice ? {
            amount: parseFloat(v.compareAtPrice).toFixed(2),
            currencyCode: "INR"
          } : null,
          selectedOptions: v.selectedOptions,
          image: productData.images[0] ? { url: productData.images[0] } : null
        }
      }))
    };

    // If variants array is empty, create a default one
    if (formattedVariants.edges.length === 0) {
      formattedVariants.edges.push({
        node: {
          id: isEdit ? `${productData.id}-variant-default` : `variant-${Date.now()}-default`,
          title: "Default Title",
          availableForSale: productData.inventory > 0,
          price: priceRange.minVariantPrice,
          compareAtPrice: productData.compareAtPrice ? compareAtPriceRange.minVariantPrice : null,
          selectedOptions: [{ name: "Standard", value: "Default Title" }],
          image: productData.images[0] ? { url: productData.images[0] } : null
        }
      });
    }

    if (isEdit) {
      const idx = products.findIndex(p => p.id === productData.id);
      if (idx === -1) {
        return { success: false, error: "Product not found to edit." };
      }

      targetProduct = {
        ...products[idx],
        title: productData.title,
        handle,
        description: productData.description,
        descriptionHtml: productData.descriptionHtml || `<p>${productData.description}</p>`,
        availableForSale: productData.inventory > 0,
        priceRange,
        compareAtPriceRange,
        images: formattedImages,
        options: productData.options.length > 0 ? productData.options : [{ name: "Standard", values: ["Default Title"] }],
        variants: formattedVariants,
        tags: productData.tags,
        collectionHandles: productData.collectionHandles,
        inventory: productData.inventory
      };

      // Correct variant IDs to use the actual product ID
      targetProduct.variants.edges.forEach((edge: any, vIdx: number) => {
        if (edge.node.id.startsWith("new-variant-") || edge.node.id.startsWith("variant-")) {
          edge.node.id = `${productData.id}-variant-${vIdx}`;
        }
      });

      products[idx] = targetProduct;
    } else {
      const newId = `gid://shopify/Product/${Date.now()}`;
      
      targetProduct = {
        id: newId,
        title: productData.title,
        handle,
        description: productData.description,
        descriptionHtml: productData.descriptionHtml || `<p>${productData.description}</p>`,
        availableForSale: productData.inventory > 0,
        priceRange,
        compareAtPriceRange,
        images: formattedImages,
        options: productData.options.length > 0 ? productData.options : [{ name: "Standard", values: ["Default Title"] }],
        variants: formattedVariants,
        tags: productData.tags,
        collectionHandles: productData.collectionHandles,
        inventory: productData.inventory
      };

      // Correct variant IDs to use the newly generated product ID
      targetProduct.variants.edges.forEach((edge: any, vIdx: number) => {
        edge.node.id = `${newId}-variant-${vIdx}`;
      });

      products.push(targetProduct);
    }

    jsonDb.saveProducts(products);
    
    // Clear next caches
    revalidatePath("/admin/products");
    revalidatePath(`/products/${handle}`);
    revalidatePath("/products");
    revalidatePath("/collections");
    revalidatePath("/");

    return { success: true, id: targetProduct.id, handle: targetProduct.handle };
  } catch (error: any) {
    console.error("Save Product Action Error:", error);
    return { success: false, error: error.message || "Failed to save product." };
  }
}
