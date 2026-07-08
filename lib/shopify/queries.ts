import { apiGet } from "@/lib/api/client";

function formatProduct(p: any) {
  return {
    ...p,
    variants: p.variants || {
      edges: [
        {
          node: {
            id: `${p.id}-default`,
            title: "Default Title",
            availableForSale: p.availableForSale,
            price: p.priceRange.minVariantPrice,
            compareAtPrice: p.compareAtPriceRange?.minVariantPrice || null,
            selectedOptions: [{ name: "Title", value: "Default Title" }],
          },
        },
      ],
    },
  };
}

// ─── Server-side: call data-store directly (no HTTP round-trip) ──────────────
// Under Phusion Passenger, HOSTNAME/PORT differ from what the Next.js client
// expects, so we bypass HTTP entirely when running on the server.

let _dsReady = false;

async function ensureDs() {
  if (_dsReady) return;
  const { initDataStore } = await import("@/lib/data-store");
  await initDataStore();
  _dsReady = true;
}

async function dsProducts() {
  await ensureDs();
  const { products } = await import("@/lib/data-store");
  return products.all();
}

async function dsCollections() {
  await ensureDs();
  const { collections } = await import("@/lib/data-store");
  return collections.all();
}

// ─── Public query functions ───────────────────────────────────────────────────

export async function getProducts(first = 50) {
  if (typeof window === "undefined") {
    try {
      const items = await dsProducts();
      return items.slice(0, first).map(formatProduct);
    } catch (e) {
      console.error("[getProducts] direct DS error:", e);
      return [];
    }
  }
  try {
    const res = await apiGet<any[]>("/products", { per_page: String(first) });
    return res.map(formatProduct);
  } catch {
    return [];
  }
}

export async function getCollections(first = 20) {
  if (typeof window === "undefined") {
    try {
      const items = await dsCollections();
      return items.filter((col: any) => col.handle !== "frontpage").slice(0, first);
    } catch (e) {
      console.error("[getCollections] direct DS error:", e);
      return [];
    }
  }
  try {
    const res = await apiGet<any[]>("/collections", { first: String(first) });
    return res.filter((col: any) => col.handle !== "frontpage");
  } catch {
    return [];
  }
}

export async function getProductByHandle(handle: string) {
  if (typeof window === "undefined") {
    try {
      const items = await dsProducts();
      const found = items.find((p: any) => p.handle === handle);
      return found ? formatProduct(found) : null;
    } catch (e) {
      console.error("[getProductByHandle] direct DS error:", e);
      return null;
    }
  }
  try {
    const res = await apiGet<any>(`/products/${handle}`);
    return formatProduct(res);
  } catch {
    return null;
  }
}

export async function getProductRecommendations(productId: string) {
  if (typeof window === "undefined") {
    try {
      const items = await dsProducts();
      const others = items.filter((p: any) => p.id !== productId).slice(0, 8);
      return others.map(formatProduct);
    } catch (e) {
      console.error("[getProductRecommendations] direct DS error:", e);
      return [];
    }
  }
  try {
    const res = await apiGet<any[]>(`/products/${productId}/recommendations`);
    return res.map(formatProduct);
  } catch {
    return [];
  }
}

export async function getCollectionByHandle({
  handle,
  filters = [],
  sortKey = "COLLECTION_DEFAULT",
  reverse = false,
  first = 24,
  after = null,
}: {
  handle: string;
  filters?: any[];
  sortKey?: string;
  reverse?: boolean;
  first?: number;
  after?: string | null;
}) {
  if (typeof window === "undefined") {
    try {
      const allCols = await dsCollections();
      const col = allCols.find((c: any) => c.handle === handle);
      const allProds = await dsProducts();
      let colProducts = allProds.filter((p: any) => {
        const colHandles: string[] = Array.isArray(p.collectionHandles)
          ? p.collectionHandles
          : Array.isArray(p.collections)
          ? p.collections
          : [];
        return colHandles.includes(handle) || (col && colHandles.includes(col.id));
      });
      if (colProducts.length === 0) colProducts = allProds;
      const edges = colProducts.slice(0, first).map((p: any) => ({ node: formatProduct(p) }));
      return {
        id: col?.id || handle,
        handle,
        title: col?.title || handle,
        description: col?.description || "",
        image: col?.image || null,
        products: {
          edges,
          pageInfo: { hasNextPage: colProducts.length > first, endCursor: "" },
        },
      };
    } catch (e) {
      console.error("[getCollectionByHandle] direct DS error:", e);
      return null;
    }
  }
  const params: Record<string, string> = {
    first: String(first),
    sort: sortKey,
    reverse: String(reverse),
  };
  if (after) params.after = after;
  if (filters.length > 0) params.filter = JSON.stringify(filters);
  try {
    return await apiGet<any>(`/collections/${handle}`, params);
  } catch {
    return null;
  }
}

export async function searchProducts(query: string, first = 24, after: string | null = null) {
  if (typeof window === "undefined") {
    try {
      const allProds = await dsProducts();
      const q = query.toLowerCase();
      const matched = allProds.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
      const edges = matched.slice(0, first).map((p: any) => ({ node: formatProduct(p) }));
      return {
        edges,
        pageInfo: { hasNextPage: matched.length > first, endCursor: "" },
      };
    } catch (e) {
      console.error("[searchProducts] direct DS error:", e);
      return { edges: [], pageInfo: { hasNextPage: false, endCursor: "" } };
    }
  }
  try {
    const params: Record<string, string> = { q: query, per_page: String(first) };
    if (after) params.after = after;
    const res = await apiGet<any[]>("/products/search", params);
    const edges = res.map((p: any) => ({ node: formatProduct(p) }));
    return {
      edges,
      pageInfo: {
        hasNextPage: res.length >= first,
        endCursor: res.length > 0 ? res[res.length - 1].id : "",
      },
    };
  } catch {
    return { edges: [], pageInfo: { hasNextPage: false, endCursor: "" } };
  }
}

export async function getCustomer(customerAccessToken: string) {
  if (typeof window === "undefined") {
    try {
      const { serverGetAuthUser } = await import("@/lib/server-data");
      const customer = await serverGetAuthUser(customerAccessToken);
      if (!customer) return null;
      await ensureDs();
      const { orders } = await import("@/lib/data-store");
      const userOrders = (await orders.all()).filter((o: any) => o.email?.toLowerCase() === customer.email?.toLowerCase());
      return { ...customer, orders: { edges: userOrders.map((o: any) => ({ node: o })) } };
    } catch (e) {
      console.error("[getCustomer] direct DS error:", e);
      return null;
    }
  }
  try {
    const customer = await apiGet<any>("/auth/me", { _token: customerAccessToken });
    return customer;
  } catch {
    return null;
  }
}


