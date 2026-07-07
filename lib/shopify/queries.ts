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

export async function getProducts(first = 50) {
  try {
    const res = await apiGet<any[]>("/products", { per_page: String(first) });
    return res.map(formatProduct);
  } catch {
    return [];
  }
}

export async function getCollections(first = 20) {
  try {
    const res = await apiGet<any[]>("/collections", { first: String(first) });
    return res.filter((col: any) => col.handle !== "frontpage");
  } catch {
    return [];
  }
}

export async function getProductByHandle(handle: string) {
  try {
    const res = await apiGet<any>(`/products/${handle}`);
    return formatProduct(res);
  } catch {
    return null;
  }
}

export async function getProductRecommendations(productId: string) {
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
  try {
    const customer = await apiGet<any>("/auth/me");
    return customer;
  } catch {
    return null;
  }
}
