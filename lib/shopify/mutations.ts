import { apiPost, apiPut, apiDelete, apiGet } from "@/lib/api/client";

function formatCart(cart: any) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: `/checkout?cartId=${cart.id}`,
    totalQuantity: cart.totalQuantity ?? cart.lines?.edges?.reduce((s: number, e: any) => s + e.node.quantity, 0) ?? 0,
    cost: cart.cost ?? {
      subtotalAmount: { amount: "0.00", currencyCode: "INR" },
    },
    lines: cart.lines ?? { edges: [] },
  };
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[] = []) {
  const cart = await apiPost<any>("/cart", { lines });
  return formatCart(cart);
}

export async function addToCart(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const cart = await apiPost<any>(`/cart/${cartId}/lines`, { lines });
  return formatCart(cart);
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  const cart = await apiPut<any>(`/cart/${cartId}/lines`, { lines });
  return formatCart(cart);
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const cart = await apiDelete<any>(`/cart/${cartId}/lines?lineIds=${encodeURIComponent(JSON.stringify(lineIds))}`);
  return formatCart(cart);
}

export async function getCart(cartId: string) {
  const cart = await apiGet<any>(`/cart/${cartId}`);
  return formatCart(cart);
}

export async function createCustomer(input: { firstName: string; lastName: string; email: string; password: string }) {
  try {
    const res = await apiPost<any>("/auth/register", input);
    return {
      customer: { id: res.customer?.id ?? res.id },
      customerUserErrors: [],
    };
  } catch (err: any) {
    const data = err.data;
    const message = data?.errors?.email?.[0] || data?.message || "Registration failed";
    return {
      customer: null,
      customerUserErrors: [{ code: "TAKEN", field: ["email"], message }],
    };
  }
}

export async function createCustomerAccessToken(input: { email: string; password: string }) {
  try {
    const res = await apiPost<any>("/auth/login", input);
    return {
      customerAccessToken: {
        accessToken: res.token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      customerUserErrors: [],
    };
  } catch (err: any) {
    const data = err.data;
    const message = data?.errors?.email?.[0] || data?.message || "Invalid credentials";
    return {
      customerAccessToken: null,
      customerUserErrors: [{ code: "UNAUTHORIZED", field: ["email", "password"], message }],
    };
  }
}
