const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getCartForCheckout(cartId: string) {
  try {
    const res = await fetch(`${API_URL}/api/cart/${cartId}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Failed to fetch cart");
    }
    const cart = await res.json();
    return { success: true, cart };
  } catch {
    return { success: false, error: "Failed to load checkout cart details" };
  }
}

export async function submitOrder(formData: {
  cartId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  paymentMethod: "COD" | "CARD";
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  promoCode?: string;
}) {
  try {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        cart_id: formData.cartId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          address1: formData.address1,
          address2: formData.address2 || "",
          city: formData.city,
          province: formData.province,
          country: formData.country,
          zip: formData.zip,
        },
        paymentMethod: formData.paymentMethod,
        promoCode: formData.promoCode || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Failed to place order");
    }

    const data = await res.json();
    return {
      success: true,
      orderId: data.id,
      orderNumber: data.orderNumber,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred while placing your order." };
  }
}

export async function trackOrder(orderNumber: string, email: string) {
  try {
    const params = new URLSearchParams({ order_number: orderNumber, email });
    const res = await fetch(`${API_URL}/api/orders/track?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("Order not found");
    const order = await res.json();
    return { success: true, order };
  } catch {
    return { success: false, error: "No order found with that number and email combination." };
  }
}
