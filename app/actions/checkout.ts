"use server";

import { apiGet, apiPost, apiFetch } from "@/lib/api/client";

export async function getCartForCheckoutAction(cartId: string) {
  try {
    const cart = await apiGet<any>(`/cart/${cartId}`);
    return { success: true, cart };
  } catch (error) {
    return { success: false, error: "Failed to load checkout cart details" };
  }
}

export async function submitOrderAction(formData: {
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
    const res = await apiPost<any>("/orders", {
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
    });

    return {
      success: true,
      orderId: res.id,
      orderNumber: res.orderNumber,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred while placing your order." };
  }
}

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const order = await apiGet<any>("/orders/track", {
      order_number: orderNumber,
      email,
    });
    return { success: true, order };
  } catch {
    return { success: false, error: "No order found with that number and email combination." };
  }
}
