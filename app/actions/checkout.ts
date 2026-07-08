"use server";

import { carts, orders, generateId } from "@/lib/data-store";

function formatCartCheckout(cart: any) {
  let subtotal = 0;
  const lines = (cart.lines || []).map((l: any) => {
    const price = parseFloat(l.price || "0");
    subtotal += price * l.quantity;
    return {
      id: l.id,
      title: l.title,
      variantTitle: l.variantTitle,
      quantity: l.quantity,
      price: l.price,
      image: l.image,
    };
  });
  return {
    id: cart.id,
    lines,
    subtotal: subtotal.toFixed(2),
    totalQuantity: lines.reduce((s: number, l: any) => s + l.quantity, 0),
    checkoutUrl: `/checkout?cartId=${cart.id}`,
  };
}

export async function getCartForCheckoutAction(cartId: string) {
  try {
    const cart = await carts.get(cartId);
    if (!cart) return { success: false, error: "Cart not found" };
    return { success: true, cart: formatCartCheckout(cart) };
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
  discount?: number;
}) {
  try {
    const cart = await carts.get(formData.cartId);
    if (!cart) return { success: false, error: "Cart not found" };

    const orderId = generateId();
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const formatted = formatCartCheckout(cart);

    const order = {
      id: orderId,
      orderNumber,
      customerName: `${formData.firstName} ${formData.lastName}`,
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
      paymentMethod: formData.paymentMethod || "COD",
      lineItems: formatted.lines,
      totalPrice: {
        amount: (parseFloat(formatted.subtotal) - (formData.discount || 0)).toFixed(2),
        currencyCode: "INR",
      },
      fulfillmentStatus: "UNFULFILLED",
      financialStatus: "PENDING",
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const all = await orders.all();
    all.push(order);
    await orders.save(all);
    await carts.remove(formData.cartId);

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "An error occurred while placing your order." };
  }
}

export async function trackOrderAction(orderNumber: string, email: string) {
  try {
    const all = await orders.all();
    const order = all.find((o: any) =>
      String(o.orderNumber) === orderNumber && o.email?.toLowerCase() === email.toLowerCase()
    );
    if (!order) return { success: false, error: "No order found with that number and email combination." };
    return { success: true, order };
  } catch {
    return { success: false, error: "No order found with that number and email combination." };
  }
}

